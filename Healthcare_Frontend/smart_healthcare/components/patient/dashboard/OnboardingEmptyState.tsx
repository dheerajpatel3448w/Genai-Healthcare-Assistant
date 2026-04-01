"use client";

import React, { useState } from "react";
import { usePatientDashboard } from "../../../context/patient-dashboard.context";
import { BookAppointmentModal } from "./BookAppointmentModal";

export const OnboardingEmptyState = () => {
  const { profile, appointments, reports, loading, refreshDashboard } = usePatientDashboard();
  const [bookingOpen, setBookingOpen] = useState(false);

  // Only show if not loading AND the patient has no appointments and no reports
  if (loading) return null;
  if (appointments.length > 0 || reports.length > 0) return null;

  return (
    <>
      <BookAppointmentModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBooked={() => refreshDashboard()}
      />

      <div className="md:col-span-12">
        <div className="relative overflow-hidden p-8 rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-950 to-indigo-950/20 text-center flex flex-col items-center gap-5">
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-3xl">🏥</span>
            </div>
            <h3 className="text-xl font-semibold text-white">
              Welcome to NovaCure{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
            </h3>
            <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Your health dashboard is ready. Book your first appointment or let our AI assistant help you understand your health better.
            </p>
          </div>

          <div className="flex gap-3 mt-2 relative">
            <button
              onClick={() => setBookingOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all active:scale-95"
            >
              📅 Book First Appointment
            </button>
            <button
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-all active:scale-95 border border-zinc-700"
              onClick={() =>
                (window.location.href = "/onboarding")
              }
            >
              👤 Complete Profile
            </button>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-6 mt-2 text-xs text-zinc-500 relative">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center text-[10px]">✓</span>
              Account created
            </div>
            <div className="w-8 h-px bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${profile?.bloodGroup ? "bg-green-500/20 border border-green-500/40 text-green-400" : "bg-zinc-800 border border-zinc-700 text-zinc-500"}`}>
                {profile?.bloodGroup ? "✓" : "2"}
              </span>
              Profile setup
            </div>
            <div className="w-8 h-px bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 flex items-center justify-center text-[10px]">3</span>
              First appointment
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
