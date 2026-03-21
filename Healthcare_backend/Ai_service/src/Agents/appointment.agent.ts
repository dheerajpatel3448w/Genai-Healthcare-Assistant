import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  bookAppointmentTool,
  checkSlotConflictTool,
  getUserAppointmentsTool,
  cancelAppointmentTool,
  rescheduleAppointmentTool,
  getAppointmentDetailsTool,
  getAvailableSlotsForDateTool,
  confirmAppointmentBookingTool
} from "../tools/appointmentagent.tool.js";

export const appointmentAgent = new Agent({
  name: "Appointment Manager AI",

  tools: [
    checkSlotConflictTool,
    bookAppointmentTool,
    getUserAppointmentsTool,
    cancelAppointmentTool,
    rescheduleAppointmentTool,
    getAppointmentDetailsTool,
    getAvailableSlotsForDateTool,
    confirmAppointmentBookingTool
  ],

  instructions: `
You are the Appointment Manager AI — a specialized sub-agent responsible for all appointment-related operations in the healthcare system.

You handle these appointment tasks with precision:
1. **Booking** new appointments
2. **Rescheduling** existing appointments
3. **Cancelling** appointments
4. **Viewing** appointments (upcoming, past, all, cancelled)
5. **Checking** slot availability for a doctor on a specific date
6. **Providing** full appointment details

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You will receive a structured JSON context containing:
- userId          → The patient's MongoDB ObjectId (REQUIRED for all operations)
- action          → What the user wants to do (book, cancel, reschedule, view, check_slots, get_details)
- doctorId        → The doctor's ObjectId (required for booking/rescheduling/checking slots)
- appointmentId   → Required for cancel/reschedule/get_details operations
- appointmentDate → ISO date string (required for booking/rescheduling/checking slots)
- startTime       → Time slot string like "10:30 AM" (required for booking/rescheduling)
- consultationType→ "online" or "offline" (required for booking)
- reason          → Optional reason for the visit
- filter          → For viewing: "upcoming" | "past" | "all" | "cancelled" (default: "upcoming")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **ALWAYS call \`check_slot_conflict\` BEFORE \`book_appointment\`** to prevent double-booking.
2. **ALWAYS call \`confirm_appointment_booking\` as the LAST STEP** after successfully booking or rescheduling. This generates the user's confirmation summary.
3. If booking fails due to a conflict, suggest using \`get_available_slots_for_date\` to show open slots.
4. NEVER skip slot conflict checking. It is mandatory.
5. Validate that required fields (userId, doctorId, date, time) are present before attempting any booking.
6. If a required field is missing, return a clear error message describing what's needed.
7. Always be polite and concise in error responses.
8. Do NOT hallucinate doctor names or appointment details — use only data returned by tools.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOOL CALL ORDER FOR BOOKING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. \`check_slot_conflict\`  → verify slot is free
2. \`book_appointment\`     → create the appointment
3. \`confirm_appointment_booking\` → generate confirmation summary

TOOL CALL ORDER FOR RESCHEDULING:
1. \`reschedule_appointment\` → updates + conflict checks internally
2. \`confirm_appointment_booking\` → generate updated confirmation
  `,

  outputType: z.object({
    appointment_result: z.string().describe(
      "A fully formatted, human-readable response about the appointment action taken — including confirmation summaries, appointment lists, cancellation details, or error messages."
    ),
    action_successful: z.boolean().describe("Whether the requested appointment action was completed successfully."),
    appointmentId: z.string().optional().describe("The ID of the affected appointment, if applicable.")
  })
});

// ─────────────────────────────────────────────
// Export as a Tool for HealthBrain Orchestrator
// ─────────────────────────────────────────────
export const appointmentManagementTool = appointmentAgent.asTool({
  toolName: "manage_appointment",

  toolDescription: `
Book, cancel, reschedule, or view appointments with doctors.
Call this tool when the user wants to:
- Book an appointment with a specific doctor
- Cancel or reschedule an existing appointment
- View their upcoming or past appointments
- Check available time slots for a doctor on a specific date
- Get full details of a specific appointment

Always pass the userId and all required context (doctorId, date, time, action, etc.) to this tool.
  `,

  parameters: z.object({
    userId: z.string().describe("The patient's MongoDB ObjectId. Required for all appointment operations."),
    action: z
      .enum(["book", "cancel", "reschedule", "view", "check_slots", "get_details"])
      .describe("The appointment action the user wants to perform."),
    doctorId: z.string().optional().describe("The doctor's MongoDB ObjectId. Required for booking, rescheduling, and checking slots."),
    appointmentId: z.string().optional().describe("The appointment ObjectId. Required for cancelling, rescheduling, and getting details."),
    appointmentDate: z.string().optional().describe("Date in ISO format (e.g. '2025-04-10'). Required for booking, rescheduling, checking slots."),
    startTime: z.string().optional().describe("Start time like '10:30 AM'. Required for booking and rescheduling."),
    newDate: z.string().optional().describe("New date for rescheduling, ISO format."),
    newStartTime: z.string().optional().describe("New time slot for rescheduling."),
    consultationType: z.enum(["online", "offline"]).optional().describe("Required for booking."),
    reason: z.string().optional().describe("Reason for the appointment visit."),
    filter: z
      .enum(["upcoming", "past", "all", "cancelled"])
      .optional()
      .describe("For 'view' action: filter appointments by status.")
  }),

  includeInputSchema: true,

  inputBuilder: (args: any) =>
    JSON.stringify({
      userId: args.userId,
      action: args.action,
      doctorId: args.doctorId || null,
      appointmentId: args.appointmentId || null,
      appointmentDate: args.appointmentDate || null,
      startTime: args.startTime || null,
      newDate: args.newDate || null,
      newStartTime: args.newStartTime || null,
      consultationType: args.consultationType || "online",
      reason: args.reason || "",
      filter: args.filter || "upcoming"
    }),

  customOutputExtractor: (result: any) => {
    try {
      if (typeof result.finalOutput === "object" && result.finalOutput !== null) {
        return JSON.stringify(result.finalOutput);
      }
      if (typeof result.finalOutput === "string") {
        return result.finalOutput;
      }
      return JSON.stringify({ error: "Invalid output from appointment agent" });
    } catch {
      return JSON.stringify({ error: "Failed to parse appointment agent output" });
    }
  }
});
