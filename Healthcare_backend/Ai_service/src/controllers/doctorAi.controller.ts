import type { RequestHandler, Request, Response } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { DoctorProfile } from "../models/Docter.model.js";
import { DoctorBrainService } from "../services/DoctorBrain.service.js";

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
