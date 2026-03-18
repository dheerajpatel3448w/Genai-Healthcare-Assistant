import type { Request, Response, NextFunction, RequestHandler } from "express";
import { UserProfile } from "../model/userprofile.model.js";
import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

// ──────────────────────────────────────────────────────────────────────────────
// Helper: validate ObjectId format
// ──────────────────────────────────────────────────────────────────────────────
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// ──────────────────────────────────────────────────────────────────────────────
// @route   POST /profile/create
// @desc    Create a new user profile (fails if one already exists)
// @access  Private
// ──────────────────────────────────────────────────────────────────────────────
export const createUserProfile:RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const profileData = req.body;

    // 1. userId must come from authenticated token
    if (!userId) {
      return next(new ErrorHandler(401, "User not authenticated."));
    }

    // 2. Validate ObjectId format
    if (!isValidObjectId(userId)) {
      return next(new ErrorHandler(400, "Invalid userId format."));
    }

    // 3. Prevent duplicate profiles
    const existing = await UserProfile.findOne({ userId });
    if (existing) {
      return next(new ErrorHandler(409, "A profile for this user already exists."));
    }

    // 4. Validate gender enum if provided
    const validGenders = ["male", "female", "other"];
    if (profileData.gender && !validGenders.includes(profileData.gender)) {
      return next(
        new ErrorHandler(400, `Invalid gender. Allowed: ${validGenders.join(", ")}`)
      );
    }

    // 5. Validate bloodGroup enum if provided
    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (profileData.bloodGroup && !validBloodGroups.includes(profileData.bloodGroup)) {
      return next(
        new ErrorHandler(400, `Invalid blood group. Allowed: ${validBloodGroups.join(", ")}`)
      );
    }

    // 6. Validate lifestyle enums if provided
    const validExercise = ["none", "rare", "weekly", "daily"];
    const validDiet = ["veg", "non-veg", "vegan", "mixed"];

    if (
      profileData.lifestyle?.exerciseFrequency &&
      !validExercise.includes(profileData.lifestyle.exerciseFrequency)
    ) {
      return next(
        new ErrorHandler(400, `Invalid exerciseFrequency. Allowed: ${validExercise.join(", ")}`)
      );
    }

    if (
      profileData.lifestyle?.dietType &&
      !validDiet.includes(profileData.lifestyle.dietType)
    ) {
      return next(
        new ErrorHandler(400, `Invalid dietType. Allowed: ${validDiet.join(", ")}`)
      );
    }

    // 7. Create the profile
    const profile = await UserProfile.create({ userId, ...profileData });

    return res.status(201).json({
      success: true,
      message: "User profile created successfully.",
      profile,
    });
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// @route   GET /profile/:userId
// @desc    Get user profile by userId
// @access  Private
// ──────────────────────────────────────────────────────────────────────────────
export const getUserProfile:RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id

    if (!isValidObjectId(userId)) {
      return next(new ErrorHandler(400, "Invalid userId format."));
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return next(new ErrorHandler(404, "User profile not found."));
    }

    return res.status(200).json({ success: true, profile });
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// @route   PUT /profile/:userId
// @desc    Update existing user profile (partial update supported)
// @access  Private
// ──────────────────────────────────────────────────────────────────────────────
export const updateUserProfile:RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const updateData = req.body;

    if (!isValidObjectId(userId)) {
      return next(new ErrorHandler(400, "Invalid userId format."));
    }

    // Prevent overwriting the userId field
    delete updateData.userId;

    if (Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, "No update fields provided."));
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return next(
        new ErrorHandler(404, "User profile not found. Create one first using POST /create.")
      );
    }

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully.",
      profile,
    });
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// @route   DELETE /profile/:userId
// @desc    Delete user profile by userId
// @access  Private
// ──────────────────────────────────────────────────────────────────────────────
export const deleteUserProfile:RequestHandler = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id

    if (!isValidObjectId(userId)) {
      return next(new ErrorHandler(400, "Invalid userId format."));
    }

    const profile = await UserProfile.findOneAndDelete({ userId });

    if (!profile) {
      return next(new ErrorHandler(404, "User profile not found."));
    }

    return res.status(200).json({
      success: true,
      message: "User profile deleted successfully.",
    });
  }
);
