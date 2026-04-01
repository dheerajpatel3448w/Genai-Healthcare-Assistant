import { tool } from "@openai/agents";
import { z } from "zod";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.model.js";
import { DoctorProfile } from "../models/Docter.model.js";

// ─────────────────────────────────────────────
// ✅ 1. bookAppointmentTool 📅
// ─────────────────────────────────────────────
export const bookAppointmentTool = tool({
  name: "book_appointment",
  description:
    "Book a new appointment for a user with a specific doctor on a given date and time slot. Always call check_slot_conflict before booking to avoid double-booking. Returns the created appointment details.",
  parameters: z.object({
    userId: z.string().describe("The MongoDB ObjectId of the patient (user)."),
    doctorId: z.string().describe("The MongoDB ObjectId of the doctor to book with."),
    appointmentDate: z.string().describe("The appointment date in ISO format, e.g. '2025-04-10'."),
    startTime: z.string().describe("Start time for the appointment, e.g. '10:30 AM'."),
    consultationType: z
      .enum(["online", "offline"])
      .describe("Whether the appointment is online or offline / in-person."),
    reason: z.string().optional().describe("The patient's reason for the appointment."),
    notes: z.string().optional().describe("Any extra notes for the appointment.")
  }),
  execute: async ({ userId, doctorId, appointmentDate, startTime, consultationType, reason, notes }) => {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return { success: false, message: "Invalid userId or doctorId." };
      }
      // Verify doctor exists
      const doctor = await DoctorProfile.findById(doctorId).lean();
      if (!doctor) {
        return { success: false, message: "Doctor not found. Please verify the doctorId." };
      }

      // Conflict re-check inside the tool for safety
      const parsedDate = new Date(appointmentDate);
      const existing = await Appointment.findOne({
        doctorId: new mongoose.Types.ObjectId(doctorId),
        appointmentDate: parsedDate,
        startTime,
        status: { $in: ["scheduled", "rescheduled"] }
      });

      if (existing) {
        return {
          success: false,
          message: `Slot ${startTime} on ${appointmentDate} is already booked for this doctor. Please choose another time.`
        };
      }

      const appointment = await Appointment.create({
        userId: new mongoose.Types.ObjectId(userId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
        appointmentDate: parsedDate,
        startTime,
        consultationType,
        reason: reason || "",
        notes: notes || "",
        status: "scheduled",
        paymentStatus: "pending"
      });

      return {
        success: true,
        message: "Appointment booked successfully! ✅",
        appointmentId: appointment._id.toString(),
        doctorName: doctor.bio || `Doctor (${doctorId})`,
        specialization: doctor.specialization,
        date: appointmentDate,
        time: startTime,
        consultationType,
        status: "scheduled",
        paymentStatus: "pending"
      };
    } catch (error: any) {
      console.error("bookAppointmentTool error:", error);
      return { success: false, message: "Failed to book appointment. Please try again." };
    }
  }
});

// ─────────────────────────────────────────────
// ✅ 2. checkSlotConflictTool 🔍
// ─────────────────────────────────────────────
export const checkSlotConflictTool = tool({
  name: "check_slot_conflict",
  description:
    "Check whether a specific doctor is already booked at a given date and time. Always call this BEFORE booking an appointment to prevent double-booking.",
  parameters: z.object({
    doctorId: z.string().describe("The MongoDB ObjectId of the doctor."),
    appointmentDate: z.string().describe("The date to check in ISO format, e.g. '2025-04-10'."),
    startTime: z.string().describe("The time slot to check, e.g. '10:30 AM'.")
  }),
  execute: async ({ doctorId, appointmentDate, startTime }) => {
    try {
      if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return { available: false, message: "Invalid doctorId." };
      }
      const parsedDate = new Date(appointmentDate);
      const existing = await Appointment.findOne({
        doctorId: new mongoose.Types.ObjectId(doctorId),
        appointmentDate: parsedDate,
        startTime,
        status: { $in: ["scheduled", "rescheduled"] }
      });

      if (existing) {
        return {
          available: false,
          message: `Slot ${startTime} on ${appointmentDate} is already taken for this doctor.`
        };
      }

      return {
        available: true,
        message: `Slot ${startTime} on ${appointmentDate} is available. ✅`
      };
    } catch (error: any) {
      console.error("checkSlotConflictTool error:", error);
      return { available: false, message: "Could not verify slot availability." };
    }
  }
});

