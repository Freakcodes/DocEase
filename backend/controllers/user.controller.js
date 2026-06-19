import userModel from "../models/user.model.js";
import userReportModel from "../models/testReport.model.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctor.model.js";
import appointmentModel from "../models/appointment.model.js";
import razorpay from "razorpay";
import crypto from "crypto";
import streamifier from "streamifier";
// import { log } from "console";
import sendEmail from "../utils/sendEmail.js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
// import pdfParse from "pdf-parse";
import { PDFParse } from "pdf-parse";
import reportModel from "../models/report.model.js";
import { pineconeIndex } from "../config/pinecone.js";
import { pipeline } from "@xenova/transformers";
import { log } from "console";

// import { embed } from "@pinecone-database/pinecone/dist/inference/embed.js";
// import pdfParse from "pdf-parse"
// import { CombineIcon } from "lucide-react";

// import doctorModel from "../models/doctor.model.js";


//hepler function..
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "patient_reports",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const registerUser = async (req, res) => {
  const { name, email, password, dob } = req.body;

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
    dob,
    password: hashedPassword,
  };

  const newUser = new userModel(userData);

  const user = await newUser.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return res.json({ success: true, token, user });
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
    // console.log(options);
    //creation of an order
    console.log("before the payment all good");

    try {
      const order = await razorpayInstance.orders.create(options);
      console.log("I am here");
      console.log("Order created:", order);
      return res.json({ success: true, order });
    } catch (error) {
      return res.json({
        success: false,
        message: error.code,
      });
      console.log("Razorpay Error:", error); // This will show the REAL error
    }
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

let embedderInstance = null;
async function getEmbedder() {
  if (!embedderInstance) {
    embedderInstance = await pipeline(
      "feature-extraction",
      "Xenova/bge-base-en-v1.5",
    );
  }
  return embedderInstance;
}

// ─── Chunk the report text into overlapping sections ──────────────────────────
function chunkText(text, chunkSize = 300, overlap = 50) {
  const words = text.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) chunks.push(chunk);
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

// ─── Extract numeric key values for comparison ────────────────────────────────
function extractKeyValues(abnormalities = []) {
  const kv = {};
  for (const ab of abnormalities) {
    // e.g. "10570 /cmm" → extract the number
    const numMatch = String(ab.value).match(/[\d.]+/);
    kv[ab.test] = {
      value: numMatch ? parseFloat(numMatch[0]) : ab.value,
      unit: ab.value,
      status: ab.status,
    };
  }
  return kv;
}

// ─── Get how many times this user has uploaded this report type ───────────────
async function getReportVersion(userId, reportType) {
  const count = await reportModel.countDocuments({ userId, reportType });
  return count + 1;
}

// ─── Compare current vs previous key values ───────────────────────────────────
function buildComparison(prevKeyValues, currKeyValues, prevUploadedAt) {
  const changes = [];
  for (const [param, curr] of Object.entries(currKeyValues)) {
    if (prevKeyValues[param]) {
      const prev = prevKeyValues[param];
      const delta =
        typeof curr.value === "number" && typeof prev.value === "number"
          ? (curr.value - prev.value).toFixed(2)
          : null;

      const trend =
        prev.status !== "Normal" && curr.status === "Normal"
          ? "improved"
          : prev.status === "Normal" && curr.status !== "Normal"
            ? "worsened"
            : prev.status === curr.status
              ? "unchanged"
              : "changed";

      changes.push({ param, previous: prev, current: curr, delta, trend });
    }
  }
  return {
    previousReportDate: new Date(prevUploadedAt).toLocaleDateString(),
    changes,
  };
}

