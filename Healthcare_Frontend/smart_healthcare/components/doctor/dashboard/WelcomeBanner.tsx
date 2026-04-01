"use client";

import React from "react";
import { useDoctorDashboard } from "@/context/doctor-dashboard.context";
import { useDoctorData } from "@/context/docter.context";
import Image from "next/image";

export const WelcomeBanner = () => {
  const { profile, appointments } = useDoctorDashboard();
  const { doctor } = useDoctorData();

  const todayCount = appointments.filter((app) => {
      // Basic check if appointment is today. Assuming ISO date format yyyy-mm-dd
      const date = new Date(app.date).toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      return date === today && app.status !== "cancelled";
  }).length;

  const pendingCount = appointments.filter(a => a.status === "pending").length;

  const name = doctor?.name || "Doctor";
  const initials = name.substring(0,2).toUpperCase();
  const imageSrc = profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=200`;

  return (
    <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-6 md:p-8 flex items-center justify-between gap-6 hover:border-zinc-700 transition-colors shadow-inner overflow-hidden relative">
      
      {/* Background glow flair */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="flex items-center gap-6 relative z-10 w-full">
        <div className="relative shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-zinc-800 relative bg-zinc-900 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-zinc-950 flex items-center justify-center border-2 border-zinc-950">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Online & Receiving" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
            Good Morning, Dr. {name.split(" ")[0]}
          </h2>
          <p className="text-blue-400 font-medium text-sm md:text-base mt-1">
            {profile?.specialization || "General Practitioner"}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 md:gap-8">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Today's Load</span>
              <span className="text-emerald-400 font-bold text-lg leading-none">{todayCount} Consults</span>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Pending Approvals</span>
              <span className="text-amber-400 font-bold text-lg leading-none">{pendingCount} Requests</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