// ─────────────────────────────────────────────
// ✅ 3. getUserAppointmentsTool 📋
// ─────────────────────────────────────────────
export const getUserAppointmentsTool = tool({
  name: "get_user_appointments",
  description:
    "Fetch all appointments (upcoming or past) for a specific user. Useful when the user asks 'show my appointments', 'what appointments do I have?', or 'my upcoming bookings'.",
  parameters: z.object({
    userId: z.string().describe("The MongoDB ObjectId of the user."),
    filter: z
      .enum(["upcoming", "past", "all", "cancelled"])
      .default("upcoming")
      .describe("Filter appointments by status. Default is 'upcoming'.")
  }),
  execute: async ({ userId, filter }) => {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { appointments: [], message: "Invalid userId." };
      }
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };

      const now = new Date();
      if (filter === "upcoming") {
        query.appointmentDate = { $gte: now };
        query.status = { $in: ["scheduled", "rescheduled"] };
      } else if (filter === "past") {
        query.appointmentDate = { $lt: now };
      } else if (filter === "cancelled") {
        query.status = "cancelled";
      }
      // "all" has no extra filter

      const appointments = await Appointment.find(query)
        .sort({ appointmentDate: 1 })
        .populate("doctorId", "specialization bio clinicAddress hospitalName consultationType consultationFee")
        .lean();

      if (!appointments || appointments.length === 0) {
        return { appointments: [], message: `No ${filter} appointments found.` };
      }

      return {
        appointments: appointments.map((appt) => ({
          appointmentId: appt._id.toString(),
          date: appt.appointmentDate,
          time: appt.startTime,
          status: appt.status,
          consultationType: appt.consultationType,
          paymentStatus: appt.paymentStatus,
          reason: appt.reason,
          doctor: appt.doctorId
        })),
        total: appointments.length
      };
    } catch (error: any) {
      console.error("getUserAppointmentsTool error:", error);
      return { appointments: [], message: "Failed to fetch appointments." };
    }
  }
});

// ─────────────────────────────────────────────
// ✅ 4. cancelAppointmentTool ❌
// ─────────────────────────────────────────────
export const cancelAppointmentTool = tool({
  name: "cancel_appointment",
  description:
    "Cancel an existing appointment by its ID. Validates that the appointment belongs to the requesting user before cancelling.",
  parameters: z.object({
    appointmentId: z.string().describe("The MongoDB ObjectId of the appointment to cancel."),
    userId: z.string().describe("The user's ID to validate ownership of this appointment.")
  }),
  execute: async ({ appointmentId, userId }) => {
    try {
      if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId) || !userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: "Invalid appointmentId or userId." };
      }
      const appointment = await Appointment.findOne({
        _id: new mongoose.Types.ObjectId(appointmentId),
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!appointment) {
        return { success: false, message: "Appointment not found or you do not have permission to cancel it." };
      }

      if (appointment.status === "cancelled") {
        return { success: false, message: "This appointment is already cancelled." };
      }

      if (appointment.status === "completed") {
        return { success: false, message: "Cannot cancel an already completed appointment." };
      }

      appointment.status = "cancelled";
      await appointment.save();

      return {
        success: true,
        message: "Appointment cancelled successfully. ✅",
        appointmentId: appointment._id.toString(),
        cancelledAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("cancelAppointmentTool error:", error);
      return { success: false, message: "Failed to cancel appointment. Please try again." };
    }
  }
});

