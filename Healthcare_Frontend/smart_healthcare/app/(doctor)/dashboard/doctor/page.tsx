"use client";

import React from "react";
import { useDoctorDashboard } from "@/context/doctor-dashboard.context";
import { WelcomeBanner } from "@/components/doctor/dashboard/WelcomeBanner";
import { ProfileStats } from "@/components/doctor/dashboard/ProfileStats";
import { TodayQueue } from "@/components/doctor/dashboard/TodayQueue";

export default function DoctorDashboardPage() {
  const { needsOnboarding, loading, error } = useDoctorDashboard();

  if (loading) {
    return (
      <div className="flex w-full h-[60vh] flex-col items-center justify-center gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500/20 border-t-cyan-500 rounded-full"></div>
        <p className="text-zinc-500 font-medium tracking-wide">Syncing your queue...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-center max-w-2xl mx-auto mt-20">
         {error}
       </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center px-6 py-20 mt-10 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl text-center">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to NovaCure</h2>
        <p className="text-zinc-400 mb-6 font-medium text-lg max-w-xl">
          It looks like you haven't completed your professional profile setup.
        </p>
        <p className="text-sm text-zinc-500 border border-zinc-700/50 bg-zinc-800/30 rounded-lg p-4 inline-block">
           <span className="text-amber-500">Notice:</span> Please map this page to your custom onboarding flow that hits <code className="bg-black px-1.5 py-0.5 rounded text-zinc-300">POST /doctor/create</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <header className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Doctor Portal</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your consultations and track performance.</p>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard/doctor/ai'}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-teal-500/30 hover:bg-teal-500/10 hover:border-teal-400 text-teal-400 rounded-xl transition-all shadow-lg shadow-teal-900/10 font-medium text-sm"
        >
          <span className="text-lg leading-none">🩺</span>
          Doctor AI
        </button>
      </header>
      
      {/* Overview Banner (full width) */}
      <WelcomeBanner />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* Main Queue */}
         <div className="md:col-span-8">
            <TodayQueue />
         </div>

         {/* Stats Panel */}
         <div className="md:col-span-4 max-h-[500px]">
            <ProfileStats />
         </div>
      </div>
    </div>
  );
}
