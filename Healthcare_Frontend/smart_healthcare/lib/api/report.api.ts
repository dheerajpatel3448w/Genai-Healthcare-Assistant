/**
 * report.api.ts
 *
 * All API calls related to report upload, job polling, and AI analysis.
 * Both hooks (useMultiSectionUpload & useHistoricalAnalysis) import from here.
 */

import axios from "axios";
import type { IReport } from "@/types/patient.types";

const AI_API = process.env.NEXT_PUBLIC_API_AI || "http://localhost:8000";

// Shared axios instance — sends cookies (JWT) with every request
const api = axios.create({ withCredentials: true });

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /images/upload
 *
 * Upload 1-N images that together form ONE report section.
 * The worker OCRs them all, merges the text, saves one Report doc,
 * and emits `task:completed` via Socket.IO.
 *
 * @returns { jobId } — used to match the upcoming socket event
 */
async function uploadSection(files: File[]): Promise<{ jobId: string }> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  const res = await api.post(`${AI_API}/images/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!res.data?.jobId) {
    throw new Error("Upload succeeded but no jobId was returned.");
  }

  return { jobId: res.data.jobId };
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /images/job-status/:jobId
 *
 * Poll for a specific BullMQ job's state.
 * Prefer the Socket.IO `task:completed` event instead; use this as a fallback.
 */
async function getJobStatus(jobId: string) {
  const res = await api.get(`${AI_API}/images/job-status/${jobId}`);
  return res.data; // { jobId, state, progress, result, ... }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /images/reports
 *
 * Fetch all Report documents saved for the logged-in patient.
 * Used by the "Historical" flow where returning users pick from saved reports.
 */
async function getSavedReports(): Promise<IReport[]> {
  const res = await api.get(`${AI_API}/images/reports`);
  return (res.data?.reports as IReport[]) ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /analysis/reports
 *
 * Run the AI agent on a specific set of saved Report documents.
 * Works for BOTH the current-session flow (IDs from socket events)
 * and the historical flow (IDs from checkbox selection).
 *
 * @param reportIds - Array of MongoDB Report._id strings
 */
async function analyzeByIds(reportIds: string[]): Promise<any> {
  if (!reportIds || reportIds.length === 0) {
    throw new Error("reportIds must be a non-empty array.");
  }

  const res = await api.post(`${AI_API}/analysis/reports`, { reportIds });
  return res.data; // { success, reports, anaylisis }
}

// ─────────────────────────────────────────────────────────────────────────────

export const reportApi = {
  uploadSection,
  getJobStatus,
  getSavedReports,
  analyzeByIds,
};
