import { Document, Types } from "mongoose";

export interface IReportAnalysis extends Document {
  patientId: Types.ObjectId;

  reports: {
    reportId: Types.ObjectId;
    reportType: "lab" | "imaging" | "clinical";
    analysis: Record<string, unknown>;
  }[];

  finalAnalysis?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

import mongoose, { Schema } from "mongoose";

const ReportAnalysisSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },

    reports: [
      {
        reportId: {
          type: Schema.Types.ObjectId,
          ref: "Report",
          required: true
        },

        reportType: {
          type: String,
          enum: ["lab", "imaging", "clinical"],
          required: true
        },

        analysis: {
          type: Schema.Types.Mixed
        }
      }
    ],

    finalAnalysis: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export const ReportAnalysis = mongoose.model(
  "ReportAnalysis",
  ReportAnalysisSchema
);