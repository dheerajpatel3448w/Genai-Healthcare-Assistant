import { run } from "@openai/agents";
import { healthBrainAgent } from "../Agents/Healthbrain.agent.js";

export const HealthBrainService = async (improvedQueryWithProfile: any, userId: string) => {
    try {
        const result = await run(healthBrainAgent, `
            CONTEXT / IMPROVED QUERY / USER PROFILE:
            ${JSON.stringify(improvedQueryWithProfile, null, 2)}
            
            USER ID STRING:
            "${userId}"
            (Provide this ID precisely when calling your sub-tools)
        `);

        return result.finalOutput;
    } catch (error) {
        console.log("Error running HealthBrain Agent:", error);
        throw new Error("Failed to process main AI logic");
    }
}