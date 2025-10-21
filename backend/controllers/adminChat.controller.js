import { GoogleGenAI } from "@google/genai";
import doctorModel from "../models/doctor.model.js";
import appointmentModel from "../models/appointment.model.js";
import userModel from "../models/user.model.js";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Database schema information for Gemini
const schemaInfo = {
  doctors: {
    collection: "doctors",
    fields: ["name", "email", "speciality", "degree", "experience", "about", "available", "fees", "address", "slots_booked"],
    description: "Contains doctor information including their speciality, fees, experience, and availability"
  },
  appointments: {
    collection: "appointments",
    fields: ["docId (references Doctor)", "userId (references User)", "slotDate", "slotTime", "amount", "cancelled", "payment", "isCompleted"],
    description: "Contains appointment bookings between doctors and patients"
  },
  users: {
    collection: "users",
    fields: ["name", "email", "phone", "address", "gender", "dob"],
    description: "Contains patient/user information"
  }
};

// Predefined database query functions
const databaseFunctions = {
  getDoctorsWithMostPatients: async () => {
    try {
      const result = await appointmentModel.aggregate([
        {
          $group: {
            _id: "$docId",
            patientCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: doctorModel.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        {
          $unwind: "$doctorInfo",
        },
        {
          $project: {
            doctorName: "$doctorInfo.name",
            speciality: "$doctorInfo.speciality",
            patientCount: 1,
            fees: "$doctorInfo.fees",
            experience: "$doctorInfo.experience",
          },
        },
        {
          $sort: { patientCount: -1 },
        },
      ]);
      return result;
    } catch (error) {
      throw new Error(`Error getting doctors with most patients: ${error.message}`);
    }
  },

  getTotalStatistics: async () => {
    try {
      const doctorCount = await doctorModel.countDocuments();
      const patientCount = await userModel.countDocuments();
      const appointmentCount = await appointmentModel.countDocuments();
      const cancelledCount = await appointmentModel.countDocuments({ cancelled: true });
      const activeCount = appointmentCount - cancelledCount;

      return {
        totalDoctors: doctorCount,
        totalPatients: patientCount,
        totalAppointments: appointmentCount,
        activeAppointments: activeCount,
        cancelledAppointments: cancelledCount,
      };
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  },

  getDoctorsBySpeciality: async (speciality = null) => {
    try {
      let query = {};
      if (speciality) {
        query = { speciality: new RegExp(speciality, "i") };
      }

      const result = await doctorModel.aggregate([
        ...(Object.keys(query).length > 0 ? [{ $match: query }] : []),
        {
          $group: {
            _id: "$speciality",
            count: { $sum: 1 },
            doctors: {
              $push: {
                name: "$name",
                fees: "$fees",
                experience: "$experience",
                available: "$available",
              },
            },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);
      return result;
    } catch (error) {
      throw new Error(`Error getting doctors by speciality: ${error.message}`);
    }
  },

  getRecentAppointments: async (limit = 10) => {
    try {
      const appointments = await appointmentModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("docId", "name speciality fees")
        .populate("userId", "name email");
      return appointments;
    } catch (error) {
      throw new Error(`Error getting recent appointments: ${error.message}`);
    }
  },

  getRevenueData: async () => {
    try {
      const overall = await appointmentModel.aggregate([
        {
          $match: { cancelled: false },
        },
        {
          $lookup: {
            from: doctorModel.collection.name,
            localField: "docId",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        {
          $unwind: "$doctorInfo",
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$doctorInfo.fees" },
            totalAppointments: { $sum: 1 },
          },
        },
      ]);

      const revenueByDoctor = await appointmentModel.aggregate([
        {
          $match: { cancelled: false },
        },
        {
          $lookup: {
            from: doctorModel.collection.name,
            localField: "docId",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        {
          $unwind: "$doctorInfo",
        },
        {
          $group: {
            _id: "$docId",
            doctorName: { $first: "$doctorInfo.name" },
            revenue: { $sum: "$doctorInfo.fees" },
            appointments: { $sum: 1 },
          },
        },
        {
          $sort: { revenue: -1 },
        },
      ]);

      return {
        overall: overall[0] || { totalRevenue: 0, totalAppointments: 0 },
        byDoctor: revenueByDoctor,
      };
    } catch (error) {
      throw new Error(`Error getting revenue data: ${error.message}`);
    }
  },

  getAvailableDoctors: async () => {
    try {
      const doctors = await doctorModel
        .find({ available: true })
        .select("-password -slots_booked");
      return doctors;
    } catch (error) {
      throw new Error(`Error getting available doctors: ${error.message}`);
    }
  },

  getCancelledAppointments: async () => {
    try {
      const cancelled = await appointmentModel
        .find({ cancelled: true })
        .populate("docId", "name speciality")
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
      return cancelled;
    } catch (error) {
      throw new Error(`Error getting cancelled appointments: ${error.message}`);
    }
  },

  getDoctorsByExperience: async () => {
    try {
      const doctors = await doctorModel
        .find()
        .select("name speciality experience fees")
        .sort({ experience: -1 });
      return doctors;
    } catch (error) {
      throw new Error(`Error getting doctors by experience: ${error.message}`);
    }
  },
};

// NEW: Dynamic query generator for custom queries
const generateDynamicQuery = async (userQuery) => {
  const prompt = `You are a MongoDB query expert. Generate a safe MongoDB query based on the user's request.

Database Schema:
${JSON.stringify(schemaInfo, null, 2)}

User Query: "${userQuery}"

Respond with ONLY valid JSON in this format:
{
  "model": "doctors" | "appointments" | "users",
  "operation": "find" | "aggregate" | "count",
  "query": <mongoose query object>,
  "options": <optional: sort, limit, select, populate>
}

Examples:

Query: "Show me doctors with fees less than 500"
Response: {
  "model": "doctors",
  "operation": "find",
  "query": { "fees": { "$lt": 500 } },
  "options": { "select": "name speciality fees experience", "sort": { "fees": 1 } }
}

Query: "How many appointments were cancelled?"
Response: {
  "model": "appointments",
  "operation": "count",
  "query": { "cancelled": true }
}

Query: "List all dermatologists"
Response: {
  "model": "doctors",
  "operation": "find",
  "query": { "speciality": { "$regex": "dermatolog", "$options": "i" } },
  "options": { "select": "name speciality fees experience available" }
}

IMPORTANT RULES:
1. Never use $where or code execution operators
2. Use $regex with $options: "i" for case-insensitive text search
3. For relationships, use populate in options
4. Keep queries simple and safe
5. If query is unclear or dangerous, return: {"error": "Unable to generate safe query"}

Now generate for: "${userQuery}"`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
  });

  const text = response.text;
  console.log("Dynamic query generation response:", text);

  // Parse JSON response
  let queryData;
  try {
    queryData = JSON.parse(text);
  } catch (e) {
    const codeBlockMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      queryData = JSON.parse(codeBlockMatch[1]);
    } else {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        queryData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse query generation response");
      }
    }
  }

  return queryData;
};

// Execute dynamic query
const executeDynamicQuery = async (queryData) => {
  if (queryData.error) {
    throw new Error(queryData.error);
  }

  let model;
  switch (queryData.model) {
    case "doctors":
      model = doctorModel;
      break;
    case "appointments":
      model = appointmentModel;
      break;
    case "users":
      model = userModel;
      break;
    default:
      throw new Error(`Unknown model: ${queryData.model}`);
  }

  const options = queryData.options || {};

  switch (queryData.operation) {
    case "find": {
      let query = model.find(queryData.query);
      
      if (options.select) query = query.select(options.select);
      if (options.sort) query = query.sort(options.sort);
      if (options.limit) query = query.limit(options.limit);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(options.populate);
        }
      }
      
      return await query.exec();
    }

    case "count":
      return { count: await model.countDocuments(queryData.query) };

    case "aggregate":
      return await model.aggregate(queryData.query);

    default:
      throw new Error(`Unknown operation: ${queryData.operation}`);
  }
};

// Function to determine which approach to use
const analyzeQueryAndExecute = async (userQuery) => {
  const prompt = `You are a query router. Determine if this query matches a predefined function or needs a custom query.

Available predefined functions:
1. getDoctorsWithMostPatients - doctors with most patients/appointments
2. getTotalStatistics - overall statistics (totals, counts)
3. getDoctorsBySpeciality - doctors grouped by or filtered by speciality
4. getRecentAppointments - recent/latest appointments
5. getRevenueData - revenue, earnings, financial data
6. getAvailableDoctors - available doctors
7. getCancelledAppointments - cancelled appointments
8. getDoctorsByExperience - doctors sorted by experience

User Query: "${userQuery}"

Respond ONLY with valid JSON:
{
  "usePredefinded": true/false,
  "function": "functionName" (if usePredefined is true),
  "parameters": {} (if usePredefined is true),
  "reason": "brief explanation"
}

Examples:

Query: "Which doctors have the most patients?"
Response: {"usePredefined": true, "function": "getDoctorsWithMostPatients", "parameters": {}, "reason": "Matches predefined function"}

Query: "Show me doctors with fees under 300"
Response: {"usePredefined": false, "reason": "Needs custom query for fee filtering"}

Query: "List all cardiologists"
Response: {"usePredefined": true, "function": "getDoctorsBySpeciality", "parameters": {"speciality": "cardiology"}, "reason": "Matches speciality function"}

Now analyze: "${userQuery}"`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
  });

  const text = response.text;
  console.log("Query analysis response:", text);

  let analysisData;
  try {
    analysisData = JSON.parse(text);
  } catch (e) {
    const codeBlockMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      analysisData = JSON.parse(codeBlockMatch[1]);
    } else {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse analysis response");
      }
    }
  }

  return analysisData;
};

