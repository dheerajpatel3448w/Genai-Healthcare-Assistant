import { run } from "@openai/agents";
import { healthBrainAgent } from "../Agents/Healthbrain.agent.js";
import { memory } from "./mem0.service.js";
import { redisMemoryService } from "./redisMemory.service.js";
import { ChatHistory } from "../models/chathistory.model.js";
export const HealthBrainService = async (improvedQueryWithProfile: any, userId: string,improvedQuery:any) => {
    try {
        const result = await run(healthBrainAgent, `
            CONTEXT / IMPROVED QUERY / USER PROFILE:
            ${JSON.stringify(improvedQueryWithProfile, null, 2)}
            
            PAST MEMORIES (Mem0):
            ${improvedQueryWithProfile.pastMemories ? improvedQueryWithProfile.pastMemories : "No relevant past memories found."}
            Use these past memories to maintain conversational continuity, remember user preferences, and provide personalized context to your answers or sub-tools.

            RECENT CONVERSATION HISTORY (Last 5 interactions):
            ${improvedQueryWithProfile.recentHistory}
            Use this immediate context for pronouns (it, this, them) or conversational follow-ups.

            USER ID STRING:
            "${userId}"
            (Provide this ID precisely when calling your sub-tools)
        `);
         // 🧠 Learn from the Interaction (Background Save for both Mem0 and Redis)
        Promise.resolve().then(async () => {
            try {
                // Redis Fast Short-Term Context
                await redisMemoryService.saveInteraction(userId as string,improvedQuery.clean_query, JSON.stringify(result.finalOutput));
                
                // Mem0 Semantic Extractor
                await memory.add([
                    { role: "user", content: improvedQuery.clean_query },
                    { role: "assistant", content: JSON.stringify(result.finalOutput) }
                ], { userId: userId as string });

                // 🌱 MongoDB Permanent Chat History
                await ChatHistory.create({
                    userId,
                    userQuery: improvedQuery.clean_query,
                    aiResponse: JSON.stringify(result.finalOutput)
                });
            } catch (err) {
                console.error("Memory saving background job failed:", err);
            }
        });
           
        return result.finalOutput;
    } catch (error) {
        console.log("Error running HealthBrain Agent:", error);
        throw new Error("Failed to process main AI logic");
    }
}