// ─── Main controller ──────────────────────────────────────────────────────────
const analyzeReport = async (req, res) => {
  try {
    const files = req.files;
    const userId = req.userId;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    // ── Step 1: Extract text from ALL files first, THEN process ──────────────
    let combinedText = "";

    for (const file of files) {
      const filePath = file.path;

      if (file.mimetype.startsWith("image/")) {
        const base64Image = fs.readFileSync(filePath).toString("base64");
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Extract all readable text from this medical report image.\nRules:\n- Return only extracted text\n- Preserve formatting\n- Do not summarize\n- Do not explain",
                },
                { inlineData: { mimeType: file.mimetype, data: base64Image } },
              ],
            },
          ],
        });
        combinedText += response.text + "\n\n";
      } else if (file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);

        const parser = new PDFParse({ url: filePath });

        const result = await parser.getText();
        combinedText += result.text + "\n\n";
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Unsupported file type" });
      }
    }

    // ── Step 2: Clean text (once, after all files) ────────────────────────────
    const cleanedText = combinedText
      .replace(/\t/g, " ")
      .replace(/\r/g, "")
      .replace(/\n{2,}/g, "\n")
      .replace(/([a-zA-Z,])\n([a-zA-Z])/g, "$1 $2")
      .replace(/ {2,}/g, " ")
      .trim();

    // ── Step 3: AI analysis ───────────────────────────────────────────────────
    const prompt = `You are an AI medical report analysis assistant.
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
  "possible_concerns": ["string"],
  "precautions": ["string"],
  "recommended_specialist": "string",
  "doctor_consultation_needed": true
}

IMPORTANT RULES:
- Return ONLY valid JSON, no markdown, no explanation
- abnormalities MUST be array of objects (only abnormal/borderline values)
- possible_concerns and precautions MUST be arrays of strings
- doctor_consultation_needed MUST be boolean

Medical Report:
${cleanedText}`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = aiResponse.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawText);
    } catch {
      return res
        .status(500)
        .json({ success: false, message: "Failed to parse AI response" });
    }

    // ── Step 4: Return early if no userId (guest user) ────────────────────────
    if (!userId) {
      return res.status(200).json({ success: true, data: parsedResponse });
    }

    // ── Step 5: Save report to MongoDB ────────────────────────────────────────
    const report = await reportModel.create({
      userId,
      reportType: parsedResponse.report_type, // was hardcoded before
      fileUrl: files[0].path,
      extractedText: cleanedText,
      aiAnalysis: parsedResponse,
      embeddingStored: false,
    });

    // ── Step 6: Build text to embed ───────────────────────────────────────────
    const textToEmbed = `
Report Type: ${parsedResponse.report_type}

Summary:
${parsedResponse.summary}

Abnormalities:
${parsedResponse.abnormalities.map((a) => `${a.test}: ${a.value} (${a.status}) - ${a.reason}`).join("\n")}

Possible Concerns:
${parsedResponse.possible_concerns.join("\n")}

Precautions:
${parsedResponse.precautions.join("\n")}

Recommended Specialist: ${parsedResponse.recommended_specialist}
Doctor Consultation Needed: ${parsedResponse.doctor_consultation_needed}
`.trim();

    // ── Step 7: Chunk + embed (batched, not one per chunk) ────────────────────
    const chunks = chunkText(textToEmbed);
    const embedder = await getEmbedder(); // reuses singleton

    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const output = await embedder(chunk, {
          pooling: "mean",
          normalize: true,
        });
        return Array.from(output.data);
      }),
    );

    // ── Step 8: Build rich metadata ───────────────────────────────────────────
    const reportVersion = await getReportVersion(
      userId,
      parsedResponse.report_type,
    );
    const keyValues = extractKeyValues(parsedResponse.abnormalities);
    const uploadedAt = Date.now();

    const records = chunks.map((chunk, i) => ({
      id: `${report._id}-chunk-${i}`,
      values: embeddings[i],
      metadata: {
        userId: userId.toString(),
        reportId: report._id.toString(),
        reportType: parsedResponse.report_type, // was "Medical Report" before
        reportVersion, // 1, 2, 3... for comparison
        uploadedAt, // timestamp for ordering
        chunkIndex: i,
        chunkText: chunk.slice(0, 1000),
        abnormalTests: parsedResponse.abnormalities.map((a) => a.test),
        keyValues: JSON.stringify(keyValues), // numeric values for diffing
      },
    }));

    // ── Step 9: Upsert all chunks to Pinecone ─────────────────────────────────
    await pineconeIndex.upsert({ records });

    report.embeddingStored = true;
    await report.save();

    // ── Step 10: Comparison — fetch previous report of same type ──────────────
    let comparisonInsight = null;

    if (reportVersion > 1) {
      const dummyEmbedding = embeddings[0]; // use first chunk vector to query

      const previousResults = await pineconeIndex.query({
        vector: dummyEmbedding,
        filter: {
          userId: { $eq: userId.toString() },
          reportType: { $eq: parsedResponse.report_type },
          chunkIndex: { $eq: 0 }, // only first chunks = one per report
        },
        topK: 5,
        includeMetadata: true,
      });

      // Sort by uploadedAt, skip the report we just saved
      const previousMatches = previousResults.matches
        .filter((m) => m.metadata.reportId !== report._id.toString())
        .sort((a, b) => b.metadata.uploadedAt - a.metadata.uploadedAt);

      if (previousMatches.length > 0) {
        const prev = previousMatches[0];
        const prevKeyValues = JSON.parse(prev.metadata.keyValues || "{}");
        comparisonInsight = buildComparison(
          prevKeyValues,
          keyValues,
          prev.metadata.uploadedAt,
        );
      }
    }

    // ── Step 11: Respond ──────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data: parsedResponse,
      reportId: report._id,
      comparison: comparisonInsight, // null on first upload, populated on subsequent
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// RAG CHAT CONTROLLER
// =========================
const ragChat = async (
  userQuestion,
  reportId,
  userId,
  reportSummary = null,
  chatHistory = [],
) => {
  // ── Step 1: Classify question type ─────────────────────────────────────────
  const classifyResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Classify this medical question into one of two categories:
- "summary": broad/interpretive questions (key findings, what should I do, is this serious, next steps, overview, precautions, specialist)
- "specific": specific questions about test values, measurements, or named findings

Question: "${userQuestion}"
Reply with ONLY one word: summary or specific`,
  });

  const questionType = classifyResponse.text.trim().toLowerCase();

  // ── Step 2: Build conversation history string for context ──────────────────
  const historyContext =
    chatHistory.length > 0
      ? `Previous conversation:\n${chatHistory
          .map(
            (m) =>
              `${m.role === "user" ? "Patient" : "Assistant"}: ${m.content}`,
          )
          .join("\n")}\n\n`
      : "";

  // ── Step 3: Summary path — answer directly from structured data ────────────
  if (questionType === "summary" && reportSummary) {
    const prompt = `You are a helpful medical assistant. Answer the patient's question using this structured report data.

${historyContext}Report Type: ${reportSummary.report_type}
Summary: ${reportSummary.summary}
Abnormalities: ${reportSummary.abnormalities?.map((a) => `${a.test}: ${a.value} (${a.status}) — ${a.reason}`).join("; ")}
Precautions: ${reportSummary.precautions?.join("; ")}
Recommended Specialist: ${reportSummary.recommended_specialist}
Doctor Consultation Needed: ${reportSummary.doctor_consultation_needed}

Rules:
- Simple, patient-friendly language
- No diagnosis
- Recommend doctor if findings are concerning
- If the question refers to something said earlier in the conversation, use the history above

Question: ${userQuestion}
Answer:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return { answer: response.text, type: "summary" };
  }

  // ── Step 4: Specific path — embed question and query Pinecone ──────────────
  const embedder = await getEmbedder(); // fixed: uses singleton
  const output = await embedder(userQuestion, {
    pooling: "mean",
    normalize: true,
  });
  const questionEmbedding = Array.from(output.data);

  const results = await pineconeIndex.query({
    vector: questionEmbedding,
    topK: 5,
    filter: {
      reportId: reportId.toString(),
      userId: userId.toString(), // fixed: scoped to this user
    },
    includeMetadata: true,
  });

  const relevantMatches = results.matches?.filter((m) => m.score > 0.35) || [];

  if (relevantMatches.length === 0) {
    return {
      answer:
        "I couldn't find specific information about that in your report. Try asking a broader question, or ask your doctor directly.",
      type: "no_match",
    };
  }

  // ── Step 5: Build context from chunks ──────────────────────────────────────
  const context = relevantMatches
    .map(
      (match, i) =>
        `Excerpt ${i + 1} (relevance: ${(match.score * 100).toFixed(1)}%):\n${match.metadata.chunkText}`, // fixed: chunkText not reportText
    )
    .join("\n\n---\n\n");

  // ── Step 6: Answer with history context ────────────────────────────────────
  const prompt = `You are a helpful medical assistant. Answer based ONLY on the report excerpts below.

${historyContext}Rules:
- Simple, patient-friendly language
- No diagnosis
- If the answer isn't in the excerpts, say "I don't have enough information about that."
- Recommend doctor if findings are concerning
- If the question refers to something said earlier in the conversation, use the history above

Medical report excerpts:
${context}

Question: ${userQuestion}
Answer:`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return { answer: response.text, type: "specific" };
};

