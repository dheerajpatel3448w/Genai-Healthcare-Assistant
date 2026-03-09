import mongoose, { Schema, Document } from "mongoose";

// Interface for TypeScript
export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  reportName?: string;
  reportType: "lab" | "imaging" | "clinical";
  fileUrl?: string;
  extractedText?: string;
  analysis?: any; // Mixed type - flexible to handle any Gemini response
  uploadedAt: Date;
}

// Report Schema
const ReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  reportType: {
    type: String,
    enum: ["lab", "imaging", "clinical"],
  },

  reportName: String,

  fileUrl: String,

  extractedText: String,

  analysis: {
    type: Schema.Types.Mixed, // Mixed type - flexible for any structure
    default: {},
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export model
export const Report = mongoose.model<IReport>("Report", ReportSchema);

