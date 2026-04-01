import { Router } from "express";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserProfileById
} from "../controllers/userprofile.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// All profile routes are protected — valid JWT required
// POST   /profile/create      → Create user profile
router.post("/create", isAuthenticated, createUserProfile);

// GET    /profile/:userId     → Get user profile
router.get("/getprofile", isAuthenticated, getUserProfile);

// PUT    /profile/:userId     → Update user profile (partial)
router.put("/updateprofile", isAuthenticated, updateUserProfile);

// DELETE /profile/:userId     → Delete user profile
router.delete("/deleteprofile", isAuthenticated, deleteUserProfile);

// GET    /profile/:id         → Get a specific user profile by ID (e.g. for Doctors)
router.get("/:id", isAuthenticated, getUserProfileById);

export default router;
