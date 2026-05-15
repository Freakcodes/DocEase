import userModel from "../models/user.model.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctor.model.js";
import appointmentModel from "../models/appointment.model.js";
import razorpay from "razorpay";
import crypto from "crypto";
import { log } from "console";
import sendEmail from "../utils/sendEmail.js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
// import pdfParse from "pdf-parse";
import { PDFParse } from "pdf-parse";
// import { CombineIcon } from "lucide-react";

// import doctorModel from "../models/doctor.model.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name);
  if (!validator.isEmail(email)) {
    res.json({ success: false, message: "Enter a valid email" });
  }

  if (password.length < 8) {
    return res.json({
      success: false,
      message: "password must be 8 character long",
    });
  }

  const salt = await bcrypt.genSalt(8);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userData = {
    name,
    email,
    password: hashedPassword,
  };

  const newUser = new userModel(userData);

  const user = await newUser.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token, user });
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //simple steps
  //check if email exists in the mongoDB
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.json({ success: true, token, user });
    }
  } catch (error) {
    return res.json({ success: false, error });
  }
};

const userProfile = async (req, res) => {
  const user = await userModel.findById(req.userId).select("-password");
  if (!user) return res.json({ success: false, message: "User not found" });
  res.json({ success: true, user });
};

const updateUserProfile = async (req, res) => {
  const { name, email, phone, gender, dob, address } = req.body;

  const imageFile = req.file;
  if (!name || !phone || !dob || !gender) {
    return res.json({ success: false, message: "Data Fields Missing" });
  }
  //TODO: basic checks..
  //upload image to cloudinary..

  const updatedUser = await userModel.findByIdAndUpdate(req.userId, {
    name,
    email,
    phone,
    gender,
    dob,
    address: JSON.parse(address),
  });
  if (imageFile) {
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;
    await userModel.findByIdAndUpdate(req.userId, { image: imageUrl });
  }
  res.json({ success: true, message: "Profile Updated" });
};

//API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    let slots_booked = docData.slots_booked;
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slots not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });

    //checking for slot availability
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error,
    });
  }
};

//API to get all appointments
const listAllAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });
    return res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
};

//API to get appointment by ID

const getAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.json({
        success: false,
        message: "user id not found",
      });
    }
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData.userId != userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    return res.json({
      success: true,
      appointmentData,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
};

//API to cancel the appointments
const cancelAppointments = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData.userId != userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    //releasing the doctor slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime,
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

//api to make payment using razorpay...
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    console.log(appointmentId);
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or Not Found",
      });
    }
    //creating options for razorpay payment
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };
    console.log(options);
    //creation of an order
    const order = await razorpayInstance.orders.create(options);
    console.log(order);
    res.json({ success: true, order });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
};

