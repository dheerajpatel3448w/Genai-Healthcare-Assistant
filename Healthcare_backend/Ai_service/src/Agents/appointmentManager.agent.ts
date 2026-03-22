import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  getDoctorAppointmentsTool,
  updateAppointmentStatusTool,
  addAppointmentNotesTool,
} from "../tools/doctorBrain.tool.js";

// ─────────────────────────────────────────────────────────────
// AppointmentManager Sub-Agent
// Handles all doctor-side appointment operations
// ─────────────────────────────────────────────────────────────
export const appointmentManagerAgent = new Agent({
  name: "Appointment Manager Agent",
  tools: [getDoctorAppointmentsTool, updateAppointmentStatusTool, addAppointmentNotesTool],
  instructions: `
You are the Appointment Manager — a specialized sub-agent for doctors to manage their appointment workflow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A JSON context containing:
- doctorId     → The doctor's DoctorProfile MongoDB ObjectId (REQUIRED for all tools)
- action       → What the doctor wants: view, update_status, add_notes
- filter       → today / upcoming / past / all (for viewing)
- appointmentId → Required for status update and adding notes
- newStatus    → completed / no_show / cancelled (for status update)
- notes        → Clinical notes text (for notes update)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOOL CALL RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Viewing appointments → \`get_doctor_appointments\` with the appropriate filter
   - "today's appointments" or "my schedule" → filter: "today"
   - "upcoming" / "what's next" → filter: "upcoming"
   - "past" / "history" → filter: "past"
   - "all" → filter: "all"

2. Marking appointment → \`update_appointment_status\`
   - ALWAYS validate doctorId is passed
   - Status must be: "completed", "no_show", or "cancelled"

3. Adding notes → \`add_appointment_notes\`
   - Pass the full notes text from the doctor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return structured data for DoctorBrain to synthesize into a formatted Markdown response.
Include: appointments list, action results, counts, and any important notes.
  `,
  outputType: z.object({
    result: z.string().describe("Summary of the action or fetched data, as a structured text for DoctorBrain to synthesize."),
    appointments: z
      .array(
        z.object({
          appointmentId: z.string(),
          patientId: z.string().optional(),
          date: z.any().optional(),
          startTime: z.string().optional(),
          status: z.string().optional(),
          reason: z.string().optional(),
          notes: z.string().optional(),
          consultationType: z.string().optional(),
          paymentStatus: z.string().optional(),
        })
      )
      .optional()
      .describe("List of appointments, if applicable."),
    totalCount: z.number().optional().describe("Total number of appointments returned."),
    actionSuccess: z.boolean().optional().describe("Whether a write action (status update/notes) succeeded."),
  }),
});

export const appointmentManagerTool = appointmentManagerAgent.asTool({
  toolName: "manage_appointments",
  toolDescription: `
Manage doctor-side appointments:
- View today's, upcoming, past, or all appointments
- Mark an appointment as completed, no_show, or cancelled
- Add clinical notes to an appointment
Always pass doctorId. For view, pass filter. For updates, pass appointmentId.
  `,
  parameters: z.object({
    doctorId: z.string().describe("The doctor's DoctorProfile ObjectId."),
    action: z
      .enum(["view", "update_status", "add_notes"])
      .describe("What operation to perform."),
    filter: z
      .enum(["today", "upcoming", "past", "all"])
      .optional()
      .describe("Used when action = view. Defaults to 'today'."),
    appointmentId: z
      .string()
      .optional()
      .describe("Required for update_status and add_notes."),
    newStatus: z
      .enum(["completed", "no_show", "cancelled"])
      .optional()
      .describe("Required when action = update_status."),
    notes: z
      .string()
      .optional()
      .describe("Clinical notes text. Required when action = add_notes."),
  }),
  includeInputSchema: true,
  inputBuilder: (args: any) => JSON.stringify(args),
  customOutputExtractor: (result: any) => {
    try {
      if (result.finalOutput && typeof result.finalOutput === "object") {
        return JSON.stringify(result.finalOutput);
      }
      return String(result.finalOutput ?? "No output from appointment manager.");
    } catch {
      return "Failed to parse appointment manager output.";
    }
  },
});
