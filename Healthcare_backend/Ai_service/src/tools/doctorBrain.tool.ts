import { tool } from "@openai/agents";
import { z } from "zod";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.model.js";
import { DoctorProfile } from "../models/Docter.model.js";
import { UserProfile } from "../models/userprofile.model.js";
import { Report } from "../models/report.model.js";

// ─────────────────────────────────────────────────────────────
// 1. getDoctorAppointmentsTool 📅
// ─────────────────────────────────────────────────────────────
export const getDoctorAppointmentsTool = tool({
  name: "get_doctor_appointments",
  description:
    "Fetch appointments for the logged-in doctor. Filter by: today, upcoming, past, or all. Returns patient userId, reason, time, status, payment info.",
  parameters: z.object({
    doctorId: z.string().describe("The MongoDB ObjectId of the doctor (from DoctorProfile)."),
    filter: z
      .enum(["today", "upcoming", "past", "all"])
      .default("today")
      .describe("Filter: 'today' = today's schedule, 'upcoming' = future, 'past' = history, 'all' = everything.")
  }),
  execute: async ({ doctorId, filter }) => {
    try {
      const query: any = { doctorId: new mongoose.Types.ObjectId(doctorId) };
      const now = new Date();

      if (filter === "today") {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
      } else if (filter === "upcoming") {
        query.appointmentDate = { $gt: now };
        query.status = { $in: ["scheduled", "rescheduled"] };
      } else if (filter === "past") {
        query.appointmentDate = { $lt: now };
      }

      const appointments = await Appointment.find(query)
        .sort({ appointmentDate: 1, startTime: 1 })
        .lean();

      if (!appointments.length) {
        return { appointments: [], message: `No ${filter} appointments found.` };
      }

      return {
        appointments: appointments.map((a) => ({
          appointmentId: a._id.toString(),
          patientId: a.userId.toString(),
          date: a.appointmentDate,
          startTime: a.startTime,
          endTime: a.endTime,
          status: a.status,
          consultationType: a.consultationType,
          reason: a.reason || "Not specified",
          notes: a.notes || "",
          paymentStatus: a.paymentStatus,
        })),
        total: appointments.length,
      };
    } catch (error) {
      console.error("getDoctorAppointmentsTool error:", error);
      return { appointments: [], message: "Failed to fetch doctor appointments." };
    }
  },
});

// ─────────────────────────────────────────────────────────────
// 2. updateAppointmentStatusTool ✅
// ─────────────────────────────────────────────────────────────
export const updateAppointmentStatusTool = tool({
  name: "update_appointment_status",
  description:
    "Doctor marks an appointment as completed, no_show, or cancelled. Validates the appointment belongs to this doctor before updating.",
  parameters: z.object({
    appointmentId: z.string().describe("The MongoDB ObjectId of the appointment."),
    doctorId: z.string().describe("The doctor's DoctorProfile ObjectId for ownership validation."),
    newStatus: z
      .enum(["completed", "no_show", "cancelled"])
      .describe("The new status to set.")
  }),
  execute: async ({ appointmentId, doctorId, newStatus }) => {
    try {
      const appointment = await Appointment.findOne({
        _id: new mongoose.Types.ObjectId(appointmentId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
      });

      if (!appointment) {
        return { success: false, message: "Appointment not found or does not belong to you." };
      }

      if (["cancelled", "completed"].includes(appointment.status) && appointment.status !== "completed") {
        return { success: false, message: `Appointment is already ${appointment.status}.` };
      }

      appointment.status = newStatus as any;
      await appointment.save();

      return {
        success: true,
        message: `Appointment marked as ${newStatus} successfully. ✅`,
        appointmentId: appointment._id.toString(),
        newStatus,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("updateAppointmentStatusTool error:", error);
      return { success: false, message: "Failed to update appointment status." };
    }
  },
});

// ─────────────────────────────────────────────────────────────
// 3. addAppointmentNotesTool 📝
// ─────────────────────────────────────────────────────────────
export const addAppointmentNotesTool = tool({
  name: "add_appointment_notes",
  description:
    "Add or update clinical notes for a specific appointment. Doctor can record diagnosis, prescription info, or follow-up instructions.",
  parameters: z.object({
    appointmentId: z.string().describe("The MongoDB ObjectId of the appointment."),
    doctorId: z.string().describe("The doctor's DoctorProfile ObjectId for ownership validation."),
    notes: z.string().describe("The clinical notes to save on the appointment."),
  }),
  execute: async ({ appointmentId, doctorId, notes }) => {
    try {
      const appointment = await Appointment.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(appointmentId),
          doctorId: new mongoose.Types.ObjectId(doctorId),
        },
        { notes },
        { new: true }
      );

      if (!appointment) {
        return { success: false, message: "Appointment not found or access denied." };
      }

      return {
        success: true,
        message: "Notes saved successfully. ✅",
        appointmentId: appointment._id.toString(),
        notes: appointment.notes,
      };
    } catch (error) {
      console.error("addAppointmentNotesTool error:", error);
      return { success: false, message: "Failed to save notes." };
    }
  },
});

