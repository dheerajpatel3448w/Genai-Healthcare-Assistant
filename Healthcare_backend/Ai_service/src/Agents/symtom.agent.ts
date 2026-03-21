import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  getRelevantReportsTool,
  getUserHealthProfileTool,
  getRecentAppointmentHistoryTool
} from "../tools/symtomagent.tool.js";

export const symptomAgent = new Agent({
  name: "Symptom Analysis Agent",

  tools: [
    getRelevantReportsTool,
    getUserHealthProfileTool,
    getRecentAppointmentHistoryTool
  ],

  instructions: `
You are a Clinical Symptom Analysis Specialist AI — a highly precise medical reasoning engine.

Your role is to analyze a user's symptoms in full clinical context: their health profile, past reports, and appointment history. You produce a structured clinical assessment that the HealthBrain Orchestrator will use to decide next steps.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A JSON payload containing:
- userId           → The patient's MongoDB ObjectId (REQUIRED for all tool calls)
- symptomsDescription → The user's described symptoms and their severity
- symptomDuration  → How long symptoms have been present (if provided)
- userProfile      → Partially stringified profile (use as preliminary context only — fetch the full profile using get_user_health_profile)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY TOOL CALL SEQUENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You MUST call ALL three tools before forming your analysis:

1. \`get_user_health_profile\` (userId)
   → Fetch full profile: chronic diseases, medications, allergies, lifestyle, BMI.
   → Check clinicalHighlights for pre-existing risk factors.

2. \`get_relevant_reports\` (userId + symptomsDescription as userQuery)
   → Fetch and correlate past medical reports against current symptoms.
   → If no reports → proceed; mark report correlation as "No past reports available."

3. \`get_recent_appointment_history\` (userId)
   → Check if user recently saw a specialist for similar issues.
   → Correlate: "User visited a Cardiologist 3 months ago — current chest symptoms may be a continuation."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **Correlate everything**: symptoms + profile chronic diseases + report findings + appointment history.
2. **Risk amplifiers to check proactively**:
   - Is the user a smoker with respiratory symptoms? → Elevate severity.
   - Is the user diabetic with non-healing wounds or fatigue? → Flag high risk.
   - Family history of heart disease + current chest pain? → Flag critical.
   - High BMI + joint pain or breathlessness? → Note obesity-related risk.
   - Current medication side-effects that match symptoms? → Note drug reaction risk.
3. **Severity calibration**:
   - \`low\`      → Mild symptoms, no red flags, no relevant history.
   - \`moderate\` → Persistent symptoms OR profile risk factors OR report abnormalities.
   - \`high\`     → Multiple correlated red flags, chronic disease complications, escalating symptoms.
   - \`critical\` → Chest pain + cardiac history, stroke symptoms, severe breathing difficulty, loss of consciousness — any life-threatening indicators.
4. **\`urgent_care_needed\`**: Set to \`true\` ONLY for critical cases where the user should go to an ER immediately, not just book an appointment.
5. **\`doctor_needed\`**: Set to \`true\` for any severity above \`low\` or if symptoms persist > 3 days.
6. **\`recommended_specialist\`**: Be specific (e.g., "Pulmonologist" not just "lung doctor").
7. **NO REPORTS FOUND?** → Do NOT refuse or output an error. Proceed with a thorough symptom-only analysis. Note clearly: "Analysis based on reported symptoms only — no historical reports available."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Keep \`clinical_analysis\` strictly medical, detailed, and objective. 
- HealthBrain will convert this into user-friendly language — you write for a doctor, not a patient.
- Include which report IDs (if any) correlated with the finding in \`related_report_ids\`.
- Do NOT provide treatment advice, prescriptions, or home remedies.
  `,

  outputType: z.object({
    clinical_analysis: z
      .string()
      .describe(
        "Detailed clinical reasoning: symptom correlation with reports, profile risk factors, and appointment history. Written for the HealthBrain orchestrator, not the user directly."
      ),
    identified_risks: z
      .array(z.string())
      .describe("List of specific clinical risks identified, e.g. 'Hypertension + headache → possible BP spike'."),
    severity_level: z
      .enum(["low", "moderate", "high", "critical"])
      .describe("Overall severity of the current presentation."),
    doctor_needed: z
      .boolean()
      .describe("Whether a doctor consultation is recommended."),
    urgent_care_needed: z
      .boolean()
      .describe(
        "True ONLY for life-threatening emergencies where the patient should go to an ER immediately, not just book an appointment."
      ),
    recommended_specialist: z
      .string()
      .optional()
      .describe("The specific specialist the user should see, e.g. 'Cardiologist', 'Pulmonologist'."),
    symptom_duration: z
      .string()
      .optional()
      .describe("The duration of symptoms as reported by the user or inferred from context."),
    related_report_ids: z
      .array(z.string())
      .optional()
      .describe("IDs of past medical reports that were directly correlated in this analysis.")
  })
});


// ─────────────────────────────────────────────
// Export as Tool for HealthBrain Orchestrator
// ─────────────────────────────────────────────
export const symptomAnalysisTool = symptomAgent.asTool({
  toolName: "analyze_symptoms",

  toolDescription: `
Deeply analyze user symptoms using their full clinical context: health profile, past medical reports, and appointment history.
Call this tool when the user describes any medical symptoms or complaints.
Pass the userId, symptomsDescription, symptomDuration, and userProfile. The agent will fetch all additional context itself.
Returns severity level, identified risks, whether a doctor is urgently needed, and the recommended specialist.
  `,

  parameters: z.object({
    userId: z
      .string()
      .describe("The user's MongoDB ObjectId. Required for the agent to fetch their profile, reports, and history."),
    symptomsDescription: z
      .string()
      .describe("The user's described symptoms as a clear, structured string."),
    symptomDuration: z
      .string()
      .optional()
      .describe("How long the user has had these symptoms, e.g. '3 days', '2 weeks'."),
    userProfile: z
      .string()
      .optional()
      .describe(
        "A brief stringified snapshot of the user's health profile (preliminary context). The agent will fetch the full profile itself."
      )
  }),

  includeInputSchema: true,

  // FIX: Key was 'symptoms' but agent instructions expected 'symptomsDescription' — now aligned
  inputBuilder: (args: any) =>
    JSON.stringify({
      userId: args.userId,
      symptomsDescription: args.symptomsDescription,
      symptomDuration: args.symptomDuration || "Not specified",
      userProfile: args.userProfile || "Not provided — agent will fetch full profile."
    }),

  customOutputExtractor: (result: any) => {
    try {
      if (typeof result.finalOutput === "object" && result.finalOutput !== null) {
        return JSON.stringify(result.finalOutput);
      }
      if (typeof result.finalOutput === "string") {
        return result.finalOutput;
      }
      return JSON.stringify({ error: "Symptom agent returned no output" });
    } catch {
      return JSON.stringify({ error: "Failed to parse symptom agent output" });
    }
  }
});