// Function to format the data into natural language
const formatDataToNaturalLanguage = async (data, originalQuery) => {
  const prompt = `You are a helpful assistant. Convert the following database query results into a clear, natural language response for an admin dashboard.

Original Question: "${originalQuery}"

Data: ${JSON.stringify(data, null, 2)}

Provide a clear, concise answer in natural language. Format numbers nicely, use bullet points or numbered lists when appropriate, and make it easy to read. Be professional but friendly.

Important: 
- If the data is empty or shows no results, say "No data found matching your criteria."
- If it's a list, present it in an organized way with the most important information
- Highlight important metrics or insights
- Keep it concise but informative
- Use emojis sparingly for visual appeal
- If there's a count field, mention it clearly`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
  });

  return response.text;
};

// Main chat function
export const chatWithDatabase = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({
        success: false,
        message: "Please provide a message",
      });
    }

    console.log("User query:", message);

    // Step 1: Analyze if we should use predefined function or generate custom query
    const analysis = await analyzeQueryAndExecute(message);
    console.log("Analysis:", analysis);

    let data;

    if (analysis.usePredefined) {
      // Use predefined function
      const { function: functionName, parameters } = analysis;
      console.log("Using predefined function:", functionName, "Parameters:", parameters);

      switch (functionName) {
        case "getDoctorsWithMostPatients":
          data = await databaseFunctions.getDoctorsWithMostPatients();
          break;
        case "getTotalStatistics":
          data = await databaseFunctions.getTotalStatistics();
          break;
        case "getDoctorsBySpeciality":
          data = await databaseFunctions.getDoctorsBySpeciality(parameters?.speciality);
          break;
        case "getRecentAppointments":
          data = await databaseFunctions.getRecentAppointments(parameters?.limit || 10);
          break;
        case "getRevenueData":
          data = await databaseFunctions.getRevenueData();
          break;
        case "getAvailableDoctors":
          data = await databaseFunctions.getAvailableDoctors();
          break;
        case "getCancelledAppointments":
          data = await databaseFunctions.getCancelledAppointments();
          break;
        case "getDoctorsByExperience":
          data = await databaseFunctions.getDoctorsByExperience();
          break;
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } else {
      // Generate and execute custom query
      console.log("Generating custom query...");
      const queryData = await generateDynamicQuery(message);
      console.log("Generated query:", JSON.stringify(queryData, null, 2));
      
      data = await executeDynamicQuery(queryData);
    }

    console.log("Query executed successfully. Data:", 
      Array.isArray(data) ? `Array with ${data.length} items` : 
      typeof data === 'object' ? JSON.stringify(data).substring(0, 150) + "..." : 
      data
    );

    // Step 2: Format the data into natural language
    const naturalLanguageResponse = await formatDataToNaturalLanguage(data, message);

    res.json({
      success: true,
      response: naturalLanguageResponse,
    });

  } catch (error) {
    console.error("Chat error:", error);
    
    // Better error messages
    let userMessage = "I apologize, but I encountered an error while processing your request.";
    
    if (error.message.includes("Unable to generate safe query")) {
      userMessage = "I couldn't understand that query. Could you please rephrase it or try asking in a different way?";
    } else if (error.message.includes("Unknown model") || error.message.includes("Unknown operation")) {
      userMessage = "I couldn't process that query. Please try asking about doctors, appointments, or patients.";
    }

    res.json({
      success: false,
      message: error.message || "An error occurred while processing your request",
      response: userMessage + " Try questions like: 'Show me all doctors', 'How many appointments?', or 'List available doctors'.",
    });
  }
};

