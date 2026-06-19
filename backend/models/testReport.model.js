import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },

    // Name of the prescribed test this report belongs to
    // (matches one entry from appointment.doctorNotes.tests)
    testName: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary file info
    fileUrl: {
      type: String,
      required: true,
    },


    // Doctor review flow
    isReviewed: {
      type: Boolean,
      default: false,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    doctorRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);



const reportModel =
  mongoose.models.report || mongoose.model("userreport", reportSchema);

export default reportModel;