"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDoctorChat } from "@/hooks/useDoctorChat";
import { DoctorMessageBubble } from "@/components/doctor/ai/DoctorMessageBubble";
import { DoctorThinkingIndicator } from "@/components/doctor/ai/DoctorThinkingIndicator";
import { useRouter } from "next/navigation";

export default function DoctorAIPage() {
  const router = useRouter();
  const { messages, submitQuery, isThinking, statusStep, activeAgent, isLoadingHistory } = useDoctorChat();
  const [inputValue, setInputValue] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusStep]);

  // Handle Input Submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || isThinking) return;
    submitQuery(inputValue);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md overflow-hidden shadow-2xl">
      
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard/doctor")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors text-zinc-400"
          >
            ←
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="text-white text-xl font-serif">Ai</span>
              </div>
              <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white leading-tight">Doctor Brain AI</h1>
              <p className="text-xs text-teal-400/80 font-medium tracking-wide">
                CLINICAL ASSISTANT
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Chat Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-700">
        {isLoadingHistory ? (
          <div className="flex h-full items-center justify-center space-y-4 flex-col opacity-50">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
            <span className="text-sm text-zinc-400 animate-pulse">Loading clinical history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center gap-4 text-center opacity-70 px-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-3xl">🩺</div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-200">Clinical AI Assistant</h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-md leading-relaxed">
                I can help analyze lab results, cross-reference treatments, and query your patient schedules. What would you like to explore today?
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-full justify-end">
            <div className="space-y-6">
              {messages.map((msg) => (
                <DoctorMessageBubble key={msg.id} message={msg} />
              ))}
              
              <DoctorThinkingIndicator status={statusStep} agentName={activeAgent} />
              
              <div ref={endOfMessagesRef} className="h-4" />
            </div>
          </div>
        )}
      </div>

      {/* ─── Input Area ───────────────────────────────────────────────────── */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <div className="relative flex items-end gap-2 bg-zinc-950 border border-zinc-700/60 focus-within:border-teal-500/50 rounded-2xl p-2 transition-all shadow-inner">
          
          <textarea
            ref={inputRef}
            tabIndex={0}
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a clinical question, query patient data, or analyze treatments..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent text-sm text-zinc-200 placeholder-zinc-500 resize-none py-3 px-3 focus:outline-none scrollbar-thin scrollbar-thumb-zinc-700 leading-relaxed"
            disabled={isThinking || isLoadingHistory}
          />
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isThinking || isLoadingHistory}
            className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-200
              ${inputValue.trim() && !isThinking
                ? "bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
          >
            {isThinking ? (
              <svg className="w-5 h-5 animate-spin text-teal-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
