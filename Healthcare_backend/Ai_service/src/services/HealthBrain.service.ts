import { run } from "@openai/agents";
import { healthBrainAgent } from "../Agents/Healthbrain.agent.js";
import { memory } from "./mem0.service.js";
import { redisMemoryService } from "./redisMemory.service.js";
import { ChatHistory } from "../models/chathistory.model.js";

// ─────────────────────────────────────────────────────────────────
// Helper: builds the full prompt string (shared by both services)
// ─────────────────────────────────────────────────────────────────
const buildPrompt = (improvedQueryWithProfile: any, userId: string) => {
    // Safely extract fields from the structured query object
    const iq = improvedQueryWithProfile.improvedQuery ?? {};
    const intent = iq.intent ?? "general_query";
    const cleanQuery = iq.clean_query ?? "";
    const entities = iq.entities ?? {};
    const userprofile = improvedQueryWithProfile.userprofile
        ? JSON.stringify(improvedQueryWithProfile.userprofile, null, 2)
        : "No profile available.";

    return `
INTENT: ${intent}
CLEAN QUERY: ${cleanQuery}
ENTITIES: ${JSON.stringify(entities)}

USER PROFILE:
${userprofile}

PAST MEMORIES (Mem0):
${improvedQueryWithProfile.pastMemories ?? "No relevant past memories found."}
Use these past memories to maintain conversational continuity, remember user preferences, and provide personalized context.

RECENT CONVERSATION HISTORY (Last 5 interactions):
${improvedQueryWithProfile.recentHistory ?? "No relevant recent conversation history found."}
Use this immediate context for pronouns (it, this, them) or conversational follow-ups.

USER ID STRING:
"${userId}"
(Provide this ID precisely when calling your sub-tools)
`;
};

// ─────────────────────────────────────────────────────────────────
// Background memory saver (shared logic)
// ─────────────────────────────────────────────────────────────────
// Safely convert any finalOutput value (string | array | object) to a plain string
const extractTextOutput = (output: any): string => {
    if (typeof output === "string") return output;
    // @openai/agents streaming: output is an array of message objects
    if (Array.isArray(output)) {
        return output
            .map((msg: any) => {
                if (typeof msg === "string") return msg;
                // Each message has a content array with text blocks
                if (Array.isArray(msg?.content)) {
                    return msg.content
                        .filter((c: any) => c?.type === "output_text" || c?.type === "text")
                        .map((c: any) => c?.text ?? "")
                        .join("");
                }
                return "";
            })
            .filter(Boolean)
            .join("\n");
    }
    return JSON.stringify(output);
};

const saveMemoryBackground = (userId: string, cleanQuery: string, rawOutput: any) => {
    Promise.resolve().then(async () => {
        try {
            const finalOutput = extractTextOutput(rawOutput);
            await redisMemoryService.saveInteraction(userId, cleanQuery, finalOutput);
            await memory.add([
                { role: "user", content: cleanQuery },
                { role: "assistant", content: finalOutput }
            ], { userId });
            await ChatHistory.create({
                userId,
                userQuery: cleanQuery,
                aiResponse: finalOutput
            });
        } catch (err) {
            console.error("Memory saving background job failed:", err);
        }
    });
};

// ─────────────────────────────────────────────────────────────────
// ✅ STREAMING SERVICE — used by Socket.IO (stream: true)
// emitFn is injected from the socket so each connection gets its own emit
// ─────────────────────────────────────────────────────────────────
export const HealthBrainStreamingService = async (
    improvedQueryWithProfile: any,
    userId: string,
    improvedQuery: any,
    emitFn: (event: string, data: any) => void
): Promise<string> => {
    try {
        const stream = await run(healthBrainAgent, buildPrompt(improvedQueryWithProfile, userId), {
            stream: true,
        });

        for await (const event of stream) {
            // 1️⃣ Stream text tokens to frontend — the main typing effect
            if (event.type === "raw_model_stream_event") {
                const data = (event as any).data;
                if (data?.type === "output_text_delta" && data.delta) {
                    emitFn("ai:token", { delta: data.delta });
                }
            }

            // 2️⃣ Which agent is currently active (HealthBrain or a sub-agent)
            if (event.type === "agent_updated_stream_event") {
                emitFn("ai:agent_update", { agentName: (event as any).agent?.name });
            }

            // 3️⃣ Tool/handoff lifecycle — lets frontend show loading indicators
            if (event.type === "run_item_stream_event") {
                const name = (event as any).name;
                if (["tool_called", "tool_output", "handoff_requested", "handoff_occurred"].includes(name)) {
                    emitFn("ai:status", { step: name });
                }
            }
        }

        // ⚠️ ALWAYS await completed before treating the run as settled
        await stream.completed;

        // stream.output is an array of RunItem objects from @openai/agents
        // Extract the plain text from the final text output block
        const rawOutput = (stream as any).output ?? "";
        const finalOutput: string = extractTextOutput(rawOutput);

        // 🧠 Background saves (identical to non-streaming path)
        saveMemoryBackground(userId, improvedQuery.clean_query, rawOutput);

        return finalOutput;
    } catch (error) {
        console.error("Error in HealthBrainStreamingService:", error);
        throw new Error("Failed to process streaming AI logic");
    }
};

// ─────────────────────────────────────────────────────────────────
// 🔒 NON-STREAMING SERVICE — kept for REST endpoint (backwards compat)
// ─────────────────────────────────────────────────────────────────
export const HealthBrainService = async (improvedQueryWithProfile: any, userId: string, improvedQuery: any) => {
    try {
        const result = await run(healthBrainAgent, buildPrompt(improvedQueryWithProfile, userId));

        saveMemoryBackground(userId, improvedQuery.clean_query, String(result.finalOutput));

        return result.finalOutput;
    } catch (error) {
        console.log("Error running HealthBrain Agent:", error);
        throw new Error("Failed to process main AI logic");
    }
};