// Test endpoint to verify Gemini connection
export const testGeminiConnection = async (req, res) => {
  try {
    console.log("Testing Gemini connection...");
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",

      contents: "Say hello in 5 words",
    });

    res.json({
      success: true,
      message: "Gemini connection successful",
      response: response.text,
      model: "gemini-1.5-flash"
      "
    });
  } catch (error) {
    console.error("Gemini test error:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Debug endpoint to check database data
export const debugDatabaseData = async (req, res) => {
  try {
    const doctorCount = await doctorModel.countDocuments();
    const appointmentCount = await appointmentModel.countDocuments();
    const userCount = await userModel.countDocuments();
    
    const sampleDoctor = await doctorModel.findOne();
    const sampleAppointment = await appointmentModel.findOne();
    const sampleUser = await userModel.findOne();

    res.json({
      success: true,
      counts: {
        doctors: doctorCount,
        appointments: appointmentCount,
        users: userCount,
      },
      collectionNames: {
        doctors: doctorModel.collection.name,
        appointments: appointmentModel.collection.name,
        users: userModel.collection.name,
      },
      samples: {
        doctor: sampleDoctor ? { 
          id: sampleDoctor._id, 
          name: sampleDoctor.name,
          speciality: sampleDoctor.speciality 
        } : null,
        appointment: sampleAppointment ? { 
          id: sampleAppointment._id, 
          docId: sampleAppointment.docId,
          userId: sampleAppointment.userId 
        } : null,
        user: sampleUser ? { 
          id: sampleUser._id, 
          name: sampleUser.name 
        } : null,
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};