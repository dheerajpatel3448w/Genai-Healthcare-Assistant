"use client";

import React from "react";
import { useDoctorDashboard } from "@/context/doctor-dashboard.context";

export const ProfileStats = () => {
  const { profile, appointments } = useDoctorDashboard();

  if (!profile) return null;

  return (
    <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-6 h-full flex flex-col hover:border-zinc-700 transition-colors shadow-inner">
      <h3 className="text-zinc-100 font-semibold mb-6 flex items-center gap-2">
        <span className="text-blue-500">📈</span> Performance Analytics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Rating */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
          <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Platform Rating</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{profile.rating ? profile.rating.toFixed(1) : "New"}</span>
            <span className="text-sm text-yellow-500">⭐</span>
          </div>
        </div>

        {/* Patients Serviced */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
          <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Total Patients</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{profile.totalPatients || 0}</span>
          </div>
        </div>

        {/* Consultation Fee */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
          <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Standard Fee</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-400">₹{profile.consultationFee || 0}</span>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center">
          <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Experience</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{profile.experience || 0}</span>
            <span className="text-zinc-500 text-sm">Yrs</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
         <h4 className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">Service Modes Active</h4>
         <div className="flex flex-wrap gap-2">
            {profile.consultationType?.map((mode) => (
               <span key={mode} className="px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium capitalize">
                 {mode === "online" ? "🌐 Online" : mode === "clinic" ? "🏥 In-Clinic" : mode}
               </span>
            )) || <span className="text-zinc-500 text-sm">Not configured</span>}
         </div>
      </div>
    </div>
  );
};
