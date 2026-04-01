"use client";

import React, { useState } from "react";
import { useHabitTracker } from "../../../../context/habit-tracker.context";
import { Lightbulb, X, TrendingDown } from "lucide-react";

export const WeeklyTipBanner = () => {
    const { tip, loading } = useHabitTracker();
    const [dismissed, setDismissed] = useState(false);

    if (loading || !tip || dismissed) return null;

    const habitNames: Record<string, string> = {
        hydration: "Hydration",
        sleep: "Sleep",
        physicalActivity: "Physical Activity",
        meals: "Healthy Meals",
        screenBreaks: "Screen Breaks",
        stressRelief: "Stress Relief"
    };

    const weakestName = habitNames[tip.weakestHabit] || tip.weakestHabit;
    const completionPercent = Math.round((tip.completionRates[tip.weakestHabit] || 0) * 100);

    return (
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 rounded-xl p-4 flex items-start gap-4 shadow-lg backdrop-blur-md relative overflow-hidden group">
            {/* Glow effect */}
            <div className="absolute top-0 left-0 w-[400px] h-full bg-gradient-to-r from-indigo-500/20 to-transparent blur-2xl -translate-x-[200px] group-hover:translate-x-0 transition-transform duration-1000 ease-in-out pointer-events-none" />

            <div className="p-2 sm:p-3 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0 border border-indigo-500/20 mt-1">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1.5">
                    <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        Weekly Focus: {weakestName}
                    </h4>
                    <span className="hidden sm:block text-zinc-600">•</span>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 w-fit">
                        <TrendingDown className="w-3 h-3" /> {completionPercent}% Avg
                    </span>
                 </div>
                <p className="text-sm text-zinc-300 leading-relaxed pr-6">
                    {tip.tip}
                </p>
            </div>

            <button 
               onClick={() => setDismissed(true)}
               className="shrink-0 p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors absolute top-3 right-3 sm:static"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
