"use client";

import React from "react";
import { useHistoricalAnalysis } from "@/hooks/useHistoricalAnalysis";
import type { IReport } from "@/types/patient.types";
import { StructuredAnalysisDisplay } from "./StructuredAnalysisDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { TestTubes, FileDigit, Stethoscope, Search, FolderSearch, AlertTriangle, Loader2, BrainCircuit, CheckCircle2 } from "lucide-react";

// ─── Report Type Config ───────────────────────────────────────────────────────
const reportTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  lab:      { icon: <TestTubes className="w-4 h-4" />, color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  imaging:  { icon: <FileDigit className="w-4 h-4" />, color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20" },
  clinical: { icon: <Stethoscope className="w-4 h-4" />, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
};

// ─── Analysis Result Panel ─────────────────────────────────────────────────────
function AnalysisResultPanel({ result }: { result: any }) {
  if (!result) return null;

  const analysis   = result?.anaylisis ?? result?.analysis ?? result;
  const finalAnalysis = analysis?.finalAnalysis;

  if (!finalAnalysis) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-4 border-t border-zinc-800/60">
      <StructuredAnalysisDisplay analysisData={finalAnalysis} />
    </motion.div>
  );
}

// ─── Report Row ───────────────────────────────────────────────────────────────
function ReportRow({
  report,
  isSelected,
  onToggle,
  index,
}: {
  report: IReport;
  isSelected: boolean;
  onToggle: (id: string) => void;
  index: number;
}) {
  const cfg = reportTypeConfig[report.reportType] ?? reportTypeConfig.clinical;
  const date = new Date(report.uploadedAt).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <motion.label
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: index * 0.05 }}
      htmlFor={`report-${report._id}`}
      className={`relative flex items-center gap-4 p-4 lg:p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden
        ${isSelected
          ? "border-purple-500/50 bg-purple-500/10 shadow-[0_4px_20px_-10px_rgba(168,85,247,0.4)]"
          : "border-white/5 bg-zinc-900/40 hover:border-cyan-500/30 hover:bg-zinc-800/50 hover:shadow-lg"
        }`}
    >
      {/* Subtle Glow on Select */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
      )}

      {/* Custom Checkbox */}
      <div className={`relative w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 z-10
        ${isSelected ? "border-purple-500 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110" : "border-zinc-600 group-hover:border-cyan-500/50 bg-zinc-900"}`}
      >
        <AnimatePresence>
          {isSelected && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="w-4 h-4 text-white drop-shadow-md" viewBox="0 0 12 12" fill="none"
            >
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      <input id={`report-${report._id}`} type="checkbox" className="sr-only" checked={isSelected} onChange={() => onToggle(report._id)} />

      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base flex-shrink-0 z-10 transition-colors duration-300
        ${isSelected ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : cfg.bg + " " + cfg.color}
      `}>
        {cfg.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 z-10">
        <p className={`text-sm md:text-base font-semibold truncate transition-colors duration-300
          ${isSelected ? "text-purple-100" : "text-zinc-200 group-hover:text-white"}
        `}>
          {report.reportName || `${report.reportType} Report`}
        </p>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
          <p className={`text-xs font-medium tracking-wide ${isSelected ? "text-purple-300/70" : "text-zinc-500 group-hover:text-zinc-400"}`}>
            {date}
          </p>
          <span className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block" />
          <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase truncate hidden sm:block">
            REF: {report._id.slice(-8)}
          </p>
        </div>
      </div>

      {/* Type Badge */}
      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border transition-colors duration-300 z-10 hidden sm:block
        ${isSelected ? "text-purple-300 bg-purple-500/20 border-purple-500/30" : cfg.color + " " + cfg.bg}
      `}>
        {report.reportType}
      </span>
    </motion.label>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function HistoricalAnalysis() {
  const {
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
  } = useHistoricalAnalysis();

  if (isFetching) {
    return (
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative h-20 rounded-2xl bg-zinc-900/40 border border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" style={{ backgroundSize: "200% 100%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-red-500/5 border border-red-500/20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-xl font-semibold text-white tracking-tight mb-2">Connection Interrupted</p>
        <p className="text-sm text-red-200/70 max-w-sm">{fetchError}</p>
      </div>
    );
  }

  if (savedReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 md:p-20 text-center relative group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-700" />
        <motion.div 
          initial={{ y: 0 }} 
          animate={{ y: [-10, 10, -10] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.1)] flex items-center justify-center mb-6 z-10"
        >
          <FolderSearch className="w-10 h-10 text-cyan-400/80 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
        </motion.div>
        <div className="relative z-10 space-y-2 max-w-sm">
          <p className="text-2xl font-semibold text-white tracking-tight">Archive Empty</p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            You haven't processed any reports yet. Switch to the <span className="text-cyan-400 font-medium">Upload</span> tab to analyze new medical documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Records Database</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Select one or multiple past reports to run a comparative AI analysis.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto bg-zinc-900/60 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {selectedIds.length} Selected
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={selectAll}
              className="text-xs font-semibold text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors px-3 py-1.5 rounded-lg"
            >
              All
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors px-3 py-1.5 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report List */}
      <div className="space-y-3">
        {savedReports.map((report, i) => (
          <ReportRow
            key={report._id}
            report={report}
            index={i}
            isSelected={selectedIds.includes(report._id)}
            onToggle={toggleSelect}
          />
        ))}
      </div>

      {/* Analyze Button */}
      <AnimatePresence>
        {selectedIds.length > 0 && !analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group mt-6"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[1.5rem] blur opacity-30 group-hover:opacity-60 transition duration-500 pointer-events-none" />
            <button
              onClick={analyzeSelected}
              disabled={isAnalyzing}
              className="relative w-full py-4 rounded-2xl bg-zinc-900 border border-purple-500/30 hover:border-purple-400 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
            >
              {/* Button Inner Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin relative z-10" />
                  <span className="text-white font-semibold tracking-wide relative z-10">Cross-Referencing {selectedIds.length} Reports...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5 text-purple-400 relative z-10" />
                  <span className="text-white font-semibold tracking-wide relative z-10">Analyze {selectedIds.length} Selected Record{selectedIds.length > 1 ? "s" : ""}</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {analysisError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mt-4">
              <AlertTriangle className="w-4 h-4" />
              <p>{analysisError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnalysisResultPanel result={analysisResult} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
