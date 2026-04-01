"use client";

import React, { useState } from "react";
import { usePatientDashboard } from "../../../context/patient-dashboard.context";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Sparkles, Calendar as CalendarIcon, ArrowUpRight } from "lucide-react";

export const PersonalizedOverview = () => {
  const { profile, loading, refreshDashboard, appointments } = usePatientDashboard();
  const [bookingOpen, setBookingOpen] = useState(false);
  const router = useRouter();

  if (loading || !profile) {
    return <div className="p-6 border rounded-xl bg-gray-50/5 animate-pulse">Loading profile...</div>;
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  // Find today's appointment for the "Today" highlight
  const todayAppt = appointments.find(
    (a) =>
      a.status === "scheduled" &&
      new Date(a.appointmentDate).toDateString() === new Date().toDateString()
  );

  return (
    <>
      <BookAppointmentModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBooked={() => refreshDashboard()}
      />

      <div className="relative p-7 rounded-[2rem] border border-white/5 bg-zinc-950/80 backdrop-blur-2xl flex flex-col justify-between gap-5 h-full overflow-hidden shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] group">
        
        {/* Animated Aurora / Mesh Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-cyan-500/10 blur-[80px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[80px]" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[60px]"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col flex-1 gap-6">
        
        {/* Greeting Section */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mb-3"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300">NovaCure Active</span>
            </motion.div>
            
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight text-white drop-shadow-sm">
              {greeting}, <br/>
              <span className="font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {profile.name ? profile.name.split(" ")[0] : "Welcome"}
              </span>
            </h2>
          </div>
          {/* Profile completion hint */}
          {!profile.bloodGroup && !profile.height && (
            <span className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              Complete profile ↗
            </span>
          )}
        </div>

        {/* Today's Appointment Highlight */}
        {todayAppt && (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-white/5 shadow-inner backdrop-blur-md relative overflow-hidden group/appt mt-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover/appt:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <CalendarIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest mb-0.5">Today's Appointment</span>
                <span className="text-base font-medium text-zinc-100">
                  {todayAppt.doctorName && todayAppt.doctorName !== "Unknown Doctor"
                    ? todayAppt.doctorName
                    : todayAppt.doctorSpecialty || "Consultation"}
                </span>
                <span className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-cyan-400" /> {todayAppt.startTime} <span className="text-zinc-600">|</span> <span className="capitalize">{todayAppt.consultationType}</span>
                </span>
              </div>
            </div>
            {todayAppt.consultationType === "online" && (
              <button className="relative z-10 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center gap-1.5 min-w-max">
                Join Call <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setBookingOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard/nova")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-900 border border-purple-500/30 hover:bg-zinc-800 text-purple-400 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
          >
            <Sparkles className="w-4 h-4" /> Ask Nova AI
          </motion.button>
        </div>
        </div>
      </div>
    </>
  );
};