// ─────────────────────────────────────────────────────────────
// 4. getPatientProfileTool 🧑‍⚕️
// ─────────────────────────────────────────────────────────────
export const getPatientProfileTool = tool({
  name: "get_patient_profile",
  description:
    "Fetch the full health profile of a patient by their userId. Returns medical background, allergies, chronic diseases, medications, lifestyle, and body metrics.",
  parameters: z.object({
    patientId: z.string().describe("The MongoDB userId (ObjectId) of the patient."),
  }),
  execute: async ({ patientId }) => {
    try {
      const profile = await UserProfile.findOne({
        userId: new mongoose.Types.ObjectId(patientId),
      }).lean();

      if (!profile) {
        return { found: false, message: "No health profile found for this patient." };
      }

      return { found: true, profile };
    } catch (error) {
      console.error("getPatientProfileTool error:", error);
      return { found: false, message: "Failed to fetch patient profile." };
    }
  },
});

// ─────────────────────────────────────────────────────────────
// 5. getPatientReportsTool 📄
// ─────────────────────────────────────────────────────────────
export const getPatientReportsTool = tool({
  name: "get_patient_reports",
  description:
    "Fetch medical reports for a patient. Filter by report type: lab, imaging, clinical, or all. Returns extractedText and analysis for review.",
  parameters: z.object({
    patientId: z.string().describe("The MongoDB userId (ObjectId) of the patient."),
    reportType: z
      .enum(["lab", "imaging", "clinical", "all"])
      .default("all")
      .describe("Type of reports to fetch."),
  }),
  execute: async ({ patientId, reportType }) => {
    try {
      const query: any = { patientId: new mongoose.Types.ObjectId(patientId) };
      if (reportType !== "all") query.reportType = reportType;

      const reports = await Report.find(query)
        .sort({ uploadedAt: -1 })
        .limit(10)
        .lean();

      if (!reports.length) {
        return { reports: [], message: "No reports found for this patient." };
      }

      return {
        reports: reports.map((r) => ({
          reportId: r._id.toString(),
          reportName: r.reportName,
          reportType: r.reportType,
          uploadedAt: r.uploadedAt,
          extractedText: r.extractedText?.slice(0, 500) ?? "No text extracted.",
          analysis: r.analysis,
        })),
        total: reports.length,
      };
    } catch (error) {
      console.error("getPatientReportsTool error:", error);
      return { reports: [], message: "Failed to fetch patient reports." };
    }
  },
});

// ─────────────────────────────────────────────────────────────
// 6. getPatientAppointmentHistoryTool 🕒
// ─────────────────────────────────────────────────────────────
export const getPatientAppointmentHistoryTool = tool({
  name: "get_patient_appointment_history",
  description:
    "Fetch the past appointment history of a patient across ALL doctors in the system. Useful for understanding a patient's consultation pattern.",
  parameters: z.object({
    patientId: z.string().describe("The MongoDB userId (ObjectId) of the patient."),
  }),
  execute: async ({ patientId }) => {
    try {
      const appointments = await Appointment.find({
        userId: new mongoose.Types.ObjectId(patientId),
        appointmentDate: { $lt: new Date() },
      })
        .sort({ appointmentDate: -1 })
        .limit(15)
        .populate("doctorId", "specialization bio hospitalName")
        .lean();

      if (!appointments.length) {
        return { appointments: [], message: "No past appointment history found for this patient." };
      }

      return {
        appointments: appointments.map((a) => ({
          appointmentId: a._id.toString(),
          date: a.appointmentDate,
          startTime: a.startTime,
          status: a.status,
          consultationType: a.consultationType,
          reason: a.reason,
          notes: a.notes,
          doctor: a.doctorId,
        })),
        total: appointments.length,
      };
    } catch (error) {
      console.error("getPatientAppointmentHistoryTool error:", error);
      return { appointments: [], message: "Failed to fetch patient appointment history." };
    }
  },
});

