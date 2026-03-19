import type { Request, Response, RequestHandler } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { Appointment } from "../model/Appointment.model.js";

// Create Appointment
export const createAppointment: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { doctorId, appointmentDate, startTime, endTime, consultationType, reason } = req.body;

  if (!doctorId || !appointmentDate || !startTime) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const appointment = await Appointment.create({
    userId,
    doctorId,
    appointmentDate,
    startTime,
    endTime,
    consultationType: consultationType || "online",
    reason
  });

  return res.status(201).json({ success: true, appointment });
});

// Get User's Appointments
export const getUserAppointments: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const appointments = await Appointment.find({ userId }).sort({ appointmentDate: 1 });
  return res.status(200).json({ success: true, appointments });
});

// Get Doctor's Appointments
export const getDoctorAppointments: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const appointments = await Appointment.find({ doctorId: doctorId as string }).sort({ appointmentDate: 1 });
  
  return res.status(200).json({ success: true, appointments });
});

// Update Appointment Status
export const updateAppointmentStatus: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ["scheduled", "completed", "cancelled", "rescheduled", "no_show"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  let updateData: any = {};
  if (status) updateData.status = status;
  if (notes) updateData.notes = notes;

  const appointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });
  
  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }

  return res.status(200).json({ success: true, appointment });
});

// Cancel Appointment
export const cancelAppointment: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const appointment = await Appointment.findOneAndUpdate(
    { _id: id as string, userId },
    { status: "cancelled" },
    { new: true }
  );

  if (!appointment) {
    return res.status(404).json({ success: false, message: "Appointment not found or unauthorized" });
  }

  return res.status(200).json({ success: true, message: "Appointment cancelled successfully", appointment });
});

// Reschedule Appointment
export const rescheduleAppointment: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { appointmentDate, startTime, endTime } = req.body;

  if (!appointmentDate || !startTime) {
    return res.status(400).json({ success: false, message: "New appointment date and start time are required" });
  }

  const original = await Appointment.findOne({ _id: id as string, userId });
  if (!original) {
    return res.status(404).json({ success: false, message: "Original appointment not found" });
  }

  if (original.status === "cancelled" || original.status === "completed") {
    return res.status(400).json({ success: false, message: "Cannot reschedule a completed or cancelled appointment" });
  }

  // Mark original as rescheduled
  original.status = "rescheduled";
  await original.save();

  // Create new appointment
  const newAppointment = await Appointment.create({
    userId,
    doctorId: original.doctorId,
    appointmentDate,
    startTime,
    endTime,
    consultationType: original.consultationType,
    status: "scheduled",
    rescheduledFrom: original._id
  });

  return res.status(201).json({ success: true, message: "Appointment rescheduled successfully", appointment: newAppointment });
});

// Get Booked Slots (Availability Check)
export const getBookedSlots: RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const { date } = req.query; // YYYY-MM-DD

  if (!doctorId || !date) {
    return res.status(400).json({ success: false, message: "Doctor ID and date query are required" });
  }

  const targetDate = new Date(date as string);
  const nextDay = new Date(targetDate);
  nextDay.setDate(targetDate.getDate() + 1);

  const appointments = await Appointment.find({
    doctorId: doctorId as string,
    appointmentDate: {
      $gte: targetDate,
      $lt: nextDay
    },
    status: { $nin: ["cancelled", "rescheduled"] }
  }).select("startTime endTime status -_id");

  return res.status(200).json({ success: true, date, bookedSlots: appointments });
});

