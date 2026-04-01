"use client";

import React from "react";
import { useHabitTracker } from "../../../../context/habit-tracker.context";
import { format, parseISO } from "date-fns";

export const WellnessStreak = () => {
  const { streak, loading } = useHabitTracker();

  if (loading) {
    return (
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col gap-4 animate-pulse h-full">
        <div className="h-4 w-32 bg-zinc-800 rounded" />
        <div className="flex justify-between items-center mt-4">
           {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="w-10 h-10 rounded-lg bg-zinc-800" />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/40 backdrop-blur-sm shadow-xl flex flex-col h-full relative overflow-hidden">
        <div className="flex items-center justify-between xl:flex-col xl:items-start 2xl:flex-row 2xl:items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">7-Day Streak</h3>
              <p className="text-xs text-zinc-400 mt-1">Your recent consistency</p>
            </div>
             <div className="px-3 py-1 bg-zinc-800/80 rounded-full border border-zinc-700 mt-2 xl:mt-4 2xl:mt-0">
                 <span className="text-xs font-medium text-emerald-400">
                     {streak.filter(s => s.status === "complete").length} / 7 Perfect Days
                 </span>
            </div>
        </div>

        <div className="flex justify-between items-end h-full gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {streak.map((day, idx) => {
                const dateObj = parseISO(day.date);
                const isToday = idx === streak.length - 1;

                let colors = "bg-zinc-800/50 border-zinc-700/50 text-zinc-500"; // Missed
                let icon = "⭕";
                
                if (day.status === "complete") {
                    colors = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                    icon = "🔥";
                } else if (day.status === "partial") {
                    colors = "bg-amber-500/10 border-amber-500/30 text-amber-500";
                    icon = "⭐";
                }

                return (
                    <div key={day.date} className="flex flex-col items-center min-w-[40px] flex-1 group">
                        <span className={`text-[10px] font-medium mb-3 transition-colors ${isToday ? "text-white" : "text-zinc-500"}`}>
                            {isToday ? "TDY" : format(dateObj, "EEE").toUpperCase()}
                        </span>
                        
                        <div 
                          className={`w-full max-w-[48px] aspect-square flex items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105 ${colors} ${isToday ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-zinc-950' : ''}`}
                          title={`Score: ${day.score}`}
                        >
                            <span className={`text-sm ${day.status === 'missed' ? 'opacity-30' : 'opacity-100'}`}>{icon}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
