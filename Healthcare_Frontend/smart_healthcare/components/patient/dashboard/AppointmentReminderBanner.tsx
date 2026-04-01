"use client";

import React, { useState, useMemo } from "react";
import { usePatientDashboard } from "../../../context/patient-dashboard.context";

export const AppointmentReminderBanner = () => {
  const { appointments, loading } = usePatientDashboard();
  const [dismissed, setDismissed] = useState(false);

  const tomorrowAppointments = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();
    return appointments.filter(
      (appt) =>
        appt.status === "scheduled" &&
        new Date(appt.appointmentDate).toDateString() === tomorrowStr
    );
  }, [appointments]);

  if (loading || dismissed || tomorrowAppointments.length === 0) return null;

  const first = tomorrowAppointments[0];
  const doctorLabel = first.doctorName && first.doctorName !== "Unknown Doctor"
    ? `with ${first.doctorName}`
    : first.doctorSpecialty
    ? `with your ${first.doctorSpecialty} doctor`
    : "";
  const count = tomorrowAppointments.length;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/5 mb-4 animate-in fade-in slide-in-from-top-2 duration-400">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-400 text-base">🔔</span>
        </div>
        <div>
          <p className="text-sm font-medium text-amber-200">
            {count === 1
              ? `Reminder: Appointment tomorrow ${doctorLabel}`
              : `Reminder: ${count} appointments scheduled for tomorrow`}
          </p>
          {count === 1 && (
            <p className="text-xs text-amber-400/80 mt-0.5">
              {first.startTime} · {first.consultationType}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center text-base"
        aria-label="Dismiss reminder"
      >
        ×
      </button>
    </div>
  );
};
