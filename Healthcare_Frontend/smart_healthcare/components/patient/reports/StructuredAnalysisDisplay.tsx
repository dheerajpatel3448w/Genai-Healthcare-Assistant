"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Activity, ShieldCheck, AlertTriangle, AlertCircle, CheckCircle, ChevronRight, Loader2, BrainCircuit } from 'lucide-react';

interface StructuredAnalysisProps {
  analysisData: any;
}

export const StructuredAnalysisDisplay: React.FC<StructuredAnalysisProps> = ({ analysisData }) => {
  // Gracefully handle strings vs objects
  const parsedData = useMemo(() => {
    if (!analysisData) return null;
    if (typeof analysisData === "string") {
      try {
        // Try parsing string to JSON in case it's a stringified JSON object
        return JSON.parse(analysisData);
      } catch (e) {
        // If it's a raw string (e.g. markdown), we'll display it in a formatted block
        return { summary: analysisData };
      }
    }
    return analysisData;
  }, [analysisData]);

  if (!parsedData) return null;

  // Extract common AI medical analysis fields based on FinalMedicalAnalysisSchema & LabReport/Clinical schemas
  const summary = parsedData.overall_health_assessment || parsedData.clinical_interpretation || parsedData.summary || (typeof parsedData === 'string' ? parsedData : null);
  const likelyIssue = parsedData.likely_health_issue;
  
  // Normalize finding arrays
  let findings = parsedData.combined_key_findings 
    ? parsedData.combined_key_findings.map((f: any) => f.finding || f)
    : (parsedData.keyFindings || []);

  if (Array.isArray(parsedData.abnormal_findings)) {
    const abn = parsedData.abnormal_findings.map((a: any) => `${a.parameter}: ${a.value} (${a.status})`);
    findings = [...findings, ...abn];
  }
  if (Array.isArray(parsedData.detected_patterns)) {
    const pat = parsedData.detected_patterns.map((p: any) => `Pattern: ${p.description}`);
    findings = [...findings, ...pat];
  }
  if (Array.isArray(parsedData.imaging_findings)) {
    findings = [...findings, ...parsedData.imaging_findings.map((i: any) => i.finding || i)];
  }

  const conditions = parsedData.possible_conditions || [];
  
  // Normalize risks / recommendations
  const risks = parsedData.health_risks || parsedData.risk_flags || parsedData.recommendations || [];
  
  // Automatically determine a high-level risk based on the severity of health_risks
  const riskLevel = useMemo(() => {
    if (parsedData.riskLevel) return parsedData.riskLevel;
    if (Array.isArray(risks)) {
      if (risks.some((r: any) => r.severity === 'high')) return 'High';
      if (risks.some((r: any) => r.severity === 'moderate')) return 'Moderate';
    }
    return 'Normal';
  }, [parsedData.riskLevel, risks]);
  
  // Risk Level Config
  const riskConfig = useMemo(() => {
    const level = String(riskLevel).toLowerCase();
    if (level.includes("high") || level.includes("severe") || level.includes("critical")) {
      return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: <AlertTriangle className="w-5 h-5 text-red-500" /> };
    }
    if (level.includes("medium") || level.includes("moderate") || level.includes("elevated")) {
      return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: <Activity className="w-5 h-5 text-amber-500" /> };
    }
    return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> };
  }, [riskLevel]);

  return (
    <div className="w-full relative mx-auto mt-4 overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-950 shadow-2xl shadow-cyan-900/10">
      
      {/* Background glow effects matching home page */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 p-5 md:p-7">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0">
              <BrainCircuit className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white tracking-tight drop-shadow-md">AI Health Analysis</h3>
              <p className="text-xs text-cyan-400 font-medium tracking-wide uppercase mt-0.5">Automated Intelligence Report</p>
            </div>
          </div>
          
          {/* Risk Badge */}
          {riskLevel && (
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-inner backdrop-blur-sm ${riskConfig.bg} ${riskConfig.border} w-fit`}>
              {riskConfig.icon}
              <span className={`text-sm font-semibold tracking-wide ${riskConfig.color} uppercase`}>
                {riskLevel} Risk
              </span>
            </div>
          )}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Summary & Recommendations */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* Summary Block */}
            {summary && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Executive Summary
                </h4>
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-inner leading-relaxed text-zinc-300 text-sm">
                  {typeof summary === 'string' ? summary : JSON.stringify(summary)}
                  {likelyIssue && (
                    <div className="mt-3 pt-3 border-t border-zinc-700/50">
                      <span className="text-cyan-400 font-semibold text-xs uppercase tracking-wider block mb-1">Likely Issue:</span>
                      <span className="text-white font-medium text-base">{likelyIssue}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Risks / Recommendations Block */}
            {Array.isArray(risks) && risks.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-3 mt-auto">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400/80 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" /> Identified Risks
                </h4>
                <div className="flex flex-col gap-2.5">
                  {risks.map((rec: any, i: number) => {
                    const text = typeof rec === 'string' ? rec : (rec.risk || JSON.stringify(rec));
                    const severity = typeof rec === 'object' && rec.severity ? rec.severity : null;
                    return (
                      <div key={i} className="group flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <div className="flex flex-col">
                           <p className="text-sm font-medium text-emerald-50/90 leading-snug">{text}</p>
                           {severity && <span className="text-[10px] uppercase tracking-widest text-emerald-400/70 mt-1 font-bold">Severity: {severity}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Key Findings & Conditions */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {Array.isArray(conditions) && conditions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full flex flex-col p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm shadow-inner">
                <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400/80 mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Possible Conditions
                </h4>
                <div className="flex flex-col gap-3">
                  {conditions.map((cond: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                      <span className="text-sm font-medium text-purple-100">{cond.condition}</span>
                      {cond.likelihood && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                          {cond.likelihood}
                        </span>
                      )}
                      {cond.reason && !cond.likelihood && (
                         <span className="text-xs text-purple-200/70 ml-2">{cond.reason}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {Array.isArray(findings) && findings.length > 0 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full flex flex-col p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm shadow-inner">
                <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400/80 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Key Findings
                </h4>
                <ul className="flex flex-col gap-4">
                  {findings.map((finding: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300 group">
                      <ChevronRight className="w-4 h-4 text-cyan-500/50 mt-0.5 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                      <span className="leading-relaxed font-light block w-full">{finding}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              // Fallback for completely unknown data types
              !summary && (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 w-full overflow-auto break-words text-xs text-zinc-400 font-mono shadow-inner">
                  <pre className="whitespace-pre-wrap leading-relaxed">{JSON.stringify(parsedData, null, 2)}</pre>
                </div>
              )
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
