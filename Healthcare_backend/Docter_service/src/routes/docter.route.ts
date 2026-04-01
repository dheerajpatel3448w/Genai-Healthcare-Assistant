import { Router } from "express";
import {
  createDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  deleteDoctorProfile,
  getAllDoctors,
  getDoctorById,
} from "../controllers/docter.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router: Router = Router();

// Public route — no auth needed
// GET  /doctor/all              → List all verified doctors (with optional filters)
router.get("/all", getAllDoctors);

// Protected routes — valid JWT required
// POST   /doctor/create         → Create doctor profile
router.post("/create", isAuthenticated, createDoctorProfile);

// GET    /doctor/getprofile     → Get logged-in doctor's profile
router.get("/getprofile", isAuthenticated, getDoctorProfile);

// PUT    /doctor/updateprofile  → Update logged-in doctor's profile
router.put("/updateprofile", isAuthenticated, updateDoctorProfile);

// DELETE /doctor/deleteprofile  → Delete logged-in doctor's profile
router.delete("/deleteprofile", isAuthenticated, deleteDoctorProfile);

// GET    /doctor/:id            → Get a specific doctor profile by ID
router.get("/:id", getDoctorById);

export default router;
