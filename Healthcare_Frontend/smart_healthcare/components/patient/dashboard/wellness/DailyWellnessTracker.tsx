"use client";

import React from "react";
import { useHabitTracker } from "../../../../context/habit-tracker.context";
import { Droplet, Moon, Activity,  Coffee,  MonitorPlay, Wind } from "lucide-react";
import { HabitKey } from "../../../../type";

export const DailyWellnessTracker = () => {
  const { log, goals, wellnessScore, logHabit, loading } = useHabitTracker();

  if (loading) {
    return (
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col gap-4 animate-pulse h-full">
        <div className="h-4 w-40 bg-zinc-800 rounded" />
        <div className="w-48 h-48 mx-auto rounded-full border-[12px] border-zinc-800 my-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <div key={i} className="h-24 bg-zinc-800/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Helper to get actual vs target for numeric habits
  const getProgress = (key: HabitKey) => {
    if (!goals) return { actual: 0, target: 1, ratio: 0 };
    
    if (key === "stressRelief") {
        return {
           actual: log?.stressRelief ? 1 : 0,
           target: goals.stressReliefTarget ? 1 : 1,
           ratio: log?.stressRelief ? 1 : 0
        };
    }
    
    const actual = log ? ((log as any)[key] as number) : 0;
    const target = (goals as any)[`${key}Target`] as number || 1;
    return { actual, target, ratio: Math.min(actual / target, 1) };
  };

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (wellnessScore / 100) * circumference;

  return (
    <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/40 backdrop-blur-sm flex flex-col xl:flex-row gap-8 h-full shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Left Side: Score Circle */}
        <div className="flex flex-col items-center justify-center min-w-[280px]">
            <h3 className="text-xl font-semibold text-white mb-2 self-start xl:self-center">Today's Wellness</h3>
            <p className="text-sm text-zinc-400 mb-8 self-start xl:self-center text-center">Track your daily healthy habits</p>
            
            <div className="relative flex items-center justify-center">
                <svg className="w-56 h-56 transform -rotate-90">
                    <circle
                        cx="112"
                        cy="112"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        className="text-zinc-800"
                    />
                    <circle
                        cx="112"
                        cy="112"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="text-emerald-500 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-5xl font-bold text-white tracking-tighter">{wellnessScore}</span>
                    <span className="text-sm text-zinc-400 font-medium tracking-wide">SCORE</span>
                </div>
            </div>
            
            <p className="mt-6 text-sm font-medium text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
               {wellnessScore >= 80 ? "🔥 Great job today! Keep it up." : "Every small step counts. You got this!"}
            </p>
        </div>

        {/* Right Side: Habit Trackers Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            
            <HabitCard 
                title="Hydration" 
                icon={<Droplet className="w-4 h-4" />} 
                color="bg-cyan-500/10 text-cyan-400 border-cyan-500/20" 
                actual={getProgress("hydration").actual} 
                target={getProgress("hydration").target}
                unit="glasses"
                onAction={() => logHabit("hydration", 1, "increment")}
            />
            
           <HabitCard 
                title="Sleep" 
                icon={<Moon className="w-4 h-4" />} 
                color="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                actual={getProgress("sleep").actual} 
                target={getProgress("sleep").target}
                unit="hours"
                // Simulate tracking sleep, maybe needs modal in real app, assuming +0.5h for demo or "set".
                onAction={() => logHabit("sleep", getProgress("sleep").actual + 1, "set")} 
                actionLabel="+1 hr"
            />
            
             <HabitCard 
                title="Activity" 
                icon={<Activity className="w-4 h-4" />} 
                color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                actual={getProgress("physicalActivity").actual} 
                target={getProgress("physicalActivity").target}
                unit="min"
                onAction={() => logHabit("physicalActivity", 10, "increment")}
                actionLabel="+10m"
            />
            
              <HabitCard 
                title="Healthy Meals" 
                icon={<Coffee className="w-4 h-4" />} 
                color="bg-orange-500/10 text-orange-400 border-orange-500/20" 
                actual={getProgress("meals").actual} 
                target={getProgress("meals").target}
                unit="meals"
                onAction={() => logHabit("meals", 1, "increment")}
            />
            
              <HabitCard 
                title="Screen Breaks" 
                icon={<MonitorPlay className="w-4 h-4" />} 
                color="bg-pink-500/10 text-pink-400 border-pink-500/20" 
                actual={getProgress("screenBreaks").actual} 
                target={getProgress("screenBreaks").target}
                unit="breaks"
                onAction={() => logHabit("screenBreaks", 1, "increment")}
            />
            
             <div className="flex flex-col justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800 transition-colors hover:bg-zinc-800/50 group">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                       <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                           <Wind className="w-4 h-4" />
                       </div>
                       <span className="font-medium text-zinc-100 text-sm">Stress Relief</span>
                   </div>
                </div>
                
                <div className="flex items-end justify-between mt-auto pt-2">
                     <p className="text-xs text-zinc-500">Take a breath</p>
                    <button 
                       onClick={() => logHabit("stressRelief", !log?.stressRelief, "set")}
                       className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 border ${log?.stressRelief ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-transparent"}`}
                    >
                        {log?.stressRelief ? "Done ✅" : "Complete"}
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

// Sub-component for DRY
const HabitCard = ({ 
    title, icon, color, actual, target, unit, onAction, actionLabel = "+1" 
}: { 
    title: string, icon: React.ReactNode, color: string, actual: number, target: number, unit: string, onAction: () => void, actionLabel?: string 
}) => {
    
    const progressPercent = Math.min((actual / target) * 100, 100);
    const completed = actual >= target;

    return (
        <div className="flex flex-col justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800 transition-colors hover:bg-zinc-800/50 group relative overflow-hidden">
             
             {/* Progress background bar effect */}
             <div 
               className="absolute bottom-0 left-0 h-1 bg-zinc-700 w-full"
             >
                <div 
                  className={`h-full transition-all duration-700 ease-out flex ${color.split(' ')[0]}`} // extract just the bg-color
                  style={{ width: `${progressPercent}%` }}
                />
             </div>

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg border ${color}`}>
                        {icon}
                    </div>
                    <span className="font-medium text-zinc-100 text-sm">{title}</span>
                </div>
                 {completed && <span className="text-emerald-400 text-xs font-bold animate-pulse">✓</span>}
            </div>
            
            <div className="flex items-end justify-between mt-auto pt-2">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{actual}</span>
                    <span className="text-xs text-zinc-500">/ {target} {unit}</span>
                </div>
                
                <button 
                  onClick={onAction}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all active:scale-90 border border-zinc-700 shadow-sm"
                  title={`Add ${actionLabel}`}
                >
                    <span className="text-xs font-medium">{actionLabel}</span>
                </button>
            </div>
        </div>
    )
}
