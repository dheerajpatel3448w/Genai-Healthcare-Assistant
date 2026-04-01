import { Router } from "express";
import {
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
  getBookedSlots,
  getAppointmentById
} from "../controllers/appointment.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post("/create", isAuthenticated, createAppointment);
router.get("/my-appointments", isAuthenticated, getUserAppointments);
router.get("/doctor/:doctorId", isAuthenticated, getDoctorAppointments);
router.patch("/:id/status", isAuthenticated, updateAppointmentStatus);

// Specific Action Routes
router.patch("/:id/cancel", isAuthenticated, cancelAppointment);
router.post("/:id/reschedule", isAuthenticated, rescheduleAppointment);
router.get("/doctor/:doctorId/booked-slots", isAuthenticated, getBookedSlots);

// GET a single appointment by ID
router.get("/:id", isAuthenticated, getAppointmentById);

export default router;

