import { ReportAnalysis } from "../models/overallreprot.model.js"
import { UserProfile } from "../models/userprofile.model.js"
import {run } from '@openai/agents';
import { queryImproviser } from "../Agents/queryimprowizer.agent.js";
 const Buildcontext = async(query:string,userId:string)=>{
    try {
        const userProfile = await UserProfile.findOne({userId:userId})
          const reportAnalysis = await ReportAnalysis.findOne({
        userId,
       createdAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }).sort({ createdAt: -1 });
        if(!userProfile){
            throw new Error("User profile not found")
        }
        if(!reportAnalysis){
            return {
                userProfile,
                reportAnalysis:"not available"
            }
        }
        const combinedData = {
            userProfile,
            reportAnalysis:reportAnalysis.finalAnalysis
        }
        return combinedData
    } catch (error) {
        console.log(error)
        throw new Error("Failed to improvise query")
    }
}

export const queryImproviserService = async (query:string,userId:string)=>{
    try {
        const context = await Buildcontext(query,userId)
        const result = await run(queryImproviser,`
            Context:${context}
            User Query:"${query}"
            `)
       console.log(result.finalOutput,"result")
        return result.finalOutput
    } catch (error) {
        console.log(error)
        throw new Error("Failed to improvise query")
    }
}