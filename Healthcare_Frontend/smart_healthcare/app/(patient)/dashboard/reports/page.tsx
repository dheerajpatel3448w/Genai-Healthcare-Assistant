"use client";

import React, { useState } from "react";
import { MultiSectionUpload } from "@/components/patient/reports/MultiSectionUpload";
import { HistoricalAnalysis } from "@/components/patient/reports/HistoricalAnalysis";
import { motion } from "framer-motion";
import { UploadCloud, History } from "lucide-react";

type Tab = "upload" | "history";

const tabs = [
  {
    id: "upload" as Tab,
    label: "Upload Reports",
    icon: <UploadCloud className="w-5 h-5" />,
    desc: "Process new medical images & lab results",
  },
  {
    id: "history" as Tab,
    label: "Past Reports",
    icon: <History className="w-5 h-5" />,
    desc: "View previously analyzed diagnostic records",
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upload");

  return (
    <div className="relative flex flex-col gap-6 w-full max-w-5xl mx-auto z-10 p-2 sm:p-4">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] pointer-events-none -z-10" />

      {/* Page Header */}
      <header className="mb-2">
        <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight drop-shadow-md">
          Medical <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Records</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base mt-2 font-medium tracking-wide">
          Upload and seamlessly process diagnostic imaging, lab reports, and clinical notes through Nova AI.
        </p>
      </header>

      {/* Segmented Tab Bar */}
      <div className="relative flex p-1.5 rounded-2xl bg-zinc-950/80 border border-white/5 backdrop-blur-xl shadow-inner w-full max-w-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-3 px-4 py-3 sm:py-4 rounded-xl text-center sm:text-left transition-colors duration-300 z-10 group
                ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-zinc-800/80 border border-white/10 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.1)] -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-zinc-900 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-cyan-400/50"}`}>
                {tab.icon}
              </div>
              
              <div className="flex flex-col">
                <span className={`text-sm md:text-base font-semibold leading-tight tracking-wide ${isActive ? "text-white" : "text-zinc-400"}`}>
                  {tab.label}
                </span>
                <span className={`text-[10px] md:text-xs mt-0.5 tracking-wide hidden sm:block transition-colors ${isActive ? "text-cyan-400/80" : "text-zinc-600 group-hover:text-zinc-500"}`}>
                  {tab.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content Wrap */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full relative h-full flex flex-col"
      >
        <div className="rounded-[2rem] border border-white/5 bg-zinc-950/40 backdrop-blur-md p-4 sm:p-8 min-h-[500px] shadow-2xl flex-1">
          {activeTab === "upload" && <MultiSectionUpload />}
          {activeTab === "history" && <HistoricalAnalysis />}
        </div>
      </motion.div>
    </div>
  );
}
