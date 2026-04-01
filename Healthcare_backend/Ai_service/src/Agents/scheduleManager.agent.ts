import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  getDoctorOwnProfileTool,
  updateDoctorAvailabilityTool,
} from "../tools/doctorBrain.tool.js";
import { getAvailableSlotsForDateTool } from "../tools/appointmentagent.tool.js";

// ─────────────────────────────────────────────────────────────
// ScheduleManager Sub-Agent
// Manages doctor's own schedule, availability, and profile
// ─────────────────────────────────────────────────────────────
export const scheduleManagerAgent = new Agent({
  name: "Schedule Manager Agent",
  tools: [getDoctorOwnProfileTool, updateDoctorAvailabilityTool, getAvailableSlotsForDateTool],
  instructions: `
You are the Schedule Manager — a sub-agent that helps doctors manage their own working schedule and profile.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- doctorId        → The doctor's DoctorProfile ObjectId (REQUIRED for all tools)
- action          → view_profile / update_availability / check_slots
- updateData      → Object with fields to update: days, startTime, endTime, slotDuration, consultationFee
- checkDate       → Date to check available slots for (ISO format, e.g. '2025-04-10')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOOL RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Viewing profile → \`get_own_profile\` with doctorId
   - Always start with this to see current schedule before suggesting changes.

2. Updating availability → \`update_doctor_availability\`
   - Only pass fields that need changing. Do NOT pass null for optional fields.
   - Days must be full name: "Monday", "Tuesday", etc.
   - Times must be in "09:00 AM" / "05:00 PM" format.
   - Validate: startTime must be before endTime.

3. Checking available slots → \`get_available_slots_for_date\`
   - Pass doctorId and the date string.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return structured schedule data for DoctorBrain to format.
  `,
  outputType: z.object({
    result: z.string().describe("Summary of the schedule action, viewable data, or confirmation."),
    currentProfile: z
      .object({
        specialization: z.string().optional().nullable(),
        experience: z.number().optional().nullable(),
        availability: z
          .object({
            days: z.array(z.string()).optional().nullable(),
            startTime: z.string().optional().nullable(),
            endTime: z.string().optional().nullable(),
          })
          .optional().nullable(),
        slotDuration: z.number().optional().nullable(),
        consultationFee: z.number().optional().nullable(),
        consultationType: z.array(z.string()).optional().nullable(),
        rating: z.number().optional().nullable(),
      })
      .optional().nullable()
      .describe("Doctor's current profile data."),
    availableSlots: z.array(z.string()).optional().nullable().describe("Available slots for the checked date."),
    updateSuccess: z.boolean().optional().nullable().describe("Whether an update operation succeeded."),
  }),
});

export const scheduleManagerTool = scheduleManagerAgent.asTool({
  toolName: "manage_schedule",
  toolDescription: `
Manage the doctor's own schedule and profile:
- View own profile: specialization, availability, fees, rating
- Update availability: working days, start/end time, slot duration, consultation fee
- Check available appointment slots for a specific date
Always pass doctorId.
  `,
  parameters: z.object({
    doctorId: z.string().describe("The doctor's DoctorProfile ObjectId."),
    action: z
      .enum(["view_profile", "update_availability", "check_slots"])
      .describe("The schedule action to perform."),
    days: z.array(z.string()).optional().nullable().describe("New working days list."),
    startTime: z.string().optional().nullable().describe("New shift start time, e.g. '09:00 AM'."),
    endTime: z.string().optional().nullable().describe("New shift end time, e.g. '05:00 PM'."),
    slotDuration: z.number().optional().nullable().describe("Slot duration in minutes."),
    consultationFee: z.number().optional().nullable().describe("Fee per consultation in INR."),
    checkDate: z.string().optional().nullable().describe("Date to check slots for, in ISO format."),
  }),
  includeInputSchema: true,
  inputBuilder: (args: any) => JSON.stringify(args),
  customOutputExtractor: (result: any) => {
    try {
      if (result.finalOutput && typeof result.finalOutput === "object") {
        return JSON.stringify(result.finalOutput);
      }
      return String(result.finalOutput ?? "No schedule data available.");
    } catch {
      return "Failed to parse schedule manager output.";
    }
  },
});
