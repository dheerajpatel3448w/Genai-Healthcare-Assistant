import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  getPatientProfileTool,
  getPatientReportsTool,
  getPatientAppointmentHistoryTool,
} from "../tools/doctorBrain.tool.js";

// ─────────────────────────────────────────────────────────────
// PatientInsight Sub-Agent
// Gives doctors a complete pre-consultation patient summary
// ─────────────────────────────────────────────────────────────
export const patientInsightAgent = new Agent({
  name: "Patient Insight Agent",
  tools: [getPatientProfileTool, getPatientReportsTool, getPatientAppointmentHistoryTool],
  instructions: `
You are the Patient Insight Agent — a clinical research sub-agent that helps doctors understand their patient before or during a consultation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- patientId     → The patient's MongoDB userId (REQUIRED for all tools)
- reportType    → lab / imaging / clinical / all (optional, default all)
- focusArea     → Optional hint: e.g., "cardiac history", "blood sugar trends"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY TOOL CALL SEQUENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALWAYS call ALL THREE tools simultaneously for a complete picture:
1. \`get_patient_profile\` → Medical background, allergies, chronic diseases, medications, lifestyle
2. \`get_patient_reports\` → Latest medical reports (lab/imaging/clinical results)
3. \`get_patient_appointment_history\` → Past consultations across all doctors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Correlate chronic diseases + current medications → flag potential drug interactions or disease progression signals.
2. If reports show abnormal findings → highlight them clearly.
3. Look at appointment history → detect patterns (frequent orthopedic visits = possible chronic joint issue).
4. Identify red flags the doctor should be aware of immediately.
5. If no profile/reports found → proceed with partial data and state limitations clearly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A structured patient brief that DoctorBrain will format for the doctor.
Written clinically — for a doctor, not the patient.
  `,
  outputType: z.object({
    patientSummary: z
      .string()
      .describe("A clinical summary of the patient: profile highlights, key report findings, consultation history patterns."),
    redFlags: z
      .array(z.string())
      .describe("Immediate clinical concerns the doctor should be aware of."),
    recentReports: z
      .array(
        z.object({
          reportType: z.string(),
          reportName: z.string().optional(),
          keyFindings: z.string(),
          uploadedAt: z.any(),
        })
      )
      .optional()
      .describe("Summary of the most recent reports."),
    consultationHistory: z
      .string()
      .optional()
      .describe("Brief pattern observed from past consultations."),
    profileFound: z.boolean().describe("Whether a health profile exists for this patient."),
  }),
});

export const patientInsightTool = patientInsightAgent.asTool({
  toolName: "get_patient_insight",
  toolDescription: `
Get a comprehensive pre-consultation patient brief for the doctor.
Fetches and synthesizes: health profile, medical reports, and past appointment history.
Call when the doctor wants to review a patient before or during a consultation.
Pass patientId (the patient's userId).
  `,
  parameters: z.object({
    patientId: z.string().describe("The patient's MongoDB userId."),
    reportType: z
      .enum(["lab", "imaging", "clinical", "all"])
      .optional()
      .default("all")
      .describe("Type of reports to focus on."),
    focusArea: z
      .string()
      .optional()
      .describe("Optional clinical focus, e.g. 'cardiac', 'diabetes management'."),
  }),
  includeInputSchema: true,
  inputBuilder: (args: any) => JSON.stringify(args),
  customOutputExtractor: (result: any) => {
    try {
      if (result.finalOutput && typeof result.finalOutput === "object") {
        return JSON.stringify(result.finalOutput);
      }
      return String(result.finalOutput ?? "No patient insight available.");
    } catch {
      return "Failed to parse patient insight output.";
    }
  },
});