// ─────────────────────────────────────────────
// ✅ 5. rescheduleAppointmentTool 🔄
// ─────────────────────────────────────────────
export const rescheduleAppointmentTool = tool({
  name: "reschedule_appointment",
  description:
    "Reschedule an existing appointment to a new date and time. Validates ownership, checks for conflict at the new slot, then updates the appointment. The original appointment ID is saved in rescheduledFrom.",
  parameters: z.object({
    appointmentId: z.string().describe("The MongoDB ObjectId of the appointment to reschedule."),
    userId: z.string().describe("The user's ID to validate ownership."),
    newDate: z.string().describe("The new appointment date in ISO format, e.g. '2025-04-15'."),
    newStartTime: z.string().describe("The new start time, e.g. '02:00 PM'.")
  }),
  execute: async ({ appointmentId, userId, newDate, newStartTime }) => {
    try {
      if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId) || !userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: "Invalid appointmentId or userId." };
      }
      const appointment = await Appointment.findOne({
        _id: new mongoose.Types.ObjectId(appointmentId),
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!appointment) {
        return { success: false, message: "Appointment not found or access denied." };
      }

      if (["cancelled", "completed", "no_show"].includes(appointment.status)) {
        return { success: false, message: `Cannot reschedule a ${appointment.status} appointment.` };
      }

      // Conflict check for new slot
      const parsedNewDate = new Date(newDate);
      const conflict = await Appointment.findOne({
        doctorId: appointment.doctorId,
        appointmentDate: parsedNewDate,
        startTime: newStartTime,
        status: { $in: ["scheduled", "rescheduled"] },
        _id: { $ne: new mongoose.Types.ObjectId(appointmentId) }
      });

      if (conflict) {
        return {
          success: false,
          message: `Slot ${newStartTime} on ${newDate} is already booked for this doctor. Please choose another time.`
        };
      }

      // Keep reference to original schedule data
      const originalData = {
        date: appointment.appointmentDate,
        time: appointment.startTime
      };

      appointment.rescheduledFrom = appointment._id as any;
      appointment.appointmentDate = parsedNewDate;
      appointment.startTime = newStartTime;
      appointment.status = "rescheduled";
      await appointment.save();

      return {
        success: true,
        message: "Appointment rescheduled successfully! ✅",
        appointmentId: appointment._id.toString(),
        previousDate: originalData.date,
        previousTime: originalData.time,
        newDate,
        newStartTime
      };
    } catch (error: any) {
      console.error("rescheduleAppointmentTool error:", error);
      return { success: false, message: "Failed to reschedule appointment. Please try again." };
    }
  }
});

// ─────────────────────────────────────────────
// ✅ 6. getAppointmentDetailsTool 🔎
// ─────────────────────────────────────────────
export const getAppointmentDetailsTool = tool({
  name: "get_appointment_details",
  description:
    "Get full details of a single appointment by its ID, including doctor info and status. Useful when the user asks about a specific appointment.",
  parameters: z.object({
    appointmentId: z.string().describe("The MongoDB ObjectId of the appointment."),
    userId: z.string().describe("The user's ID for ownership validation.")
  }),
  execute: async ({ appointmentId, userId }) => {
    try {
      if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId) || !userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: "Invalid appointmentId or userId." };
      }
      const appointment = await Appointment.findOne({
        _id: new mongoose.Types.ObjectId(appointmentId),
        userId: new mongoose.Types.ObjectId(userId)
      })
        .populate("doctorId", "specialization bio clinicAddress hospitalName consultationType consultationFee experience rating languages availability")
        .lean();

      if (!appointment) {
        return { success: false, message: "Appointment not found or access denied." };
      }

      return {
        success: true,
        appointment: {
          appointmentId: appointment._id.toString(),
          date: appointment.appointmentDate,
          time: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          consultationType: appointment.consultationType,
          reason: appointment.reason,
          notes: appointment.notes,
          paymentStatus: appointment.paymentStatus,
          doctor: appointment.doctorId,
          createdAt: appointment.createdAt
        }
      };
    } catch (error: any) {
      console.error("getAppointmentDetailsTool error:", error);
      return { success: false, message: "Failed to fetch appointment details." };
    }
  }
});

