import { useState, useEffect, useCallback } from "react";
import { reportApi } from "@/lib/api/report.api";
import type { IReport } from "@/types/patient.types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UseHistoricalAnalysisReturn {
  /** All saved reports fetched from GET /images/reports */
  savedReports: IReport[];
  /** IDs the user has toggled on */
  selectedIds: string[];
  /** Toggle a report in/out of the selection */
  toggleSelect: (id: string) => void;
  /** Select all at once */
  selectAll: () => void;
  /** Deselect all */
  clearSelection: () => void;
  /** True if fetching the saved-reports list */
  isFetching: boolean;
  fetchError: string | null;
  /** True while POST /analysis/reports is in flight */
  isAnalyzing: boolean;
  /** Trigger analysis for currently selected report IDs */
  analyzeSelected: () => Promise<any>;
  /** The final analysis result returned from the backend */
  analysisResult: any | null;
  analysisError: string | null;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useHistoricalAnalysis
 *
 * For returning users who want to pick from their previously-saved reports
 * and run a new AI analysis session on them.
 *
 * Flow:
 *   1. On mount  → GET /images/reports  (list of all saved Report docs)
 *   2. User ticks checkboxes          → selectedIds grows/shrinks
 *   3. User hits "Analyze Selected"   → POST /analysis/reports { reportIds }
 *   4. analysisResult is populated    → parent renders the result
 */
export function useHistoricalAnalysis(): UseHistoricalAnalysisReturn {
  const [savedReports, setSavedReports] = useState<IReport[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // ── Fetch saved reports on mount ──────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsFetching(true);
      setFetchError(null);
      try {
        const reports = await reportApi.getSavedReports();
        if (!cancelled) setSavedReports(reports);
      } catch (err: any) {
        if (!cancelled) setFetchError(err?.message || "Failed to load reports.");
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Selection helpers ─────────────────────────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(savedReports.map((r) => r._id));
  }, [savedReports]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // ── Analyze ──────────────────────────────────────────────────────────────

  const analyzeSelected = useCallback(async () => {
    if (selectedIds.length === 0) {
      setAnalysisError("Please select at least one report to analyze.");
      return null;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await reportApi.analyzeByIds(selectedIds);
      setAnalysisResult(result);
      return result;
    } catch (err: any) {
      setAnalysisError(err?.message || "Analysis failed.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedIds]);

  return {
    savedReports,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isFetching,
    fetchError,
    isAnalyzing,
    analyzeSelected,
    analysisResult,
    analysisError,
  };
}
