"use client";

import React from "react";
import { useHabitTracker } from "../../../../context/habit-tracker.context";
import { format, parseISO } from "date-fns";

export const WellnessTrends = () => {
  const { trends, loading } = useHabitTracker();

  if (loading) {
    return (
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col gap-4 animate-pulse h-full min-h-[250px]">
        <div className="h-4 w-40 bg-zinc-800 rounded" />
        <div className="flex-1 flex items-end justify-between gap-2 mt-8">
            {[40, 70, 30, 80, 50, 90, 60].map((h, i) => (
               <div key={i} className={`w-8 bg-zinc-800 rounded-t-sm`} style={{ height: `${h}%` }} />
            ))}
        </div>
      </div>
    );
  }

  // Pre-process for chart heights
  const maxScore = 100; // Wellness score is out of 100

  return (
    <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/40 backdrop-blur-sm shadow-xl flex flex-col h-full min-h-[250px]">
       <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-base font-semibold text-white">Score Trends</h3>
             <p className="text-xs text-zinc-400 mt-1">Your performance over 7 days</p>
          </div>
       </div>

       <div className="flex-1 flex items-end justify-between gap-1 sm:gap-3 relative">
           
           {/* Background Grid Lines rendering 0, 50, 100 */}
           <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
               {[100, 50, 0].map(val => (
                   <div key={val} className="w-full flex items-center pr-2 border-t border-zinc-800/50">
                   </div>
               ))}
           </div>

           {/* Custom CSS Bar Chart */}
           {trends.map((day, idx) => {
               const dateObj = parseISO(day.date);
               const heightPercent = Math.max((day.score / maxScore) * 100, 2); // min 2% height so it shows
               const isToday = idx === trends.length - 1;
               
               // Dynamic gradient based on score
               let gradient = "from-zinc-700 to-zinc-800"; // Default/Missed
               if (day.score >= 80) gradient = "from-emerald-400 to-emerald-600";
               else if (day.score > 0) gradient = "from-amber-400 to-amber-600";

               return (
                  <div key={day.date} className="flex flex-col items-center flex-1 z-10 group cursor-crosshair">
                       
                       {/* Floating Tooltip (CSS Hover) */}
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 pointer-events-none px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg transform -translate-y-8 z-20 flex flex-col items-center">
                           <span className="text-[10px] font-bold text-white mb-0.5">{day.score} pts</span>
                       </div>

                       {/* Bar */}
                       <div className="w-full max-w-[28px] h-full flex items-end justify-center rounded-t-md overflow-hidden bg-zinc-800/20">
                           <div 
                             className={`w-full rounded-t-sm transition-all duration-1000 ease-in-out bg-gradient-to-t ${gradient} relative ${isToday ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                             style={{ height: `${heightPercent}%` }}
                           >
                              {/* Shimmer effect inside bar */}
                              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-700" />
                           </div>
                       </div>
                       
                       <span className={`text-[9px] sm:text-[10px] whitespace-nowrap font-medium mt-3 transition-colors ${isToday ? "text-white" : "text-zinc-500"}`}>
                           {format(dateObj, "MMM d")}
                       </span>
                  </div>
               )
           })}
       </div>
    </div>
  );
};