const verifyRazorPay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      res.json({ success: true, message: "Payment Successfull" });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const token = crypto.randomBytes(20).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    let link = process.env.FRONTEND_URL + `/reset-password/${token}`;
    sendEmail(user.email, link);
    await user.save();
    return res.json({
      success: true,
      message: `Reset link sent to ${user.email}`,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid Token",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "password must be 8 character long",
      });
    }

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.json({ success: true, message: "Password Reset Successfully" });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//ai report analysis..
const analyzeReport = async (req, res) => {
  try {
    // File received from multer
    const files = req.files;

    // No files uploaded
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    let combinedText = "";

    // Loop through all uploaded files
    for (const file of files) {
      const filePath = file.path;

      // IMAGE FILES
      if (file.mimetype.startsWith("image/")) {
        const imageBuffer = fs.readFileSync(filePath);

        const base64Image = imageBuffer.toString("base64");

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
Extract all readable text from this medical report image.

Rules:
- Return only extracted text
- Preserve formatting as much as possible
- Do not summarize
- Do not explain anything
`,
                },

                {
                  inlineData: {
                    mimeType: file.mimetype,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        });

        const extractedText = response.text;

        combinedText += extractedText + "\n\n";

        // Clean text
      } else if (file.mimetype === "application/pdf") {
        console.log("PDF uploaded");

        const dataBuffer = fs.readFileSync(filePath);

        const parser = new PDFParse({ url: filePath });

        const result = await parser.getText();

        combinedText = result.text;
      } else {
        return res.status(400).json({
          success: false,
          message: "Unsupported file type",
        });
      }
    
      // CLEAN TEXT
      const cleanedText = combinedText
        .replace(/\t/g, " ")
        .replace(/\r/g, "")
        .trim();
      console.log(combinedText);
      
      //now ai prompt
      const prompt = `
You are an AI medical report analysis assistant.

Analyze the following medical report carefully.

Return ONLY valid JSON.

STRICT JSON FORMAT:

{
  "report_type": "string",
  "summary": "string",

  "abnormalities": [
    {
      "test": "string",
      "value": "string",
      "reference_range": "string",
      "status": "High | Low | Abnormal | Critical",
      "reason": "simple patient friendly explanation"
    }
  ],

  "possible_concerns": [
    "string"
  ],

  "precautions": [
    "string"
  ],

  "recommended_specialist": "string",

  "doctor_consultation_needed": true
}

IMPORTANT RULES:

- Return ONLY valid JSON
- Do NOT return markdown
- Do NOT add explanation outside JSON
- Do NOT add HTML
- Do NOT add extra keys
- Always follow the exact schema
- abnormalities MUST always be an array of objects
- possible_concerns MUST always be an array of strings
- precautions MUST always be an array of strings
- doctor_consultation_needed MUST always be boolean

ABNORMALITY RULES:

- Include ONLY abnormal or borderline abnormal values
- Ignore clearly normal values
- status should be:
  - "High"
  - "Low"
  - "Abnormal"
  - "Critical"

- Keep reason very short and simple
- Example:

{
  "test": "WBC Count",
  "value": "10570 /cmm",
  "reference_range": "4000 - 10000 /cmm",
  "status": "High",
  "reason": "White blood cell count is slightly elevated."
}

SUMMARY RULES:

- Keep summary short
- Maximum 3-4 sentences
- Use simple patient-friendly language
- Do not give final diagnosis
- Mention major findings only

SPECIALIST RULES:

Examples:
- Cardiologist
- Diabetologist
- General Physician
- Hematologist
- Endocrinologist

CONSULTATION RULES:

Return true if:
- diabetes indicators present
- very abnormal values exist
- multiple abnormalities exist
- critical findings exist

Otherwise return false.

Medical Report:
${cleanedText}
`;

      // =========================
      // GEMINI RESPONSE
      // =========================
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let rawText = response.text;

      // Remove accidental markdown
      rawText = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // =========================
      // PARSE JSON
      // =========================
      let parsedResponse;

      try {
        parsedResponse = JSON.parse(rawText);
      } catch (parseError) {
        return res.json({
          success: false,
          message: "Failed to parse AI response",
        });
      }

      console.log(parsedResponse);

      return res.status(200).json({
        success: true,
        data: parsedResponse,
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const aiHealthAssistant = async (req, res) => {
  try {
    const { symptoms, age, gender, duration } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!symptoms || symptoms.trim() === "") {
      return res.json({
        success: false,
        message: "Symptoms are required",
      });
    }

    // =========================
    // EMERGENCY DETECTION
    // =========================
    const emergencyKeywords = [
      "chest pain",
      "heart attack",
      "stroke",
      "unconscious",
      "difficulty breathing",
      "breathing difficulty",
      "suicide",
      "severe bleeding",
      "blood vomiting",
      "seizure",
      "fainted",
    ];

    const lowerSymptoms = symptoms.toLowerCase();

    const emergencyDetected = emergencyKeywords.some((keyword) =>
      lowerSymptoms.includes(keyword),
    );

    if (emergencyDetected) {
      return res.json({
        success: true,
        emergency: true,
        aiResponse: {
          urgency: "High",
          message:
            "Your symptoms may indicate a medical emergency. Please seek immediate medical attention immediately.",
          disclaimer:
            "This response is AI-generated and should not replace professional medical advice.",
        },
        doctors: [],
      });
    }

    // =========================
    // AI PROMPT
    // =========================
    const prompt = `
You are an AI healthcare assistant.

IMPORTANT RULES:
- You are NOT a doctor
- NEVER provide confirmed diagnosis
- NEVER prescribe medicines
- Keep response safe and beginner friendly
- Use only common possible conditions
- Return ONLY valid JSON
- Do NOT add markdown
- Do NOT add backticks

Choose recommended_specialist ONLY from this list:

[
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "ENT",
  "Psychiatrist",
  "Pediatrician",
  "Gynecologist",
  "Gastroenterologist",
  "Pulmonologist"
]

Return JSON in this exact structure:

{
  "possible_conditions": [],
  "recommended_specialist": "",
  "urgency": "",
  "precautions": [],
  "emergency_signs": [],
  "summary": "",
  "disclaimer": ""
}

User Details:
Age: ${age}
Gender: ${gender}
Duration: ${duration}

Symptoms:
${symptoms}
`;

    // =========================
    // GEMINI RESPONSE
    // =========================
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text;

    // Remove accidental markdown
    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // =========================
    // PARSE JSON
    // =========================
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(rawText);
    } catch (parseError) {
      return res.json({
        success: false,
        message: "Failed to parse AI response",
      });
    }

    // =========================
    // FETCH DOCTORS
    // =========================
    const doctors = await doctorModel.find({
      speciality: parsedResponse.recommended_specialist,
    });

    // =========================
    // RESPONSE
    // =========================
    return res.json({
      success: true,
      emergency: false,
      aiResponse: parsedResponse,
      doctors,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
export {
  registerUser,
  loginUser,
  userProfile,
  updateUserProfile,
  bookAppointment,
  listAllAppointments,
  cancelAppointments,
  paymentRazorpay,
  verifyRazorPay,
  forgotPassword,
  resetPassword,
  getAppointment,
  aiHealthAssistant,
  analyzeReport,
};