// ─── Route handler ────────────────────────────────────────────────────────────
// backend — ragChat controller
export const chatWithReports = async (req, res) => {
  try {
    const { question, reportId, chatHistory = [] } = req.body;
    const userId = req.userId;

    // Only fetch the report on the FIRST message (no history yet)
    // Follow-up questions use chatHistory instead
    let reportSummary = null;
    if (chatHistory.length === 0) {
      const report = await reportModel.findOne({ _id: reportId, userId });
      if (!report) {
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });
      }
      reportSummary = report.aiAnalysis;
    }

    const trimmedHistory = chatHistory.slice(-6);

    const result = await ragChat(
      question,
      reportId,
      userId,
      reportSummary,
      trimmedHistory,
    );

    return res
      .status(200)
      .json({ success: true, answer: result.answer, type: result.type });
  } catch (error) {
    console.error("RAG chat error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
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

const uploadTestReport = async (req, res) => {
  try {
    const { appointmentId, testName } = req.body;
    const pdfFile = req.file;
    const userId = req.userId;

    if (!pdfFile) {
      return res.json({ success: false, message: "Something went wrong while uploading pdf" });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId.toString() !== userId.toString()) {
      
      return res.json({ success: false, message: "Not authorized for this appointment" });
    }

    // ✅ find the matching test inside the embedded array
    const testEntry = appointment.doctorNotes.tests.find(
      (t) => t.testName.trim().toLowerCase() === testName.trim().toLowerCase()
    );

    if (!testEntry) {
      
      return res.json({ success: false, message: "This test was not prescribed for this appointment" });
    }

    if (testEntry.uploaded) {
      
      return res.json({ success: false, message: "A report for this test has already been uploaded" });
    }

    // const pdfUpload = await cloudinary.uploader.upload(pdfFile.path, {
    //   resource_type: "raw",
    //   folder: "patient_reports",
    // });
    const pdfUpload = await uploadToCloudinary(pdfFile.buffer);

    // ✅ update the embedded test entry directly
    testEntry.reportUrl = pdfUpload.secure_url;
    testEntry.cloudinaryId = pdfUpload.public_id;
    testEntry.uploaded = true;
    testEntry.uploadedAt = new Date();

    await appointment.save();

   
    return res.json({ success: true, fileUrl: pdfUpload.secure_url, appointmentData: appointment });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
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
  uploadTestReport
};
