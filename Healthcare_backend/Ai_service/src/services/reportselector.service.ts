import { Report } from "../models/report.model.js";
import { ReportAnalysis } from "../models/overallreprot.model.js";
import { run } from "@openai/agents";
import { reportSelectorAgent } from "../Agents/reportselector.agent.js";

export const getRelevantReportsForQuery = async (queryDetails: any, userId: string) => {
  try {
    // 1. Fetch available reports for the user (only metadata to save context window)
    const userReports = await Report.find({ patientId: userId }).select("reportName reportType uploadedAt _id").sort({ uploadedAt: -1 });

    if (!userReports || userReports.length === 0) {
      return {
        selectedReports: [],
        recentAnalysis: null,
        message: "No reports available for this user."
      };
    }

    // 2. Fetch the most recent overall system analysis for the user
    const recentSystemAnalysis = await ReportAnalysis.findOne({ patientId: userId }).sort({ createdAt: -1 });

    // 3. Format the data to pass to the agent
    const reportsMetadata = userReports.map(r => ({
      id: r._id,
      name: r.reportName,
      type: r.reportType,
      date: r.uploadedAt
    }));

    const agentPrompt = `
      USER_QUERY:
      ${JSON.stringify(queryDetails, null, 2)}

      AVAILABLE_REPORTS:
      ${JSON.stringify(reportsMetadata, null, 2)}

      RECENT_REPORTS_ANALYSIS_AVAILABLE: ${!!recentSystemAnalysis}
    `;

    // 4. Run the Agent
    const selection= await run(reportSelectorAgent, agentPrompt)
    if(!selection.finalOutput){
      throw new Error("Failed to select relevant reports");
    }
    const { selected_report_ids, use_recent_analysis } = selection.finalOutput as { selected_report_ids: string[]; use_recent_analysis: boolean; reasoning: string };

    // 5. Fetch the full content of the selected reports
    const selectedReports = await Report.find({
      _id: { $in: selected_report_ids }
    }).select("reportName reportType uploadedAt analysis extractedText");

    return {
      selectedReports,
      recentAnalysis: (use_recent_analysis && recentSystemAnalysis) ? recentSystemAnalysis.finalAnalysis : null,
      reasoning: selection.finalOutput.reasoning
    };

  } catch (error) {
    console.error("Error in Report Selector Service:", error);
    throw new Error("Failed to select relevant reports");
  }
};
