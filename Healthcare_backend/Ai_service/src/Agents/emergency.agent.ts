import { Agent } from "@openai/agents";
import { z } from "zod";
import { triggerEmergencyAlertsTool } from "../tools/emergency.tool.js";

export const emergencyAgent = new Agent({
  name: "Emergency Protocol Agent",

  tools: [
    triggerEmergencyAlertsTool
  ],

  instructions: `
You are the Emergency Protocol Agent — a critical system component designed to handle life-threatening or severe situations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS YOU RECEIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A JSON payload containing:
- userId      → The patient's MongoDB ObjectId
- emergencyContext → A brief description of why the emergency was triggered

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. IMMEDIATELY call the \`trigger_emergency_alerts\` tool using the provided \`userId\`.
2. Do not wait for any additional information before calling the tool.
3. Once the tool returns its summary, construct a concise, calm, and reassuring response for the user confirming that their emergency contacts have been notified.
4. Always advise the patient to call local emergency services (e.g., 911 or 112) immediately and explicitly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Return a Markdown response detailing the actions taken and re-emphasizing the need to seek physical emergency help.
  `,

  outputType: z.object({
    emergency_response: z
      .string()
      .describe(
        "A calm, reassuring string in Markdown explicitly stating that emergency contacts have been notified and urging the user to call local emergency numbers immediately."
      ),
    actions_taken: z
      .string()
      .describe("Summary of actions returned by the emergency tool."),
    alert_successful: z
      .boolean()
      .describe("True if the tools successfully dispatched at least one alert.")
  })
});

// ─────────────────────────────────────────────
// Export as Tool for HealthBrain Orchestrator
// ─────────────────────────────────────────────
export const emergencyProtocolTool = emergencyAgent.asTool({
  toolName: "initiate_emergency_protocol",

  toolDescription: `
Trigger this tool IMMEDIATELY when the user is experiencing a life-threatening emergency, severe trauma, critical symptoms (like severe chest pain), or explicitly requests emergency help.
This tool will take over and execute the emergency alert protocol to contact their emergency contacts.
  `,

  parameters: z.object({
    userId: z.string().describe("The user's MongoDB ObjectId."),
    emergencyContext: z.string().describe("Brief description of the emergency or the user's critical symptoms.")
  }),

  includeInputSchema: true,

  inputBuilder: (args: any) =>
    JSON.stringify({
      userId: args.userId,
      emergencyContext: args.emergencyContext
    }),

  customOutputExtractor: (result: any) => {
    try {
      if (typeof result.finalOutput === "object" && result.finalOutput !== null) {
        return JSON.stringify(result.finalOutput);
      }
      if (typeof result.finalOutput === "string") {
        return result.finalOutput;
      }
      return JSON.stringify({ error: "Invalid output format from emergency agent format" });
    } catch {
      return JSON.stringify({ error: "Failed to parse emergency agent output" });
    }
  }
});
