import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },

    address: { type: Object, required: true },

    // ✅ NEW: Doctor Timing
    timings: {
      start: { type: String, required: true }, // "09:00"
      end: { type: String, required: true },   // "17:00"
    },

    // ✅ NEW: Slot Duration (in minutes)
    slotDuration: {
      type: Number,
      default: 30,
    },

    // ✅ OPTIONAL (VERY GOOD FEATURE)
    availableDays: {
      type: [String],
      default: ["MON", "TUE", "WED", "THU", "FRI"],
    },

    // existing
    slots_booked: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true }
);

export default mongoose.models.Doctor ||
  mongoose.model("Doctor", doctorSchema);