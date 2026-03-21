import { tool } from "@openai/agents";
import { z } from "zod";
import mongoose from "mongoose";
import { Report } from "../models/report.model.js";
import { ReportAnalysis } from "../models/overallreprot.model.js";
import { UserProfile } from "../models/userprofile.model.js";
import { Appointment } from "../models/Appointment.model.js";
import { run } from "@openai/agents";
import { reportSelectorAgent } from "../Agents/reportselector.agent.js";

// Max chars per report's extractedText to avoid LLM context overflow
const MAX_REPORT_TEXT_LENGTH = 3000;

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 1. getRelevantReportsTool — Fetch & Select Relevant Past Reports
//
// FIXES APPLIED:
//  - FIX 1: userQuery is now properly used (was undefined before)
//  - FIX 2: Added .lean() to ReportAnalysis.findOne()
//  - FIX 3: Guard empty finalAnalysis before returning
//  - FIX 4: Added .limit(20) on report fetch to prevent token overflow
//  - FIX 5 (CRITICAL): Convert selected_report_ids strings → ObjectIds before DB query
//  - FIX 6: Truncate extractedText to 3000 chars per report
// ─────────────────────────────────────────────────────────────────────────────
export const getRelevantReportsTool = tool({
  name: "get_relevant_reports",
  description:
    "Fetches and selects the most relevant past medical reports and recent AI analysis for a user based on their current symptoms/query. Always call this FIRST with the userId and userQuery to check for historical medical correlations.",
  parameters: z.object({
    userId: z.string().describe("The exact MongoDB ObjectId of the user. Required to fetch their reports."),
    userQuery: z
      .string()
      .describe("The user's symptoms or medical query. Used to select only relevant reports.")
  }),
  execute: async ({ userId, userQuery }) => {
    try {
      // FIX 4: Cap at 20 most recent reports to prevent token overflow
      const userReports = await Report.find({ patientId: userId })
        .select("reportName reportType uploadedAt _id")
        .sort({ uploadedAt: -1 })
        .limit(20);

      if (!userReports || userReports.length === 0) {
        return {
          hasReports: false,
          message: "No medical reports found for this user. Proceeding with symptom-only analysis."
        };
      }

      // FIX 2: Added .lean() — returns plain object, not full Mongoose document
      const recentSystemAnalysis = await ReportAnalysis.findOne({ patientId: userId })
        .sort({ createdAt: -1 })
        .lean();

      const reportsMetadata = userReports.map((r) => ({
        id: r._id.toString(),
        name: r.reportName,
        type: r.reportType,
        date: r.uploadedAt
      }));

      // FIX 1: userQuery is now properly included in the selector prompt
      const agentPrompt = `
        USER_QUERY: ${userQuery}
        AVAILABLE_REPORTS: ${JSON.stringify(reportsMetadata, null, 2)}
        RECENT_REPORTS_ANALYSIS_AVAILABLE: ${!!recentSystemAnalysis}
      `;

      // Run the Report Selector Agent
      const selection = await run(reportSelectorAgent, agentPrompt);
      if (!selection.finalOutput) {
        return {
          hasReports: true,
          selectedReports: [],
          recentAnalysis: null,
          message: "Report selector could not determine relevant reports. Proceeding with profile-only analysis."
        };
      }

      const { selected_report_ids, use_recent_analysis, reasoning } = selection.finalOutput as any;

      if (!selected_report_ids || selected_report_ids.length === 0) {
        return {
          hasReports: true,
          selectedReports: [],
          recentAnalysis: null,
          reasoning,
          message: "No reports were found relevant to this query. Analysis will be based on symptoms alone."
        };
      }

      // FIX 5 (CRITICAL): Convert string IDs → mongoose ObjectIds before DB query
      // Previous bug: raw strings never matched _id, returns were always empty
      const objectIds = selected_report_ids
        .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
        .map((id: string) => new mongoose.Types.ObjectId(id));

      const selectedReports = await Report.find({ _id: { $in: objectIds } })
        .select("reportName reportType uploadedAt analysis extractedText")
        .lean();

      // FIX 6: Truncate extractedText per report to avoid LLM context overflow
      const processedReports = selectedReports.map((r) => ({
        ...r,
        extractedText: r.extractedText
          ? r.extractedText.slice(0, MAX_REPORT_TEXT_LENGTH) +
            (r.extractedText.length > MAX_REPORT_TEXT_LENGTH ? "\n\n[... truncated for context window ...]" : "")
          : null
      }));

      // FIX 3: Only include recentAnalysis if it actually has meaningful content
      const hasRecentAnalysis =
        use_recent_analysis &&
        recentSystemAnalysis?.finalAnalysis &&
        Object.keys(recentSystemAnalysis.finalAnalysis).length > 0;

      return {
        hasReports: true,
        selectedReports: processedReports,
        totalReportsAvailable: userReports.length,
        totalReportsSelected: processedReports.length,
        recentAnalysis: hasRecentAnalysis ? recentSystemAnalysis!.finalAnalysis : null,
        reasoning
      };
    } catch (error: any) {
      console.error("getRelevantReportsTool error:", error);
      return {
        hasReports: false,
        selectedReports: [],
        recentAnalysis: null,
        message: "An error occurred while fetching reports. Proceeding based on symptoms only."
      };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 2. getUserHealthProfileTool — NEW
//
// Fetches the user's full health profile directly from DB.
// Previously, the agent depended on HealthBrain passing a stringified profile
// as a parameter — brittle and often incomplete. The agent can now fetch it itself.
// ─────────────────────────────────────────────────────────────────────────────
export const getUserHealthProfileTool = tool({
  name: "get_user_health_profile",
  description:
    "Fetch the complete health profile of the user from the database — including age, gender, chronic diseases, current medications, allergies, past surgeries, family history, lifestyle (smoking, exercise, diet), and body metrics. Use this to deeply personalize the symptom analysis.",
  parameters: z.object({
    userId: z.string().describe("The exact MongoDB ObjectId of the user.")
  }),
  execute: async ({ userId }) => {
    try {
      const profile = await UserProfile.findOne({ userId })
        .select(
          "age gender height weight bloodGroup allergies chronicDiseases currentMedications pastSurgeries familyHistory lifestyle"
        )
        .lean();

      if (!profile) {
        return {
          hasProfile: false,
          message: "No health profile found for this user. Analysis will rely solely on reported symptoms."
        };
      }

      // Build a clean BMI indicator if height+weight available
      let bmi: number | null = null;
      let bmiCategory: string | null = null;
      if (profile.height && profile.weight) {
        const heightM = profile.height / 100;
        bmi = parseFloat((profile.weight / (heightM * heightM)).toFixed(1));
        if (bmi < 18.5)       bmiCategory = "Underweight";
        else if (bmi < 25)    bmiCategory = "Normal";
        else if (bmi < 30)    bmiCategory = "Overweight";
        else                  bmiCategory = "Obese";
      }

      return {
        hasProfile: true,
        profile: {
          age: profile.age ?? null,
          gender: profile.gender ?? null,
          bloodGroup: profile.bloodGroup ?? null,
          height: profile.height ?? null,
          weight: profile.weight ?? null,
          bmi,
          bmiCategory,
          allergies: profile.allergies?.length ? profile.allergies : [],
          chronicDiseases: profile.chronicDiseases?.length ? profile.chronicDiseases : [],
          currentMedications: profile.currentMedications?.length ? profile.currentMedications : [],
          pastSurgeries: profile.pastSurgeries?.length ? profile.pastSurgeries : [],
          familyHistory: profile.familyHistory?.length ? profile.familyHistory : [],
          lifestyle: profile.lifestyle ?? null
        },
        clinicalHighlights: {
          hasDiabetes: profile.chronicDiseases?.some((d) => /diabet/i.test(d)) ?? false,
          hasHypertension: profile.chronicDiseases?.some((d) => /hypertension|blood pressure|bp/i.test(d)) ?? false,
          hasHeartDisease: profile.chronicDiseases?.some((d) => /cardiac|heart|coronary/i.test(d)) ?? false,
          isSmoker: profile.lifestyle?.smoking ?? false,
          drinksAlcohol: profile.lifestyle?.alcohol ?? false,
          bmi,
          bmiCategory
        }
      };
    } catch (error: any) {
      console.error("getUserHealthProfileTool error:", error);
      return {
        hasProfile: false,
        message: "Failed to fetch health profile. Proceeding with symptom-only analysis."
      };
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 3. getRecentAppointmentHistoryTool — NEW
//
// Fetches the user's recent completed appointments with doctor specialization
// and visit reason. Enables symptom agent to correlate: e.g., "User visited a
// Cardiologist 2 months ago — current chest symptoms may be a continuation."
// ─────────────────────────────────────────────────────────────────────────────
export const getRecentAppointmentHistoryTool = tool({
  name: "get_recent_appointment_history",
  description:
    "Fetch the user's recent completed medical appointments including the doctor's specialization and reason for each visit. Use this to identify recurring conditions, past diagnoses, or treatment patterns that correlate with current symptoms.",
  parameters: z.object({
    userId: z.string().describe("The exact MongoDB ObjectId of the user."),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe("Number of most recent appointments to fetch. Default is 5.")
  }),
  execute: async ({ userId, limit }) => {
    try {
      const appointments = await Appointment.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ["completed", "scheduled", "rescheduled"] }
      })
        .sort({ appointmentDate: -1 })
        .limit(limit ?? 5)
        .populate("doctorId", "specialization bio")
        .lean();

      if (!appointments || appointments.length === 0) {
        return {
          hasHistory: false,
          message: "No appointment history found for this user."
        };
      }

      const history = appointments.map((appt) => {
        const doctor = appt.doctorId as any;
        return {
          date: appt.appointmentDate,
          status: appt.status,
          consultationType: appt.consultationType,
          reason: appt.reason || "Not specified",
          specialization: doctor?.specialization || "Unknown",
          doctorBio: doctor?.bio || null
        };
      });

      const specializationsSeen = Array.from(new Set(history.map((h) => h.specialization)));
      const recurringReasons = history
        .map((h) => h.reason)
        .filter((r) => r !== "Not specified");

      return {
        hasHistory: true,
        appointments: history,
        totalFound: history.length,
        clinicalSummary: {
          specialistsSeen: specializationsSeen,
          recentReasons: recurringReasons,
          mostRecentVisit: history[0]?.date ?? null
        }
      };
    } catch (error: any) {
      console.error("getRecentAppointmentHistoryTool error:", error);
      return {
        hasHistory: false,
        message: "Failed to fetch appointment history."
      };
    }
  }
});
