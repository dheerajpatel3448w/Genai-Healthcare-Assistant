import type { RequestHandler,Request,Response } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { queryImproviserService } from "../services/queryimprowiser.service.js";

export const mainAiController:RequestHandler = TryCatch(async(req:Request,res:Response)=>{
    const {query} = req.body
    const userId=req.user.userId
    const result = await queryImproviserService(query,userId) 
})