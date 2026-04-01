"use client";

import React, { useState } from "react";
import { usePatientDashboard } from "../../../context/patient-dashboard.context";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Video, Building, Clock, ChevronRight, CheckCircle, XCircle } from "lucide-react";

type Tab = "upcoming" | "history";

const STATUS_ICONS: Record<string, any> = {
  completed: <CheckCircle className="w-3 h-3 mr-1" />,
  cancelled: <XCircle className="w-3 h-3 mr-1" />,
  rescheduled: <Clock className="w-3 h-3 mr-1" />,
  no_show: <XCircle className="w-3 h-3 mr-1" />,
};

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-500/20 text-green-400 border border-green-500/20",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/20",
  rescheduled: "bg-blue-500/20 text-blue-400 border border-blue-500/20",
  no_show: "bg-zinc-700 text-zinc-400 border border-zinc-600",
};

export const UpcomingAppointments = () => {
  const { appointments, loading } = usePatientDashboard();
  const [tab, setTab] = useState<Tab>("upcoming");

  if (loading) {
    return (
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-1/3 bg-zinc-800 rounded"></div>
        <div className="flex gap-2"><div className="h-8 flex-1 bg-zinc-800 rounded"></div><div className="h-8 flex-1 bg-zinc-800 rounded"></div></div>
        <div className="h-24 bg-zinc-800 rounded-lg"></div>
        <div className="h-24 bg-zinc-800 rounded-lg"></div>
      </div>
    );
  }

  const upcoming = appointments.filter((a) => a.status === "scheduled");
  const history = appointments.filter((a) => a.status !== "scheduled");
  const list = tab === "upcoming" ? upcoming : history;

  return (
    <div className="relative p-7 rounded-[2rem] border border-white/5 bg-zinc-950/80 backdrop-blur-2xl flex flex-col gap-6 shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)] overflow-hidden h-full">
      <div className="absolute inset-x-0 -top-40 h-80 bg-cyan-500/5 blur-[100px] pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" /> Appointments
        </h3>
        <button
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
          onClick={() => toast("📅 Calendar view coming soon!", { icon: "🗓️" })}
        >
          View Calendar <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="relative flex p-1.5 bg-zinc-900/80 rounded-xl border border-white/5 shadow-inner backdrop-blur-md z-10 w-full mb-2">
        {(["upcoming", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors z-10 rounded-lg ${
              tab === t ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === t && (
              <motion.div
                layoutId="activeTabIndicatorAppts"
                className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-20 flex items-center justify-center gap-2">
              {t} 
              <span className={`px-2 py-0.5 rounded-md text-[10px] shadow-inner ${tab === t ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}>
                {t === "upcoming" ? upcoming.length : history.length}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {list.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-sm text-zinc-500 text-center py-10 flex flex-col items-center gap-3"
            >
              <Calendar className="w-10 h-10 text-zinc-700" />
              {tab === "upcoming"
                ? "No upcoming appointments scheduled. Take a rest!"
                : "No past appointments found in your history."}
            </motion.div>
          ) : (
            list.map((appt, i) => {
              const date = new Date(appt.appointmentDate);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <motion.div
                  key={appt._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-5 rounded-2xl flex flex-col gap-4 transition-all group relative overflow-hidden ${
                    tab === "upcoming"
                      ? isToday
                        ? "bg-zinc-900/60 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                        : "bg-zinc-900/40 border border-white/5 hover:border-white/10"
                      : "bg-zinc-950/40 border border-white/5 opacity-80"
                  }`}
                >
                  {isToday && tab === "upcoming" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${isToday ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' : 'bg-zinc-800/80 border border-white/5 text-zinc-400'}`}>
                        {appt.consultationType === "online" ? <Video className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-100 text-base tracking-wide">
                          {appt.doctorName && appt.doctorName !== "Unknown Doctor"
                            ? appt.doctorName
                            : "Doctor"}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 font-medium bg-zinc-800/50 w-fit px-2 py-0.5 rounded-md border border-white/5">{appt.doctorSpecialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm tracking-wide ${isToday ? 'text-cyan-400' : 'text-zinc-200'}`}>
                        {isToday ? "Today" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-zinc-400 flex items-center justify-end gap-1.5 mt-1 font-medium bg-zinc-800/50 w-fit ml-auto px-2 py-0.5 rounded-md border border-white/5">
                        <Clock className="w-3 h-3 text-zinc-500" /> {appt.startTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center relative z-10 pt-2 border-t border-white/5">
                    <div className="flex gap-2 items-center">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md flex items-center gap-1 ${
                          appt.consultationType === "online"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        }`}
                      >
                        {appt.consultationType}
                      </span>
                      {tab === "history" && (
                        <span className={`flex items-center text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md ${STATUS_STYLES[appt.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                          {STATUS_ICONS[appt.status]} {appt.status.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    {tab === "upcoming" && (
                      <div className="flex gap-2">
                        {appt.paymentStatus === "pending" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toast("💳 Payment integration coming soon!", { icon: "💰" })}
                            className="text-xs px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors font-medium"
                          >
                            Pay Now
                          </motion.button>
                        )}
                        {appt.consultationType === "online" && isToday && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toast("📹 Video call integration coming soon!", { icon: "🎥" })}
                            className="text-xs px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
                          >
                            Join Call <Video className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
