import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  searchDoctorBasicTool,
  smartDoctorRankingTool,
  locationBasedDoctorTool,
  availabilityCheckTool,
  languageMatchTool,
  consultationTypeFilterTool,
  topRatedDoctorTool,
  emergencyDoctorTool,
  doctorExplanationTool,
  smartDoctorSearchTool,
  feeFilterTool,
  experienceFilterTool,
  nextAvailableSlotTool,
  personalizedDoctorMatchTool,
  getDoctorProfileTool
} from "../tools/docteragent.tool.js";

export const docterAgent = new Agent({
  name: "Advanced Doctor Recommendation AI",

  tools: [
    smartDoctorSearchTool,
    personalizedDoctorMatchTool,
    searchDoctorBasicTool,
    smartDoctorRankingTool,
    locationBasedDoctorTool,
    availabilityCheckTool,
    languageMatchTool,
    consultationTypeFilterTool,
    topRatedDoctorTool,
    emergencyDoctorTool,
    doctorExplanationTool,
    feeFilterTool,
    experienceFilterTool,
    nextAvailableSlotTool,
    getDoctorProfileTool
  ],

  instructions: `
You are the Advanced Doctor Recommendation AI — a specialized sub-agent that finds, filters, ranks, and presents the best verified doctors for a patient.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A JSON context containing:
- SymptomAnalysis    → Clinical findings from the Symptom Agent (if available)
- TargetSpecialization → Specialization needed (e.g. "Cardiologist")
- UserPreferences    → Any user preferences (language, budget, online/offline, location)
- SeverityLevel      → "low" | "moderate" | "high" | "critical"
- IsEmergency        → Boolean — true if symptoms are critical
- UserLocation       → City/region if specified by the user
- UserId             → The patient's ID

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOOL PREFERENCE ORDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 EMERGENCY (IsEmergency = true OR SeverityLevel = "critical" | "high"):
1. \`get_emergency_doctors\` → immediately get top 3 most experienced doctors
2. \`get_next_available_slot\` → for each doctor
3. \`explain_doctor_choice\` → explain why each is recommended (pass doctorName explicitly!)
→ Output immediately. Do NOT waste time on filters.

📋 STANDARD FLOW (non-emergency):
1. \`smart_doctor_search\` OR \`personalized_doctor_match\` → start here to get initial list
2. If user specifies location → additionally call \`find_doctors_nearby\`
3. Apply secondary filters only IF needed:
   - Language preference → \`filter_by_language\`
   - Consultation mode → \`filter_by_consultation_type\`
   - Budget → \`filter_by_fee\`
   - Experience threshold → \`filter_by_experience\`
4. Rank the final list → \`rank_doctors\` (pass UserPreferences string!)
5. Get next slot for each top doctor → \`get_next_available_slot\`
6. Generate explanation for each → \`explain_doctor_choice\` (ALWAYS pass doctorName, not bio!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZERO RESULTS FALLBACK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If any search returns empty results:
1. Retry with a broader query (remove one filter at a time)
2. Try \`get_top_rated_doctors\` with a lower minRating (try 3.0 if 4.0 returns nothing)
3. If still no results, explicitly state: "No verified doctors found for [specialization] in our system. We recommend contacting a nearby hospital directly."
NEVER hallucinate or invent doctor names/details.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ALWAYS pass \`doctorName\` (e.g. "Dr. Sharma") to \`explain_doctor_choice\` — never pass the raw bio text.
2. ALWAYS call \`get_next_available_slot\` for the top recommended doctors so the user sees a real date.
3. ALWAYS present 3–5 doctors. Never present just 1 unless only 1 is found.
4. Format output as clean, structured Markdown with emoji. Make it visually rich.
5. Set \`booking_action_required: true\` if severity is "high" or "critical" or IsEmergency is true.
6. Set \`total_doctors_found\` to the actual number of doctors retrieved.
  `,

  outputType: z.object({
    doctor_recommendations: z
      .string()
      .describe(
        "A beautifully formatted Markdown string listing the top 3–5 recommended doctors with their stats, availability, and why they were chosen."
      ),
    booking_action_required: z
      .boolean()
      .describe("True if the patient should book immediately due to emergency or critical severity."),
    total_doctors_found: z
      .number()
      .describe("Total number of matching doctors found in the database."),
    emergency_flag: z
      .boolean()
      .describe("True if the case is an emergency and the user should seek immediate attention.")
  })
});

// ─────────────────────────────────────────────
// Export as Tool for HealthBrain Orchestrator
// ─────────────────────────────────────────────
export const doctorSuggestionTool = docterAgent.asTool({
  toolName: "suggest_doctors",

  toolDescription: `
Search, filter, rank, and suggest the best verified doctors from the database.
Call this tool AFTER 'analyze_symptoms' when the symptom analysis determines a doctor is needed.
Also call it directly if the user explicitly asks to find, browse, or compare doctors.
Pass ALL available context: symptom analysis, specialization, severity, user preferences, location, and userId.
  `,

  parameters: z.object({
    symptomsAnalysis: z
      .string()
      .describe("The full JSON/text output from the Symptom Agent analysis"),
    suggestedSpecialization: z
      .string()
      .describe("The specialization recommended by the Symptom Agent or requested by the user"),
    severityLevel: z
      .enum(["low", "moderate", "high", "critical"])
      .describe("Symptom severity from the Symptom Agent output. Use 'moderate' if unknown."),
    isEmergency: z
      .boolean()
      .describe("Whether the case is classified as an emergency. Use false if unknown."),
    userPreferences: z
      .string()
      .describe("User preferences as natural language: language, budget, consultation mode, etc. Pass empty string if none."),
    userLocation: z
      .string()
      .describe("User's city or region if they mentioned one. Pass empty string if unknown."),
    userId: z
      .string()
      .describe("The patient's user ID. Pass empty string if unknown.")
  }),

  includeInputSchema: true,

  inputBuilder: (args: any) => {
    const params = args.params || args;
    return JSON.stringify({
      SymptomAnalysis: params.symptomsAnalysis,
      TargetSpecialization: params.suggestedSpecialization,
      SeverityLevel: params.severityLevel || "moderate",
      IsEmergency: params.isEmergency || false,
      UserPreferences: params.userPreferences || "None specified",
      UserLocation: params.userLocation || null,
      UserId: params.userId || null
    });
  },

  customOutputExtractor: (result: any) => {
    try {
      if (typeof result.finalOutput === "object" && result.finalOutput !== null) {
        return JSON.stringify(result.finalOutput);
      }
      if (typeof result.finalOutput === "string") {
        return result.finalOutput;
      }
      return JSON.stringify({ error: "Invalid output format from doctor agent" });
    } catch {
      return JSON.stringify({ error: "Failed to parse doctor agent output" });
    }
  }
});
