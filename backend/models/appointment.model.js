import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },

  // keep your format
  slotDate: { type: String, required: true }, // "27-4-2026"
  slotTime: { type: String, required: true }, // "10:30 AM"

  userData: { type: Object, required: true },
  docData: { type: Object, required: true },

  amount: { type: Number, required: true },

  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },

  // ✅ Doctor Notes (NEW FEATURE)
  doctorNotes: {
    notes: { type: String },

    medicines: [
      {
        name: String,
        dosage: String,
        duration: String,
      },
    ],

    // ✅ tests now carry their own upload status
    tests: [
      {
        testName: { type: String, required: true },
        reportUrl: { type: String, default: null },     // Cloudinary URL
        cloudinaryId: { type: String, default: null },  // public_id, for deletion later
        uploaded: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: null },
      },
    ],

    followUpDate: String, // keep consistent with your date format
    createdAt: { type: Date, default: Date.now },
  },

  // ✅ track completion time
  completedAt: { type: Date },
});

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);