// ─────────────────────────────────────────────────────────────
// 7. updateDoctorAvailabilityTool 🗓️
// ─────────────────────────────────────────────────────────────
export const updateDoctorAvailabilityTool = tool({
  name: "update_doctor_availability",
  description:
    "Update the doctor's own availability: working days, start/end time, slot duration (in minutes), and consultation fee. Only updates fields that are provided.",
  parameters: z.object({
    doctorId: z.string().describe("The doctor's DoctorProfile ObjectId."),
    days: z
      .array(z.string())
      .optional()
      .describe("Working days, e.g. ['Monday', 'Tuesday', 'Wednesday']."),
    startTime: z.string().optional().describe("Shift start time, e.g. '09:00 AM'."),
    endTime: z.string().optional().describe("Shift end time, e.g. '05:00 PM'."),
    slotDuration: z
      .number()
      .optional()
      .describe("Duration of each appointment slot in minutes, e.g. 30."),
    consultationFee: z.number().optional().describe("Fee per consultation in INR."),
  }),
  execute: async ({ doctorId, days, startTime, endTime, slotDuration, consultationFee }) => {
    try {
      const updatePayload: any = {};
      if (days) updatePayload["availability.days"] = days;
      if (startTime) updatePayload["availability.startTime"] = startTime;
      if (endTime) updatePayload["availability.endTime"] = endTime;
      if (slotDuration) updatePayload.slotDuration = slotDuration;
      if (consultationFee) updatePayload.consultationFee = consultationFee;

      if (Object.keys(updatePayload).length === 0) {
        return { success: false, message: "No fields provided to update." };
      }

      const updated = await DoctorProfile.findByIdAndUpdate(
        doctorId,
        { $set: updatePayload },
        { new: true }
      ).lean();

      if (!updated) {
        return { success: false, message: "Doctor profile not found." };
      }

      return {
        success: true,
        message: "Availability updated successfully. ✅",
        updatedProfile: {
          availability: updated.availability,
          slotDuration: updated.slotDuration,
          consultationFee: updated.consultationFee,
        },
      };
    } catch (error) {
      console.error("updateDoctorAvailabilityTool error:", error);
      return { success: false, message: "Failed to update availability." };
    }
  },
});

// ─────────────────────────────────────────────────────────────
// 8. getDoctorOwnProfileTool 👤
// ─────────────────────────────────────────────────────────────
export const getDoctorOwnProfileTool = tool({
  name: "get_own_profile",
  description:
    "Fetch the logged-in doctor's own DoctorProfile: specialization, experience, availability, rating, services, bio, consultation fee, etc.",
  parameters: z.object({
    doctorId: z.string().describe("The MongoDB ObjectId of the DoctorProfile document."),
  }),
  execute: async ({ doctorId }) => {
    try {
      const profile = await DoctorProfile.findById(doctorId).lean();
      if (!profile) {
        return { found: false, message: "Doctor profile not found." };
      }
      return { found: true, profile };
    } catch (error) {
      console.error("getDoctorOwnProfileTool error:", error);
      return { found: false, message: "Failed to fetch doctor profile." };
    }
  },
});

// ─────────────────────────────────────────────────────────────
// 9. getDoctorStatsTool 📊
// ─────────────────────────────────────────────────────────────
export const getDoctorStatsTool = tool({
  name: "get_doctor_stats",
  description:
    "Get aggregated practice statistics for the doctor: total appointments, completed this month, no-shows, cancellations, completion rate, unique patients.",
  parameters: z.object({
    doctorId: z.string().describe("The MongoDB ObjectId of the doctor's DoctorProfile."),
  }),
  execute: async ({ doctorId }) => {
    try {
      const docObjectId = new mongoose.Types.ObjectId(doctorId);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [allTime, thisMonth] = await Promise.all([
        Appointment.aggregate([
          { $match: { doctorId: docObjectId } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
        Appointment.aggregate([
          {
            $match: {
              doctorId: docObjectId,
              appointmentDate: { $gte: startOfMonth },
            },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const toMap = (arr: { _id: string; count: number }[]) =>
        arr.reduce((acc: any, cur) => { acc[cur._id] = cur.count; return acc; }, {});

      const allMap = toMap(allTime);
      const monthMap = toMap(thisMonth);

      const totalAll = Object.values(allMap).reduce((a: any, b: any) => a + b, 0) as number;
      const completedAll = allMap["completed"] || 0;
      const completionRate =
        totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

      // Unique patients
      const uniquePatients = await Appointment.distinct("userId", { doctorId: docObjectId });

      // Doctor's own rating
      const doctor = await DoctorProfile.findById(doctorId).select("rating totalPatients").lean();

      return {
        allTime: {
          total: totalAll,
          completed: allMap["completed"] || 0,
          cancelled: allMap["cancelled"] || 0,
          no_show: allMap["no_show"] || 0,
          scheduled: allMap["scheduled"] || 0,
          completionRate: `${completionRate}%`,
          uniquePatients: uniquePatients.length,
        },
        thisMonth: {
          total: Object.values(monthMap).reduce((a: any, b: any) => a + b, 0),
          completed: monthMap["completed"] || 0,
          cancelled: monthMap["cancelled"] || 0,
          no_show: monthMap["no_show"] || 0,
        },
        platformStats: {
          rating: doctor?.rating ?? 0,
          totalPatients: doctor?.totalPatients ?? 0,
        },
      };
    } catch (error) {
      console.error("getDoctorStatsTool error:", error);
      return { message: "Failed to fetch doctor statistics." };
    }
  },
});
