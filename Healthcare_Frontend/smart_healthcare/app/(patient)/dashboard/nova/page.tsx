"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNovaChat } from "@/hooks/useNovaChat";
import { MessageBubble } from "@/components/patient/nova/MessageBubble";
import { ThinkingIndicator } from "@/components/patient/nova/ThinkingIndicator";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, BrainCircuit, Activity, ArrowLeft } from "lucide-react";

export default function NovaAIPage() {
  const router = useRouter();
  const { messages, submitQuery, isThinking, statusStep, activeAgent, isLoadingHistory } = useNovaChat();
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
    // Re-focus input after send on desktop
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const suggestedPrompts = [
    "Analyze my recent lab report",
    "What do my symptoms mean?",
    "Schedule a follow-up appointment",
    "Explain my current medication",
  ];

  return (
    <div className="relative flex flex-col h-[calc(100vh-120px)] w-full rounded-[2rem] border border-white/5 bg-zinc-950/60 backdrop-blur-xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-zinc-950 to-transparent border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 hover:border-cyan-500/30 transition-all text-zinc-400 hover:text-cyan-400 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all">
                <BrainCircuit className="w-6 h-6 text-cyan-400" />
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-white tracking-tight drop-shadow-md">Nova AI</h1>
              <span className="text-xs font-medium tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Advanced Medical Assistant
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Chat Area ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-700/50">
        {isLoadingHistory ? (
          <div className="flex h-full items-center justify-center space-y-4 flex-col opacity-50">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-500" 
            />
            <span className="text-sm text-cyan-400/80 animate-pulse font-medium tracking-wide">Syncing neural pathways...</span>
          </div>
        ) : messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full items-center justify-center gap-8 text-center px-4 max-w-2xl mx-auto mt-[-5vh]"
          >
            {/* Massive Glowing Core */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-[40px] animate-pulse" />
              <div className="absolute inset-2 bg-purple-500/20 rounded-full blur-[20px]" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/50 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-light tracking-tight text-white drop-shadow-lg">
                Hello, I'm <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Nova.</span>
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed mx-auto max-w-lg">
                I'm your intelligent medical companion. I can analyze recent lab reports, cross-reference symptoms, and help manage your health journey.
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6">
              {suggestedPrompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setInputValue(prompt); inputRef.current?.focus(); }}
                  className="px-4 py-3.5 text-sm font-medium text-zinc-300 bg-zinc-900/40 border border-zinc-800/80 rounded-xl hover:bg-zinc-800/60 hover:border-cyan-500/30 hover:text-cyan-300 transition-all text-left shadow-inner flex items-center gap-3"
                >
                  <Activity className="w-4 h-4 text-cyan-500/60 shrink-0" />
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col min-h-full justify-end max-w-4xl mx-auto">
            <div className="space-y-8 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <MessageBubble message={msg} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Animated Thinking Indicator */}
              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <ThinkingIndicator status={statusStep} agentName={activeAgent} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Dummy div to scroll to bottom */}
              <div ref={endOfMessagesRef} className="h-2" />
            </div>
          </div>
        )}
      </div>

      {/* ─── Input Area ───────────────────────────────────────────────────── */}
      <div className="relative z-20 pb-6 pt-2 px-4 sm:px-8 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent shrink-0">
        <div className="max-w-4xl mx-auto relative group">
          {/* Outer glow ring on focus */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[2rem] blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex items-end gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 pr-3 shadow-2xl transition-all">
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
              placeholder="Message Nova AI..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 resize-none py-3.5 px-5 focus:outline-none scrollbar-thin scrollbar-thumb-zinc-700 leading-relaxed font-medium"
              disabled={isThinking || isLoadingHistory}
            />
            
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isThinking || isLoadingHistory}
              className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 mb-0.5
                ${inputValue.trim() && !isThinking
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                }`}
            >
              <Send className={`w-5 h-5 ml-0.5 ${inputValue.trim() && !isThinking ? "drop-shadow-md" : ""}`} />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] sm:text-xs text-zinc-500 mt-4 font-medium tracking-wide">
          Nova AI can make mistakes. Always consult a healthcare professional for serious concerns.
        </p>
      </div>

    </div>
  );
}
