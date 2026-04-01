"use client";

import React from "react";
import { usePatientDashboard } from "../../../context/patient-dashboard.context";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, FlaskConical, ScanLine, ExternalLink, Activity } from "lucide-react";
import { StructuredAnalysisDisplay } from "../reports/StructuredAnalysisDisplay";

export const MedicalRecords = () => {
  const { reports, analysis, loading } = usePatientDashboard();

  if (loading) {
    return (
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-1/2 bg-zinc-800 rounded"></div>
        <div className="h-28 bg-zinc-800 rounded-xl my-2"></div>
        <div className="flex flex-col gap-2 mt-2">
          <div className="h-14 bg-zinc-800 rounded-lg"></div>
          <div className="h-14 bg-zinc-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-7 rounded-[2rem] border border-white/5 bg-zinc-950/80 backdrop-blur-2xl flex flex-col gap-6 shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] overflow-hidden h-full">
      <div className="absolute inset-x-0 bottom-0 h-40 bg-emerald-500/5 blur-[80px] pointer-events-none" />
      <h3 className="text-lg font-medium text-white flex items-center gap-2 relative z-10">
        <FileText className="w-5 h-5 text-emerald-400" /> Medical Records & Insights
      </h3>

      {/* AI Health Summary */}
      {analysis && analysis.finalAnalysis && (
        <StructuredAnalysisDisplay analysisData={analysis.finalAnalysis} />
      )}

      {/* Reports List */}
      <div className="relative z-10">
        {reports.length === 0 ? (
          <div className="text-sm text-zinc-500 py-6 text-center flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 opacity-50" />
            No medical records found.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mt-2">
            <AnimatePresence>
              {reports.map((report, i) => {
                const date = new Date(report.uploadedAt);
                return (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/50 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800/80 group-hover:bg-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors shadow-inner">
                        {report.reportType === "lab" ? <FlaskConical className="w-5 h-5" /> : report.reportType === "imaging" ? <ScanLine className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-zinc-200 text-sm group-hover:text-white transition-colors">
                          {report.reportName || `${report.reportType} Report`}
                        </h4>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          <span className="w-1 h-1 rounded-full bg-zinc-700 mx-1"></span>
                          <span className="uppercase text-[9px] tracking-wider text-zinc-400">{report.reportType}</span>
                        </p>
                      </div>
                    </div>

                    {report.fileUrl && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md transition-all text-xs font-medium flex items-center gap-1.5"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </motion.a>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
