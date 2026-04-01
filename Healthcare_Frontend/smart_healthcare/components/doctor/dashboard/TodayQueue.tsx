"use client";

import React, { useState } from "react";
import { useDoctorDashboard } from "@/context/doctor-dashboard.context";
import { IDoctorAppointment } from "@/types/doctor.types";

export const TodayQueue = () => {
  const { appointments, updateAppointment } = useDoctorDashboard();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingOrConfirmed = appointments
    .filter(a => a.status === "pending" || a.status === "confirmed")
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const handleAction = async (id: string, status: string) => {
    setProcessingId(id);
    await updateAppointment(id, status);
    setProcessingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider">Pending</span>;
      case "confirmed":
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider">Confirmed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl flex flex-col hover:border-zinc-700 transition-colors shadow-inner overflow-hidden h-[500px]">
      
      {/* Header */}
      <div className="p-6 border-b border-zinc-800/60 flex items-center justify-between">
        <h3 className="text-zinc-100 font-semibold flex items-center gap-3 text-lg">
          <span className="text-blue-500 bg-blue-500/10 w-8 h-8 rounded-full flex items-center justify-center">📅</span> 
          Active Queue
        </h3>
        <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded-full font-medium tracking-wide shadow-inner">
          {pendingOrConfirmed.length} Active
        </span>
      </div>

      {/* List container */}
      <div className="flex-1 overflow-y-auto w-full p-6 no-scrollbar">
        {pendingOrConfirmed.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800/60">
            <span className="text-4xl mb-4">☕</span>
            <p className="text-zinc-400 font-medium text-sm">Your queue is clear.</p>
            <p className="text-zinc-600 text-xs mt-1">Take a break while new appointments come in.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {pendingOrConfirmed.map((appt) => (
              <div
                key={appt._id}
                className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 transition-all w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                
                {/* Info Block */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="text-zinc-100 font-bold truncate">
                      {appt.patientName}
                    </h4>
                    {getStatusBadge(appt.status)}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                    <span className="text-zinc-400">📅 {appt.date}</span>
                    <span>•</span>
                    <span className="text-zinc-400">⏰ {appt.time}</span>
                    <span>•</span>
                    <span className="capitalize text-zinc-400 tracking-wide font-semibold text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">
                      {appt.consultationType}
                    </span>
                  </div>
                  {appt.reason && (
                    <p className="text-zinc-500 text-xs mt-1 truncate">
                      <span className="font-semibold text-zinc-600 uppercase tracking-widest text-[9px] mr-1">Rsn:</span>
                      {appt.reason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {appt.status === "pending" ? (
                    <>
                      <button 
                        onClick={() => handleAction(appt._id, "confirmed")}
                        disabled={processingId === appt._id}
                        className="px-4 py-2 font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg text-xs transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleAction(appt._id, "cancelled")}
                        disabled={processingId === appt._id}
                        className="px-4 py-2 font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-lg text-xs transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        title="Completed"
                        onClick={() => handleAction(appt._id, "completed")}
                        disabled={processingId === appt._id}
                        className="px-4 py-2 font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 rounded-lg text-xs transition-all"
                      >
                        Done
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
