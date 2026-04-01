import type { Request, Response, NextFunction, RequestHandler } from "express";
import { DoctorProfile } from "../model/Docter.model.js";
import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
import { User } from "../model/user.model.js"; // Registers the minimal User schema

// ──────────────────────────────────────────────────────────────────────────────
// Helper: validate ObjectId format
// ──────────────────────────────────────────────────────────────────────────────
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// ──────────────────────────────────────────────────────────────────────────────
// @route   POST /doctor/create
// @desc    Create a new doctor profile (fails if one already exists)
// @access  Private
// ──────────────────────────────────────────────────────────────────────────────
export const createDoctorProfile: RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new ErrorHandler(401, "User not authenticated."));
    }

    // Check for duplicate profile
    const existing = await DoctorProfile.findOne({ userId });
    if (existing) {
      return next(new ErrorHandler(409, "A doctor profile for this user already exists."));
    }

    const {
      specialization,
      experience,
      qualification,
      licenseNumber,
      hospitalName,
      clinicAddress,
      consultationFee,
      consultationType,
      slotDuration,
      availability,
      bio,
      profileImage,
      languages,
      services,
      education,
    } = req.body;

    // Required field validations
    if (!specialization) return next(new ErrorHandler(400, "Specialization is required."));
    if (experience === undefined || experience === null) return next(new ErrorHandler(400, "Experience is required."));
    if (!qualification) return next(new ErrorHandler(400, "Qualification is required."));
    if (!licenseNumber) return next(new ErrorHandler(400, "License number is required."));

    // Validate consultationType enum if provided
    const validConsultTypes = ["online", "clinic", "hospital"];
    if (consultationType) {
      const invalid = consultationType.filter(
        (t: string) => !validConsultTypes.includes(t)
      );
      if (invalid.length > 0) {
        return next(
          new ErrorHandler(400, `Invalid consultationType(s): ${invalid.join(", ")}. Allowed: ${validConsultTypes.join(", ")}`)
        );
      }
    }

    const profile = await DoctorProfile.create({
      userId,
      specialization,
      experience,
      qualification,
      licenseNumber,
      hospitalName,
      clinicAddress,
      consultationFee,
      consultationType,
      slotDuration,
      availability,
      bio,
      profileImage,
      languages,
      services,
      education,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor profile created successfully.",
      profile,
    });
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// @route   GET /doctor/getprofile
// @desc    Get the logged-in doctor's profile
// @access  Private
// ──────────────────────────────────────────────────────────────────────────────
export const getDoctorProfile: RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId || !isValidObjectId(userId)) {
      return next(new ErrorHandler(400, "Invalid or missing user ID."));
    }

    const profile = await DoctorProfile.findOne({ userId });

    if (!profile) {
      return next(new ErrorHandler(404, "Doctor profile not found."));
    }

    return res.status(200).json({ success: true, profile });
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// @route   PUT /doctor/updateprofile
// @desc    Update the logged-in doctor's profile (partial update)
// @access  Private
// ──────────────────────────────────────────────────────────────────────────────
export const updateDoctorProfile: RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId || !isValidObjectId(userId)) {
      return next(new ErrorHandler(400, "Invalid or missing user ID."));
    }

    const updateData = req.body;

    // Strip immutable fields from update payload
    delete updateData.userId;
    delete updateData.isVerified;
    delete updateData.rating;
    delete updateData.totalPatients;

    if (Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, "No update fields provided."));
    }

    // Validate consultationType enum if provided
    const validConsultTypes = ["online", "clinic", "hospital"];
    if (updateData.consultationType) {
      const invalid = updateData.consultationType.filter(
        (t: string) => !validConsultTypes.includes(t)
      );
      if (invalid.length > 0) {
        return next(
          new ErrorHandler(400, `Invalid consultationType(s): ${invalid.join(", ")}. Allowed: ${validConsultTypes.join(", ")}`)
        );
      }
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return next(
        new ErrorHandler(404, "Doctor profile not found. Create one first using POST /create.")
      );
    }

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully.",
      profile,
    });
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// @route   DELETE /doctor/deleteprofile
// @desc    Delete the logged-in doctor's profile
// @access  Private
// ──────────────────────────────────────────────────────────────────────────────
export const deleteDoctorProfile: RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId || !isValidObjectId(userId)) {
      return next(new ErrorHandler(400, "Invalid or missing user ID."));
    }

    const profile = await DoctorProfile.findOneAndDelete({ userId });

    if (!profile) {
      return next(new ErrorHandler(404, "Doctor profile not found."));
    }

    return res.status(200).json({
      success: true,
      message: "Doctor profile deleted successfully.",
    });
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// @route   GET /doctor/all
// @desc    Get all verified doctors (public listing)
// @access  Public
// ──────────────────────────────────────────────────────────────────────────────
export const getAllDoctors: RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // Support either general "search" parameter or legacy "specialization"
    const { specialization, minExperience, consultationType, search } = req.query;

    const searchTerm = (search || specialization || "") as string;

    const filter: Record<string, any> = {};

    if (minExperience) {
      filter.experience = { $gte: Number(minExperience) };
    }

    if (consultationType) {
      filter.consultationType = { $in: [consultationType] };
    }

    let doctors = await DoctorProfile.find(filter)
      .select("userId specialization qualification experience consultationFee consultationType availability rating totalPatients bio profileImage languages services")
      .populate("userId", "name email");

    // Perform partial text matching on BOTH name and specialization
    if (searchTerm) {
      const regex = new RegExp(searchTerm, "i");
      doctors = doctors.filter((doc: any) => {
        const specMatch = doc.specialization && regex.test(doc.specialization);
        const nameMatch = doc.userId?.name && regex.test(doc.userId.name);
        return specMatch || nameMatch;
      });
    }

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// @route   GET /doctor/:id
// @desc    Get a specific doctor's profile by their DoctorProfile ID
// @access  Public
// ──────────────────────────────────────────────────────────────────────────────
export const getDoctorById: RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!isValidObjectId(id as string)) {
      return next(new ErrorHandler(400, "Invalid doctor profile ID format."));
    }

    const profile = await DoctorProfile.findById(id).populate("userId", "name email");

    if (!profile) {
      return next(new ErrorHandler(404, "Doctor profile not found."));
    }

    return res.status(200).json({ success: true, profile });
  }
);
