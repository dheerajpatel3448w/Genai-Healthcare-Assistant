import type { RequestHandler,Request,Response } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { queryImproviserService } from "../services/queryimprowiser.service.js";
import { UserProfile } from "../models/userprofile.model.js";
 const { HealthBrainService } = await import("../services/HealthBrain.service.js");
export const mainAiController:RequestHandler = TryCatch(async(req:Request,res:Response)=>{
    const {query} = req.body;
    const userId = req.user?.id || req.user?.userId;
    const improvedQuery = await queryImproviserService(query, userId);
    
    if (!improvedQuery) {
        return res.status(500).json({ success: false, message: "Could not analyze the given query." });
    }

    const userprofile = await UserProfile.findOne({userId:userId});
    const improvedQueryWithProfile = {...improvedQuery, userprofile};   

    try {
        // Hand over full control to HealthBrain
       
        const healthBrainOutput = await HealthBrainService(improvedQueryWithProfile, userId);

        if (!healthBrainOutput) {
             return res.status(500).json({ success: false, message: "HealthBrain returned no output." });
        }

        return res.status(200).json({
            success: true,
            intent: improvedQuery.intent,
            finalResponse: healthBrainOutput.final_response,
            action_taken: healthBrainOutput.action_taken
        });
    } catch (error) {
        console.error("HealthBrain Orchestrator failed:", error);
        return res.status(500).json({ success: false, message: "AI processing failed at HealthBrain level." });
    }
});