"use client";

import React, { useCallback, useState } from "react";
import { useMultiSectionUpload, UploadSection } from "@/hooks/useMultiSectionUpload";
import { StructuredAnalysisDisplay } from "./StructuredAnalysisDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileScan, CheckCircle2, Clock, AlertCircle, Loader2, BrainCircuit, X, Plus, BarChart2, History } from "lucide-react";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  idle:       { label: "Awaiting Files", color: "text-zinc-500", bg: "bg-zinc-800/50 border-zinc-700/50", icon: <Clock className="w-3.5 h-3.5" /> },
  uploading:  { label: "Uploading",      color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", icon: <UploadCloud className="w-3.5 h-3.5" /> },
  processing: { label: "AI Analysis",    color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: <BrainCircuit className="w-3.5 h-3.5 animate-pulse" /> },
  done:       { label: "Analyzed",       color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  error:      { label: "Failed",         color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

// ─── Single Section Card ──────────────────────────────────────────────────────
function SectionCard({
  section,
  index,
  onFileDrop,
  onRemove,
}: {
  section: UploadSection;
  index: number;
  onFileDrop: (sectionId: string, files: File[]) => void;
  onRemove: (sectionId: string) => void;
}) {
  const cfg = statusConfig[section.status] || statusConfig.idle;
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFileDrop(section.sectionId, files);
    },
    [section.sectionId, onFileDrop]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) onFileDrop(section.sectionId, files);
    },
    [section.sectionId, onFileDrop]
  );

  const canRemove = section.status === "idle" || section.status === "error";

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative rounded-2xl border bg-zinc-900/40 backdrop-blur-md overflow-hidden transition-all duration-300
        ${isDragging ? "border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]" : "border-white/5 hover:border-white/10"}
      `}
    >
      {/* Animated Gradient Border for Processing */}
      {section.status === "processing" && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" style={{ backgroundSize: "200% 100%" }} />
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-zinc-950/20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300 shadow-inner">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-zinc-100 tracking-wide">
            {section.reportName || `Report Section ${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-bold tracking-widest uppercase ${cfg.color} ${cfg.bg} shadow-inner`}>
            {cfg.icon} <span>{cfg.label}</span>
          </span>
          {canRemove && (
            <button
              onClick={() => onRemove(section.sectionId)}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-800/50 border border-transparent hover:border-red-500/30 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Remove section"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Drop Zone — only show when idle/error */}
      {(section.status === "idle" || section.status === "error") && (
        <label
          htmlFor={`file-input-${section.sectionId}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center gap-4 p-8 cursor-pointer group transition-all duration-300
            ${isDragging ? "bg-cyan-500/5" : "hover:bg-zinc-800/30"}
          `}
        >
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-inner
            ${isDragging 
              ? "bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
              : "bg-zinc-800 border border-dashed border-zinc-600 group-hover:border-cyan-500/50 text-zinc-400 group-hover:text-cyan-400 group-hover:scale-105"
            }
          `}>
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-zinc-300 transition-colors font-medium">
              <span className="text-cyan-400 group-hover:text-cyan-300 font-semibold underline underline-offset-4 decoration-cyan-400/30">Click to browse</span> or drag & drop files here
            </p>
            <p className="text-xs text-zinc-500 tracking-wide">Supports clear images (PNG, JPG) or crisp PDFs</p>
          </div>
          {section.errorMsg && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
               <AlertCircle className="w-3.5 h-3.5" />
               <p>{section.errorMsg}</p>
            </div>
          )}
          <input
            id={`file-input-${section.sectionId}`}
            type="file"
            multiple
            accept="image/*,.pdf"
            className="sr-only"
            onChange={handleFileInput}
          />
        </label>
      )}

      {/* Uploading / Processing State */}
      {(section.status === "uploading" || section.status === "processing") && (
        <div className="flex flex-col items-center justify-center gap-5 p-10 bg-zinc-950/20">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 shadow-inner flex items-center justify-center relative z-10">
              {section.status === "uploading" 
                ? <UploadCloud className="w-7 h-7 text-blue-400 animate-bounce" />
                : <FileScan className="w-7 h-7 text-cyan-400 animate-pulse" />
              }
            </div>
            {/* Orbital ring */}
            {section.status === "processing" && (
               <svg className="absolute -inset-4 w-24 h-24 animate-[spin_3s_linear_infinite] text-cyan-500/30" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 10" />
                 <circle cx="50" cy="2" r="3" fill="currentColor" className="text-cyan-400" />
               </svg>
            )}
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-zinc-100 tracking-wide">
              {section.status === "uploading"
                ? `Uploading ${section.files.length} Secure File(s)`
                : "Quantum AI is extracting medical data..."}
            </p>
            {section.jobId && (
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-2">TASK ID: {section.jobId.slice(0,12)}</p>
            )}
          </div>
        </div>
      )}

      {/* Done State */}
      {section.status === "done" && (
        <div className="flex items-center gap-4 p-5 sm:p-6 bg-gradient-to-r from-emerald-500/5 to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-300 truncate">
              {section.reportName || "Report Successfully Processed"}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
               <p className="text-xs text-zinc-400 font-medium tracking-wide">
                 <span className="text-zinc-300">{section.files.length}</span> File(s) Extracted
               </p>
               <span className="w-1 h-1 rounded-full bg-zinc-700" />
               <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                 ID: {section.reportId?.slice(-8)}
               </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Analysis Result Panel ─────────────────────────────────────────────────────
function AnalysisResultPanel({ result }: { result: any }) {
  if (!result) return null;

  const analysis = result?.anaylisis ?? result?.analysis ?? result;
  const finalAnalysis = analysis?.finalAnalysis;
  const combinedResults = analysis?.combinedResults;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6 mt-8"
    >
      {finalAnalysis && <StructuredAnalysisDisplay analysisData={finalAnalysis} />}

      {combinedResults && (
        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <BarChart2 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">Source Data Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(combinedResults).map(([key, val]: [string, any]) => (
              Array.isArray(val) && val.length > 0 && (
                <div key={key} className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-white/5 p-4 hover:border-purple-500/30 transition-colors group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                    {key.replace("_", " ")}
                  </p>
                  <p className="text-sm font-medium text-purple-100 flex items-center gap-2">
                    <span className="text-xl font-bold text-purple-400">{val.length}</span> Records Parsed
                  </p>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function MultiSectionUpload() {
  const {
    sections,
    addSection,
    removeSection,
    uploadSection,
    isAnalyzing,
    completedReportCount,
    analyzeSelected,
    analysisResult,
    analysisError,
    reset,
  } = useMultiSectionUpload();

  const handleAnalyze = async () => {
    await analyzeSelected();
  };

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Diagnostic Input Stream</h2>
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
            Upload individual records as separate sections to maintain context. Once data is extracted, use Nova AI to generate a unified medical summary.
          </p>
        </div>
        {completedReportCount > 0 && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner w-fit sm:flex-shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {completedReportCount} Block{completedReportCount > 1 ? "s" : ""} Ready
            </span>
          </motion.div>
        )}
      </div>

      {/* Section Cards List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {sections.map((section, i) => (
            <SectionCard
              key={section.sectionId}
              section={section}
              index={i}
              onFileDrop={uploadSection}
              onRemove={removeSection}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Area */}
      <div className="flex flex-col gap-4 mt-8">
        
        {/* Add Section Button */}
        <button
          onClick={addSection}
          className="w-full py-4 rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/30 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2 group shadow-inner"
        >
          <div className="p-1 rounded bg-zinc-800 group-hover:bg-cyan-500/20 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          Initialize New Upload Section
        </button>

        {/* Analyze Button */}
        <AnimatePresence>
          {completedReportCount > 0 && !analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group mt-2"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[1.5rem] blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="relative w-full py-4 rounded-2xl bg-zinc-900 border border-white/10 hover:border-white/20 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
              >
                {/* Button Inner Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin relative z-10" />
                    <span className="text-white font-semibold tracking-wide relative z-10">Synthesizing {completedReportCount} Block(s)...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5 text-cyan-400 relative z-10" />
                    <span className="text-white font-semibold tracking-wide relative z-10">Generate Unified AI Summary</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Output */}
      <AnimatePresence>
        {analysisError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mt-4">
               <AlertCircle className="w-4 h-4" />
               <p>{analysisError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Result Container */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-zinc-800/60 mt-8">
            <AnalysisResultPanel result={analysisResult} />
            
            <button
              onClick={reset}
              className="w-full mt-8 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all text-sm font-semibold flex items-center justify-center gap-2 group"
            >
              <History className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
              Reset & Start New Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
