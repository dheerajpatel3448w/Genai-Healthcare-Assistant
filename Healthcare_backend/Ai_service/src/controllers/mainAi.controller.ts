import type { RequestHandler,Request,Response } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { queryImproviserService } from "../services/queryimprowiser.service.js";
import { UserProfile } from "../models/userprofile.model.js";
import { memory } from "../services/mem0.service.js";
import { redisMemoryService } from "../services/redisMemory.service.js";
const { HealthBrainService } = await import("../services/HealthBrain.service.js");

export const mainAiController:RequestHandler = TryCatch(async(req:Request,res:Response)=>{
    const {query} = req.body;
    const userId = req.user?.id || req.user?.userId;
    const improvedQuery = await queryImproviserService(query, userId);
    
    if (!improvedQuery) {
        return res.status(500).json({ success: false, message: "Could not analyze the given query." });
    }

    const userprofile = await UserProfile.findOne({userId:userId});
    
    // 🧠 1. Fetch Past Memories for Context
    let pastMemories = null;
    try {
        const memResults = await memory.search(improvedQuery.clean_query, { userId: userId });
        if (memResults && memResults.results.length > 0) {
            pastMemories = memResults.results.map((m: any) => m.memory).join(" | ");
        }
    } catch (e) {
        console.error("Mem0 search failed:", e);
    }

    // 🕒 Fetch Recent Conversation History (Short-Term Memory)
    const recentHistory = await redisMemoryService.getRecentContext(userId as string);

    const improvedQueryWithProfile = { ...improvedQuery, userprofile, pastMemories, recentHistory };   

    try {
        // Hand over full control to HealthBrain
       
        const healthBrainOutput = await HealthBrainService(improvedQueryWithProfile, userId, improvedQuery);

        if (!healthBrainOutput) {
             return res.status(500).json({ success: false, message: "HealthBrain returned no output." });
        }

       

        return res.status(200).json({
            success: true,
            intent: improvedQuery.intent,
            finalResponse: healthBrainOutput,  // plain Markdown string (outputType removed)
        });
    } catch (error) {
        console.error("HealthBrain Orchestrator failed:", error);
        return res.status(500).json({ success: false, message: "AI processing failed at HealthBrain level." });
    }
});