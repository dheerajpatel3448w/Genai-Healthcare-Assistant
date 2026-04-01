import type { RequestHandler, Request, Response } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { DoctorProfile } from "../models/Docter.model.js";
import { DoctorBrainService } from "../services/DoctorBrain.service.js";
import { ChatHistory } from "../models/chathistory.model.js";

// POST /doctor-ai/chat
export const doctorAiController: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const { query } = req.body;
  const doctorUserId = req.user?.id || req.user?.userId;

  if (!query) {
    return res.status(400).json({ success: false, message: "Query is required." });
  }

  // Validate: user must be a registered doctor
  const doctorProfile = await DoctorProfile.findOne({ userId: doctorUserId }).lean();
  if (!doctorProfile) {
    return res.status(403).json({
      success: false,
      message: "Access denied. No doctor profile found for your account."
    });
  }

  const doctorId = (doctorProfile._id as any).toString();

  const finalResponse = await DoctorBrainService(doctorId, doctorUserId, query, doctorProfile);

  if (!finalResponse) {
    return res.status(500).json({ success: false, message: "DoctorBrain returned no output." });
  }

  return res.status(200).json({
    success: true,
    finalResponse,
  });
});

// GET /doctor-ai/history
export const getDoctorAiHistory: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const doctorUserId = req.user?.id || req.user?.userId;

  if (!doctorUserId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string) : 15;

  const history = await ChatHistory.find({ userId: doctorUserId })
    .sort({ timestamp: -1 })
    .limit(limit);

  return res.status(200).json({ success: true, history });
});
