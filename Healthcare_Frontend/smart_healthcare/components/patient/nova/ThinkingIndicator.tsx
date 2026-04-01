"use client";

import React from "react";
import { AiStatusStep } from "@/hooks/useNovaChat";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

interface ThinkingIndicatorProps {
  status: AiStatusStep;
  agentName: string | null;
}

export function ThinkingIndicator({ status, agentName }: ThinkingIndicatorProps) {
  if (status === "idle" || status === "completed" || status === "error") {
    return null;
  }

  // Interpret system status into user-friendly text
  let statusText = "Nova is thinking...";
  let isAction = false;
  let accentColor = "from-cyan-500 to-blue-500";
  let glowColor = "shadow-[0_0_15px_rgba(6,182,212,0.3)]";
  let textColor = "text-cyan-400";

  switch (status) {
    case "improving_query":
      statusText = "Analyzing intent...";
      break;
    case "generating":
      statusText = "Synthesizing response...";
      accentColor = "from-purple-500 to-violet-500";
      glowColor = "shadow-[0_0_15px_rgba(168,85,247,0.3)]";
      textColor = "text-purple-400";
      break;
    case "tool_called":
    case "handoff_requested":
      statusText = "Accessing secure records...";
      accentColor = "from-emerald-500 to-teal-500";
      glowColor = "shadow-[0_0_15px_rgba(16,185,129,0.3)]";
      textColor = "text-emerald-400";
      isAction = true;
      break;
    case "tool_output":
    case "handoff_occurred":
      statusText = "Processing data...";
      accentColor = "from-indigo-500 to-cyan-500";
      glowColor = "shadow-[0_0_15px_rgba(99,102,241,0.3)]";
      textColor = "text-indigo-400";
      isAction = true;
      break;
    default:
      break;
  }

  return (
    <div className="flex w-full justify-start mb-6 mt-2 ml-4">
      <div className={`flex items-center gap-4 max-w-[85%] bg-zinc-900 border border-white/10 pl-2 pr-5 py-2.5 rounded-full ${glowColor} transition-all duration-500`}>
        {/* Pulsing Neural Core */}
        <div className="relative flex items-center justify-center w-8 h-8">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${accentColor} blur-sm opacity-50`}
          />
          <div className="relative w-7 h-7 bg-zinc-950 rounded-full border border-white/10 flex items-center justify-center z-10">
             <BrainCircuit className={`w-3.5 h-3.5 ${textColor}`} />
          </div>
        </div>
        
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            {agentName && agentName !== "HealthBrain" && (
              <span className={`text-[9px] font-bold tracking-widest uppercase bg-gradient-to-r ${accentColor} bg-clip-text text-transparent`}>
                {agentName}
              </span>
            )}
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={`text-xs font-medium tracking-wide ${textColor} leading-none mt-0.5 whitespace-nowrap`}
          >
            {statusText}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
