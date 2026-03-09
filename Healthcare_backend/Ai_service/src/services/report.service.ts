import { Report } from "../models/report.model.js";
import mongoose from "mongoose";

export const saveReport = async (
  patientId: string,
  reportName: string,
  reportType: "lab" | "imaging" | "clinical",
  fileUrl: string,
  extractedText: string,
  analysis: any
) => {
  try {
    const report = new Report({
      patientId: new mongoose.Types.ObjectId(patientId),
      reportName,
      reportType,
      fileUrl,
      extractedText,
      analysis,
      uploadedAt: new Date(),
    });

    const savedReport = await report.save();
    console.log(`Report saved with ID: ${savedReport._id}`);
    return savedReport;
  } catch (error: any) {
    console.error("Error saving report:", error.message);
    throw error;
  }
};

export const getReportById = async (reportId: string) => {
  try {
    const report = await Report.findById(reportId).populate("patientId", "name email");
    return report;
  } catch (error: any) {
    console.error("Error fetching report:", error.message);
    throw error;
  }
};

export const getReportsByPatient = async (patientId: string, limit = 10, skip = 0) => {
  try {
    const reports = await Report.find({ patientId })
      .populate("patientId", "name email")
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Report.countDocuments({ patientId });

    return {
      reports,
      total,
      limit,
      skip,
    };
  } catch (error: any) {
    console.error("Error fetching reports:", error.message);
    throw error;
  }
};

export const getReportsByType = async (patientId: string, reportType: string, limit = 10, skip = 0) => {
  try {
    const reports = await Report.find({ patientId, reportType })
      .populate("patientId", "name email")
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Report.countDocuments({ patientId, reportType });

    return {
      reports,
      total,
    };
  } catch (error: any) {
    console.error("Error fetching reports by type:", error.message);
    throw error;
  }
};

export const updateReportAnalysis = async (reportId: string, analysis: any) => {
  try {
    const report = await Report.findByIdAndUpdate(reportId, { analysis }, { new: true });
    return report;
  } catch (error: any) {
    console.error("Error updating report:", error.message);
    throw error;
  }
};

export const deleteReport = async (reportId: string) => {
  try {
    const report = await Report.findByIdAndDelete(reportId);
    return report;
  } catch (error: any) {
    console.error("Error deleting report:", error.message);
    throw error;
  }
};