// ─────────────────────────────────────────────
// ✅ 7. getAvailableSlotsForDateTool 📆
// ─────────────────────────────────────────────
export const getAvailableSlotsForDateTool = tool({
  name: "get_available_slots_for_date",
  description:
    "Get all available (unbooked) time slots for a specific doctor on a specific date, based on their working hours and slot duration.",
  parameters: z.object({
    doctorId: z.string().describe("The MongoDB ObjectId of the doctor."),
    date: z.string().describe("The date to check slots for in ISO format, e.g. '2025-04-10'.")
  }),
  execute: async ({ doctorId, date }) => {
    try {
      if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return { slots: [], message: "Invalid doctorId." };
      }
      const doctor = await DoctorProfile.findById(doctorId).lean();
      if (!doctor) return { slots: [], message: "Doctor not found." };

      const { startTime, endTime, days } = doctor.availability || {};
      if (!startTime || !endTime || !days || days.length === 0) {
        return { slots: [], message: "Doctor has no availability configured." };
      }

      // Verify doctor works on this day
      const requestedDate = new Date(date);
      const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });
      if (!days.some((d) => d.toLowerCase() === dayName.toLowerCase())) {
        return { slots: [], message: `Doctor is not available on ${dayName}.` };
      }

      // Generate time slots
      const slotDuration = doctor.slotDuration || 30; // minutes
      const generateSlots = (start: string, end: string, durationMinutes: number): string[] => {
        const parseTime = (t: string): number => {
          const parts = t.split(" ");
          const timePart = parts[0] ?? "0:00";
          const meridian = parts[1] ?? "";
          const timeParts = timePart.split(":");
          let hours = Number(timeParts[0] ?? 0);
          const minutes = Number(timeParts[1] ?? 0);
          if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
          if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };

        const formatTime = (totalMinutes: number): string => {
          const h = Math.floor(totalMinutes / 60) % 24;
          const m = totalMinutes % 60;
          const meridian = h >= 12 ? "PM" : "AM";
          const displayH = h % 12 === 0 ? 12 : h % 12;
          return `${displayH}:${m.toString().padStart(2, "0")} ${meridian}`;
        };

        const slots: string[] = [];
        let current = parseTime(start);
        const endMin = parseTime(end);
        while (current + durationMinutes <= endMin) {
          slots.push(formatTime(current));
          current += durationMinutes;
        }
        return slots;
      };

      const allSlots = generateSlots(startTime, endTime, slotDuration);

      // Fetch already booked slots for this doctor on this date
      const parsedDate = new Date(date);
      const booked = await Appointment.find({
        doctorId: new mongoose.Types.ObjectId(doctorId),
        appointmentDate: parsedDate,
        status: { $in: ["scheduled", "rescheduled"] }
      }).select("startTime");

      const bookedTimes = new Set(booked.map((b) => b.startTime));
      const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

      return {
        doctorId,
        date,
        dayName,
        totalSlots: allSlots.length,
        availableSlots,
        bookedSlots: [...bookedTimes],
        slotDurationMinutes: slotDuration
      };
    } catch (error: any) {
      console.error("getAvailableSlotsForDateTool error:", error);
      return { slots: [], message: "Failed to fetch available slots." };
    }
  }
});

// ─────────────────────────────────────────────
// ✅ 8. confirmAppointmentBookingTool ✅
// ─────────────────────────────────────────────
export const confirmAppointmentBookingTool = tool({
  name: "confirm_appointment_booking",
  description:
    "Generate a full, human-readable booking confirmation summary for the user after an appointment is successfully booked or rescheduled. Call this as the FINAL step after booking.",
  parameters: z.object({
    appointmentId: z.string().describe("The newly created or rescheduled appointment ID."),
    doctorName: z.string().describe("The doctor's display name."),
    specialization: z.string().describe("The doctor's specialization."),
    date: z.string().describe("The appointment date."),
    time: z.string().describe("The appointment time."),
    consultationType: z.string().describe("Online or offline."),
    reason: z.string().optional().describe("Reason for appointment."),
    paymentStatus: z.string().describe("Payment status: pending, paid, or failed.")
  }),
  execute: async ({ appointmentId, doctorName, specialization, date, time, consultationType, reason, paymentStatus }) => {
    const summary = `
📅 **Appointment Confirmed!**

---
🆔 **Appointment ID:** ${appointmentId}
👨‍⚕️ **Doctor:** ${doctorName}
🏥 **Specialization:** ${specialization}
📆 **Date:** ${date}
🕐 **Time:** ${time}
💻 **Type:** ${consultationType === "online" ? "Online Consultation 🌐" : "In-Person / Clinic 🏥"}
${reason ? `📝 **Reason:** ${reason}` : ""}
💳 **Payment Status:** ${paymentStatus === "paid" ? "Paid ✅" : "Pending ⏳"}

---
✅ Your appointment has been successfully booked. Make sure to be ready 5 minutes before your scheduled time!
    `.trim();

    return { confirmationSummary: summary, appointmentId };
  }
});
