import React from "react";
import { HabitTrackerProvider } from "../../../../context/habit-tracker.context";
import { DailyWellnessTracker } from "../../../../components/patient/dashboard/wellness/DailyWellnessTracker";
import { WellnessStreak } from "../../../../components/patient/dashboard/wellness/WellnessStreak";
import { WellnessTrends } from "../../../../components/patient/dashboard/wellness/WellnessTrends";
import { WeeklyTipBanner } from "../../../../components/patient/dashboard/wellness/WeeklyTipBanner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WellnessDashboardPage() {
  return (
    <HabitTrackerProvider>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-h-screen">
        
        {/* Header & Back Nav */}
        <header className="flex flex-col gap-4">
           <Link 
              href="/dashboard"
               className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-fit"
           >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
           </Link>
           <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 leading-tight">
                 Daily Wellness Space
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                 Track your micro-habits and watch your consistency grow.
              </p>
           </div>
        </header>

        {/* Tip Banner Row */}
        <WeeklyTipBanner />

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Top Row — Primary Tracker Component (8 Cols) & Streak (4 Cols) */}
            <div className="xl:col-span-8">
               <DailyWellnessTracker />
            </div>
            
            <div className="xl:col-span-4 h-full xl:min-h-[400px]">
               <WellnessStreak />
            </div>

            {/* Bottom Row — Trends Chart (Full Width or 12 Cols) */}
            <div className="xl:col-span-12">
               <WellnessTrends />
            </div>

        </div>

      </div>
    </HabitTrackerProvider>
  );
}
