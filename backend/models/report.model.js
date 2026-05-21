import mongoose from "mongoose";

const abnormalitySchema = new mongoose.Schema(
  {
    test: {
      type: String,
    },

    value: {
      type: String,
    },

    reference_range: {
      type: String,
    },

    status: {
      type: String,
    },

    reason: {
      type: String,
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    report_type: {
      type: String,
      default: "Medical Report",
    },

    fileUrl: {
      type: String,
    },

    extractedText: {
      type: String,
      required: true,
    },

    aiAnalysis: {
      summary: {
        type: String,
      },

      abnormalities: [abnormalitySchema],

      possible_concerns: [
        {
          type: String,
        },
      ],

      precautions: [
        {
          type: String,
        },
      ],

      recommended_specialist: {
        type: String,
      },

      doctor_consultation_needed: {
        type: Boolean,
        default: false,
      },
    },

    embeddingStored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const reportModel =
  mongoose.models.report ||
  mongoose.model("report", reportSchema);

export default reportModel;