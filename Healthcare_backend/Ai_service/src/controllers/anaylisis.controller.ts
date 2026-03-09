import type { RequestHandler ,Request,Response} from "express";
import { TryCatch } from "../utils/TryCatch.js";
import { Report } from "../models/report.model.js";
import { Agentservice } from "../services/Agent.service.js";
import { ReportAnalysis } from "../models/overallreprot.model.js";
export const Aianaylisis:RequestHandler = TryCatch(async(req:Request,res:Response)=>{
    const userId=req.user?.id;
    if(!userId){
        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        })
    }

    // Get query parameters
    const {limit } = req.query;

    let filter: any = { patientId: userId };
    let limitCount = limit ? parseInt(limit as string) : null;

    
 
        const latestReport = await Report.find(filter).sort({uploadedAt:-1}).limit(limitCount || 1);
       

        const anaylisis = await Agentservice(latestReport);
        const allReportAnalyses = [
  ...anaylisis.combinedResults.lab_reports,
  ...anaylisis.combinedResults.imaging_reports,
  ...anaylisis.combinedResults.clinical_reports
];
             
const savedAnalysis = await ReportAnalysis.create({
  patientId:userId,

  reports: allReportAnalyses.map((r) => ({
    reportId: r.id,
    reportName: r.reportName,
    reportType: r.reportType,
    analysis: r.analysis
  })),

  finalAnalysis:anaylisis.finalAnalysis
});


        return res.status(200).json({
            success:true,
            reports: latestReport ? [latestReport] : [],
            anaylisis   
        })

})

export const AIanaylisisgetReportsByIds: RequestHandler = TryCatch(async(req:Request,res:Response)=>{
    const userId = req.user?.id;
    if(!userId){
        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        })
    }

    // Get reportIds from request body
    const { reportIds } = req.body;

    // Validate reportIds
    if(!reportIds || !Array.isArray(reportIds) || reportIds.length === 0){
        return res.status(400).json({
            success:false,
            message:"reportIds array is required and must not be empty"
        })
    }

    try {
        // Fetch reports by IDs and verify they belong to the logged-in user
        const reports = await Report.find({
            _id: { $in: reportIds },
            patientId: userId
        }).sort({uploadedAt:-1});

        const anaylisis = await Agentservice(reports);

        return res.status(200).json({
            success:true,
            reports: reports,   
            anaylisis   
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Invalid report IDs format"
        })
    }
})
