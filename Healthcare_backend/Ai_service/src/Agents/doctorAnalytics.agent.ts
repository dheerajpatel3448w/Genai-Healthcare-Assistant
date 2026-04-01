import { Agent } from "@openai/agents";
import { z } from "zod";
import { getDoctorStatsTool } from "../tools/doctorBrain.tool.js";

// ─────────────────────────────────────────────────────────────
// DoctorAnalytics Sub-Agent
// Provides practice insights, trends, and performance metrics
// ─────────────────────────────────────────────────────────────
export const doctorAnalyticsAgent = new Agent({
  name: "Doctor Analytics Agent",
  tools: [getDoctorStatsTool],
  instructions: `
You are the Doctor Analytics Agent — a practice intelligence sub-agent that provides doctors with data-driven insights about their clinical performance and patient load.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- doctorId → The doctor's DoctorProfile ObjectId (REQUIRED)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOOL RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ALWAYS call \`get_doctor_stats\` with doctorId.
2. Interpret the numbers meaningfully:
   - Completion rate < 70%? → Flag it. Suggest verifying slot timings.
   - High no_show rate? → Recommend sending appointment reminders.
   - This month count vs all-time? → Calculate avg monthly load.
   - Unique patients → Reflects practice breadth.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return metrics + interpreted insights for DoctorBrain.
Include actionable suggestions when metrics indicate issues.
  `,
  outputType: z.object({
    analyticsReport: z
      .string()
      .describe("A written clinical analytics report interpreting all metrics with insights and suggestions."),
    metrics: z
      .object({
        totalAppointmentsAllTime: z.number().optional().nullable(),
        completedAllTime: z.number().optional().nullable(),
        cancelledAllTime: z.number().optional().nullable(),
        noShowAllTime: z.number().optional().nullable(),
        completionRatePercent: z.string().optional().nullable(),
        uniquePatients: z.number().optional().nullable(),
        thisMonthTotal: z.number().optional().nullable(),
        thisMonthCompleted: z.number().optional().nullable(),
        platformRating: z.number().optional().nullable(),
      })
      .describe("Raw statistics from the database."),
    insights: z
      .array(z.string())
      .describe("Actionable insights and suggestions based on the data."),
  }),
});

export const doctorAnalyticsTool = doctorAnalyticsAgent.asTool({
  toolName: "get_analytics",
  toolDescription: `
Get aggregated practice analytics for the doctor:
- Total, completed, cancelled, no-show appointments (all-time and this month)
- Completion rate percentage
- Unique patient count
- Platform rating
- Actionable insights based on metrics
Pass doctorId to get stats.
  `,
  parameters: z.object({
    doctorId: z.string().describe("The doctor's DoctorProfile ObjectId."),
  }),
  includeInputSchema: true,
  inputBuilder: (args: any) => JSON.stringify(args),
  customOutputExtractor: (result: any) => {
    try {
      if (result.finalOutput && typeof result.finalOutput === "object") {
        return JSON.stringify(result.finalOutput);
      }
      return String(result.finalOutput ?? "No analytics data available.");
    } catch {
      return "Failed to parse analytics output.";
    }
  },
});
