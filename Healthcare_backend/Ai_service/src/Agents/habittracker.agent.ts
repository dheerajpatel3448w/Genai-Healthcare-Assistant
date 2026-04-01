import { Agent } from "@openai/agents";
import { z } from "zod";
import {
  getTodayWellnessSnapshotTool,
  getWeeklyHabitAnalysisTool,
  getPersonalizedWellnessCoachingTool,
} from "../tools/habittracker.tool.js";

// ─────────────────────────────────────────────────────────────────────────────
// Wellness Coach Agent
// Reads real habit data from DailyLog + HabitGoal and delivers AI-driven
// personalised wellness coaching grounded entirely in the user's actual data.
// ─────────────────────────────────────────────────────────────────────────────
export const habitTrackerAgent = new Agent({
  name: "Wellness Coach",

  tools: [
    getTodayWellnessSnapshotTool,
    getWeeklyHabitAnalysisTool,
    getPersonalizedWellnessCoachingTool,
  ],

  instructions: `
You are the Wellness Coach — a warm, data-driven personal wellness advisor integrated into a healthcare AI platform.
Your job is to give PERSONALISED, SPECIFIC coaching based on the user's REAL logged habit data. Never give generic advice.
Every single recommendation must be grounded in what the tools actually return.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A JSON payload containing:
- userId           → MongoDB ObjectId (required for all tool calls)
- specificConcern  → The user's exact wellness question (use this for personalisation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY TOOL CALL SEQUENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — ALWAYS call \`get_today_wellness_snapshot\` first.
  → Gets the user's live today data: score, per-habit completion, which goals are pending.
  → Without this, your coaching will be disconnected from reality.

STEP 2 — ALWAYS call \`get_weekly_habit_analysis\`.
  → Gets the 7-day picture: streak, weakest/strongest habit, per-habit trends.
  → This tells you WHAT to coach on and whether the user is improving or declining.

STEP 3 — ALWAYS call \`get_personalized_wellness_coaching\`.
  → Pass: weakestHabit (from Step 2), wellnessScore (from Step 1), and specificConcern.
  → This generates the 3-step, achievable-today action plan.

STEP 4 — Synthesize ALL tool outputs into the structured outputType.
  → Use real numbers from the tools — never invent data.
  → Set urgent_flag: true if wellnessScore < 30 AND the coaching tool returned urgent_flag: true.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COACHING PRINCIPLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **Specificity over generics:** Say "You logged 4/8 glasses of water today" not "drink more water."
2. **Focus on the weakest link:** One focused improvement delivers more value than scattered advice.
3. **Be encouraging, not shaming:** Acknowledge progress, then guide toward improvement.
4. **Streaks matter:** Celebrate streaks. Acknowledge missed days without guilt.
5. **Urgent flag:** If score < 30 for multiple days, gently recommend the user consider speaking with a healthcare professional.
6. **No medical diagnoses:** You are a wellness coach, not a doctor. Never diagnose or prescribe.
  `,

  outputType: z.object({
    today_snapshot: z
      .string()
      .describe("Plain-language summary of today's logged habits and wellness score."),

    weekly_summary: z
      .string()
      .describe("Plain-language summary of the past 7 days: avg score, streak, trends."),

    weakest_habit: z
      .string()
      .describe("The habit with the lowest weekly completion rate, e.g. 'sleep'."),

    strongest_habit: z
      .string()
      .describe("The habit with the highest weekly completion rate."),

    streak_days: z
      .number()
      .describe("Number of consecutive days with a wellness score of 80 or above."),

    coaching_plan: z
      .array(z.string())
      .describe("3 concrete, achievable-today action steps focused on the weakest habit."),

    motivation_message: z
      .string()
      .describe("A warm, personalised motivational message tying the coaching together."),

    urgent_flag: z
      .boolean()
      .describe("True if the wellness score is critically low (< 30) — triggers an extra care warning."),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Export as Tool for HealthBrain Orchestrator
// ─────────────────────────────────────────────────────────────────────────────
export const wellnessCoachTool = habitTrackerAgent.asTool({
  toolName: "get_wellness_coaching",

  toolDescription: `
Analyse the user's daily wellness habits (hydration, sleep, physical activity, healthy meals,
screen breaks, stress relief) using their real logged data and provide personalised, actionable coaching.

Call this tool when intent is "wellness" OR the user asks:
- "How am I doing today / this week with my habits?"
- "What is my wellness score?"
- "Which habit should I improve?"
- "Give me a wellness / daily health plan"
- "My sleep / water intake / activity is bad, help me fix it"
- "How many day streak do I have?"
- "Am I being consistent with my habits?"
- "What should I focus on for better wellness?"

DO NOT call this for general symptom questions or medical diagnosis requests.
  `,

  parameters: z.object({
    userId: z
      .string()
      .describe("The user's MongoDB ObjectId. Required."),
    specificConcern: z
      .string()
      .optional().nullable()
      .describe("The user's exact wellness query for context-aware personalisation."),
  }),

  includeInputSchema: true,

  inputBuilder: (args: any) => {
    console.log("\n[🤖 AGENT HANDOFF] HealthBrain -> WellnessCoachAgent");
    const params = args.params || args;
    console.log("   -> userId:", params.userId);
    console.log("   -> specificConcern:", params.specificConcern);
    return JSON.stringify({
      userId:          params.userId,
      specificConcern: params.specificConcern ?? null,
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
      return JSON.stringify({ error: "Wellness coach agent returned no output." });
    } catch {
      return JSON.stringify({ error: "Failed to parse wellness coach output." });
    }
  },
});
