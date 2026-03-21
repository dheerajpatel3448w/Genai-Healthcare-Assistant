import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  fetchMedicalTimelineTool,
  detectHealthTrendsTool,
  detectRiskPatternsTool,
  getHealthContextForSymptomTool
} from "../tools/healthhistory.tool.js";

// ─────────────────────────────────────────────────────────────────────────────
// Zod sub-schemas
// ─────────────────────────────────────────────────────────────────────────────
const TrendSchema = z.object({
  metric: z.string(),
  trend: z.enum(["improving", "declining", "stable", "fluctuating", "not_found", "insufficient_data"]),
  percentageChange: z.number(),
  clinicalNote: z.string(),
  totalReadings: z.number().optional()
});

const RiskPatternSchema = z.object({
  pattern: z.string(),
  category: z.string(),
  frequency: z.number(),
  riskLevel: z.enum(["low", "moderate", "high"]),
  evidence: z.array(z.string())
});

// ─────────────────────────────────────────────────────────────────────────────
// Health History Agent
// Long-term medical intelligence engine — uses all 4 specialized tools
// to produce a structured, actionable health history assessment.
// ─────────────────────────────────────────────────────────────────────────────
export const healthHistoryAgent = new Agent({
  name: "Health History Intelligence Engine",

  tools: [
    fetchMedicalTimelineTool,
    detectHealthTrendsTool,
    detectRiskPatternsTool,
    getHealthContextForSymptomTool
  ],

  instructions: `
You are the Health History Intelligence Engine — a long-term medical analysis specialist.
Your job is NOT to just fetch data. Your job is to transform a user's full medical past into actionable clinical intelligence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A JSON payload containing:
- userId           → User's MongoDB ObjectId (required for all tools)
- currentSymptoms  → Current reported symptoms (if any — use for correlation)
- metricsToTrack   → Specific lab values to trend (e.g. ["Hemoglobin", "Blood Glucose"])
- analysisDepth    → "quick" (context only) | "full" (complete analysis)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY TOOL CALL SEQUENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — ALWAYS call \`fetch_medical_timeline\` first.
  → Build the complete chronological picture.
  → Identifies span (how many months/years of history), total events.
  → Without this, all other analysis is blind.

STEP 2 — If metricsToTrack is provided OR timeline has 2+ lab reports:
  → Call \`detect_health_trends\` with the metric names.
  → Always track common critical metrics: ["Hemoglobin", "Blood Glucose", "WBC", "Creatinine"]
  → Add any user-specified metrics on top.

STEP 3 — ALWAYS call \`detect_risk_patterns\`.
  → Even if no symptoms are mentioned, scanning for long-term patterns is always valuable.
  → Chronic patterns carry more weight than individual data points.

STEP 4 — If currentSymptoms are provided:
  → Call \`get_health_context_for_symptom\` with the symptom keywords.
  → This is the context provider result for the Symptom Agent and HealthBrain.

STEP 5 — Synthesize ALL tool results into the structured output.
  → Compute overall_health_trajectory from everything.
  → Write a clinical correlation_context string that downstream agents (Symptom Agent, Doctor Agent) can directly use.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYSIS RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **Trend interpretation:**
   - "declining" in critical metrics (Hb, platelets, kidney markers) = flag high risk
   - "improving" = positive confirmation that treatment is working
   - "fluctuating" = instability, needs follow-up

2. **Risk pattern severity:**
   - 2+ high-risk patterns = overall trajectory is "declining"
   - Only low patterns = overall trajectory "stable" or "improving"
   - Mix of moderate + high = "mixed"

3. **Correlation context is the most important output:**
   - Write \`correlation_context\` as a clinical paragraph ready to be pasted into the Symptom Agent's input.
   - Format: "Patient history shows [X]. This is [strongly/moderately/weakly] correlated with their current symptoms of [Y] because [Z]."

4. **NO REPORTS SCENARIO:**
   - Still call all tools (they handle empty data gracefully).
   - Set trajectory to "unknown" and context to "No medical history available — analysis based solely on current symptoms."

5. **Never fabricate values.** Only report what is found in actual DB data.
  `,

  outputType: z.object({
    timeline_summary: z
      .string()
      .describe("Plain language summary of the timeline: e.g. '12 reports over 18 months, 6 specialist visits.'"),

    detected_trends: z
      .array(TrendSchema)
      .describe("Array of per-metric trend objects."),

    risk_patterns: z
      .array(RiskPatternSchema)
      .describe("Array of detected long-term risk patterns."),

    correlation_context: z
      .string()
      .describe(
        "Ready-to-inject clinical context string for the Symptom Agent. Summarizes historical correlation with current symptoms."
      ),

    overall_health_trajectory: z
      .enum(["improving", "stable", "declining", "mixed", "unknown"])
      .describe("Overall direction of the patient's health based on all available history."),

    has_high_risk_patterns: z
      .boolean()
      .describe("True if any detected risk pattern is rated 'high'."),

    recommended_follow_up: z
      .string()
      .optional()
      .describe("Key clinical follow-up action based on the history analysis, e.g. 'Repeat CBC within 30 days — Hb declining trend.'")
  })
});

// ─────────────────────────────────────────────────────────────────────────────
// Export as Tool for HealthBrain Orchestrator
// ─────────────────────────────────────────────────────────────────────────────
export const healthHistoryTool = healthHistoryAgent.asTool({
  toolName: "get_health_history",

  toolDescription: `
Analyze a user's complete medical history to:
1. Detect metric-level trends (declining Hb, rising glucose, etc.)
2. Identify long-term risk patterns (chronic anemia, recurring infections, repeat specialist visits)
3. Provide correlation context linking past history to current symptoms

Call this tool when:
- The user asks about their health history or trends ("has my sugar improved?")
- Intent is "report_analysis" — provides longitudinal context beyond a single report
- Before or alongside analyze_symptoms — enriches the symptom analysis with historical correlation
- The user asks "am I getting better or worse?"

Pass userId, any current symptoms, and any specific metrics to track.
  `,

  parameters: z.object({
    userId: z
      .string()
      .describe("The user's MongoDB ObjectId. Required."),
    currentSymptoms: z
      .array(z.string())
      .optional()
      .describe("Current symptoms being reported (e.g. ['fatigue', 'chest pain']). Used to compute historical correlation."),
    metricsToTrack: z
      .array(z.string())
      .optional()
      .describe("Specific lab metric names to trend (e.g. ['Hemoglobin', 'HbA1c']). Leave empty to use defaults."),
    analysisDepth: z
      .enum(["quick", "full"])
      .optional()
      .default("full")
      .describe("'quick' = correlation context only. 'full' = complete analysis with trends and risk patterns.")
  }),

  includeInputSchema: true,

  inputBuilder: (args: any) =>
    JSON.stringify({
      userId: args.userId,
      currentSymptoms: args.currentSymptoms || [],
      metricsToTrack: args.metricsToTrack || ["Hemoglobin", "Blood Glucose", "WBC", "Creatinine", "TSH"],
      analysisDepth: args.analysisDepth || "full"
    }),

  customOutputExtractor: (result: any) => {
    try {
      if (typeof result.finalOutput === "object" && result.finalOutput !== null) {
        return JSON.stringify(result.finalOutput);
      }
      if (typeof result.finalOutput === "string") {
        return result.finalOutput;
      }
      return JSON.stringify({ error: "Health history agent returned no output." });
    } catch {
      return JSON.stringify({ error: "Failed to parse health history agent output." });
    }
  }
});
