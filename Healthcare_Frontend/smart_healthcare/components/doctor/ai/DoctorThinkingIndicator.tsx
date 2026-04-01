"use client";

import React from "react";
import { DoctorStatusStep } from "@/hooks/useDoctorChat";

interface DoctorThinkingIndicatorProps {
  status: DoctorStatusStep;
  agentName: string | null;
}

export function DoctorThinkingIndicator({ status, agentName }: DoctorThinkingIndicatorProps) {
  if (status === "idle" || status === "completed" || status === "error") {
    return null;
  }

  let statusText = "Doctor AI is thinking...";
  let isAction = false;

  switch (status) {
    case "verifying_doctor":
      statusText = "Verifying credentials...";
      break;
    case "generating":
      statusText = "Synthesizing clinical response...";
      break;
    case "tool_called":
    case "handoff_requested":
      statusText = "Accessing Electronic Medical Records (EMR)...";
      isAction = true;
      break;
    case "tool_output":
    case "handoff_occurred":
      statusText = "Processing clinical data...";
      isAction = true;
      break;
    default:
      break;
  }

  return (
    <div className="flex w-full justify-start mb-4 px-2 animation-fade-in">
      <div className="flex items-center gap-3 max-w-[85%] bg-zinc-900/50 border border-teal-500/20 px-4 py-2 rounded-full">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
        
        <div className="flex items-center gap-2">
          {agentName && agentName !== "DoctorBrain" && (
            <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase bg-teal-500/10 px-2 py-0.5 rounded-sm">
              {agentName}
            </span>
          )}
          <span className={`text-xs font-medium ${isAction ? "text-cyan-400" : "text-zinc-400"}`}>
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
}
