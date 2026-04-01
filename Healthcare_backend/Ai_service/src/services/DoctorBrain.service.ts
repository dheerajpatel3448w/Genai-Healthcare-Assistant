import { run } from "@openai/agents";
import { doctorBrainAgent } from "../Agents/DoctorBrain.agent.js";
import { ChatHistory } from "../models/chathistory.model.js";
import { redisMemoryService } from "./redisMemory.service.js";
import { memory } from "./mem0.service.js";

// ─────────────────────────────────────────────────────────────
// Build prompt — includes Redis short-term + Mem0 long-term context
// ─────────────────────────────────────────────────────────────
const buildDoctorPrompt = (
  doctorId: string,
  query: string,
  doctorProfile: any,
  recentHistory: string,
  pastMemories: string | null
) => `
  DOCTOR CONTEXT:
  - DoctorProfile ID: "${doctorId}"
  - Specialization: ${doctorProfile?.specialization ?? "Unknown"}
  - Experience: ${doctorProfile?.experience ?? "Unknown"} years
  - Hospital: ${doctorProfile?.hospitalName ?? "Not set"}
  - Availability: ${JSON.stringify(doctorProfile?.availability ?? {})}

  PAST MEMORIES (Mem0 — Long-Term):
  ${pastMemories ?? "No past memories found."}
  Use these to remember doctor preferences, past queries, and personalize responses.

  RECENT CONVERSATION HISTORY (Redis — Last 5 interactions):
  ${recentHistory}
  Use this for pronoun resolution and conversational follow-ups (e.g., "that patient", "the same date").

  DOCTOR QUERY:
  "${query}"

  IMPORTANT: Always use the DoctorProfile ID "${doctorId}" when calling sub-tools.
`;

// ─────────────────────────────────────────────────────────────
// Fetch memory context before running the agent
// ─────────────────────────────────────────────────────────────
const fetchDoctorMemory = async (doctorUserId: string, query: string) => {
  // Redis — short-term recent context (last 5 interactions)
  let recentHistory = "";
  try {
    recentHistory = await redisMemoryService.getRecentContext(doctorUserId);
  } catch (e) {
    console.error("Doctor Redis fetch failed:", e);
  }

  // Mem0 — long-term semantic memories
  let pastMemories: string | null = null;
  try {
    const memResults = await memory.search(query, { userId: doctorUserId });
    if (memResults?.results?.length > 0) {
      pastMemories = memResults.results.map((m: any) => m.memory).join(" | ");
    }
  } catch (e) {
    console.error("Doctor Mem0 search failed:", e);
  }

  return { recentHistory, pastMemories };
};

// ─────────────────────────────────────────────────────────────
// Safely convert stream.output (array | string | any) to a plain string
// @openai/agents streaming returns output as an array of RunItem objects
// ─────────────────────────────────────────────────────────────
const extractTextOutput = (output: any): string => {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) {
    return output
      .map((msg: any) => {
        if (typeof msg === "string") return msg;
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

const saveDoctorMemoryBackground = (
  doctorUserId: string,
  query: string,
  rawOutput: any
) => {
  Promise.resolve().then(async () => {
    try {
      const response = extractTextOutput(rawOutput);

      // 1️⃣ Redis — fast short-term context (same key as doctorUserId)
      await redisMemoryService.saveInteraction(doctorUserId, query, response);

      // 2️⃣ Mem0 — semantic long-term memory
      await memory.add(
        [
          { role: "user", content: query },
          { role: "assistant", content: response },
        ],
        { userId: doctorUserId }
      );

      // 3️⃣ MongoDB — permanent chat history
      await ChatHistory.create({
        userId: doctorUserId,
        userQuery: query,
        aiResponse: response,
      });
    } catch (err) {
      console.error("Doctor memory save background job failed:", err);
    }
  });
};

// ─────────────────────────────────────────────────────────────
// ✅ DoctorBrain Streaming Service (Socket.IO)
// ─────────────────────────────────────────────────────────────
export const DoctorBrainStreamingService = async (
  doctorId: string,
  doctorUserId: string,
  query: string,
  doctorProfile: any,
  emitFn: (event: string, data: any) => void
): Promise<string> => {
  try {
    // 🧠 Fetch memory context BEFORE running the agent
    const { recentHistory, pastMemories } = await fetchDoctorMemory(doctorUserId, query);

    const stream = await run(
      doctorBrainAgent,
      buildDoctorPrompt(doctorId, query, doctorProfile, recentHistory, pastMemories),
      { stream: true }
    );

    for await (const event of stream) {
      if (event.type === "raw_model_stream_event") {
        const data = (event as any).data;
        if (data?.type === "output_text_delta" && data.delta) {
          emitFn("doctor:token", { delta: data.delta });
        }
      }
      if (event.type === "agent_updated_stream_event") {
        emitFn("doctor:agent_update", { agentName: (event as any).agent?.name });
      }
      if (event.type === "run_item_stream_event") {
        const name = (event as any).name;
        if (["tool_called", "tool_output", "handoff_requested", "handoff_occurred"].includes(name)) {
          emitFn("doctor:status", { step: name });
        }
      }
    }

    await stream.completed;
    // stream.output is a RunItem array — extract text content
    const rawOutput = (stream as any).output ?? "";
    const finalOutput: string = extractTextOutput(rawOutput);

    // 🧠 Save to Redis + Mem0 + MongoDB in background
    saveDoctorMemoryBackground(doctorUserId, query, rawOutput);

    return finalOutput;
  } catch (error) {
    console.error("DoctorBrainStreamingService error:", error);
    throw new Error("Failed to process doctor AI query.");
  }
};

// ─────────────────────────────────────────────────────────────
// 🔒 DoctorBrain Non-Streaming Service (REST controller)
// ─────────────────────────────────────────────────────────────
export const DoctorBrainService = async (
  doctorId: string,
  doctorUserId: string,
  query: string,
  doctorProfile: any
): Promise<string> => {
  try {
    // 🧠 Fetch memory context BEFORE running the agent
    const { recentHistory, pastMemories } = await fetchDoctorMemory(doctorUserId, query);

    const result = await run(
      doctorBrainAgent,
      buildDoctorPrompt(doctorId, query, doctorProfile, recentHistory, pastMemories)
    );

    const finalOutput = String(result.finalOutput ?? "");

    // 🧠 Save to Redis + Mem0 + MongoDB in background
    saveDoctorMemoryBackground(doctorUserId, query, finalOutput);

    return finalOutput;
  } catch (error) {
    console.error("DoctorBrainService error:", error);
    throw new Error("Failed to process doctor AI query.");
  }
};
