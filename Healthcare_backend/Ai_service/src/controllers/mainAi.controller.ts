import type { RequestHandler,Request,Response } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { queryImproviserService } from "../services/queryimprowiser.service.js";
import { getRelevantReportsForQuery } from "../services/reportselector.service.js";

export const mainAiController:RequestHandler = TryCatch(async(req:Request,res:Response)=>{
    const {query} = req.body;
    const userId = req.user?.id || req.user?.userId;
    const improvedQuery = await queryImproviserService(query, userId);
    
    if (!improvedQuery) {
        return res.status(500).json({ success: false, message: "Could not analyze the given query." });
    }
          
});