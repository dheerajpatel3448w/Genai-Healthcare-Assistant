"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const DOCTOR_API = process.env.NEXT_PUBLIC_API_DOCTOR;
const APPT_API = process.env.NEXT_PUBLIC_API_APPOINTMENT;
const api = axios.create({ withCredentials: true });

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  consultationFee?: number;
  consultationType?: string[];
}

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBooked?: () => void;
  initialDoctorId?: string;
}

const CONSULTATION_TYPES = ["online", "clinic", "hospital"] as const;

export const BookAppointmentModal = ({ isOpen, onClose, onBooked, initialDoctorId }: BookAppointmentModalProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctorId || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [consultationType, setConsultationType] = useState<"online" | "clinic" | "hospital">("online");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialDoctorId) {
      setSelectedDoctor(initialDoctorId);
    }
  }, [initialDoctorId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingDoctors(true);
    api
      .get(`${DOCTOR_API}/doctor/all`)
      .then((res) => {
        const list = res.data.doctors || res.data.data || [];
        setDoctors(
          list.map((d: any) => ({
            _id: d._id || d.userId?._id, // fallback depending on backend response graph
            name: d.userId?.name ?? "Dr. Unknown",
            specialization: d.specialization ?? "",
            consultationFee: d.consultationFee,
            consultationType: d.consultationType,
          }))
        );
      })
      .catch(() => setError("Could not load doctors. Please refresh."))
      .finally(() => setLoadingDoctors(false));
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) {
      setError("Please fill all required fields.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post(`${APPT_API}/api/v1/appointments/create`, {
        doctorId: selectedDoctor,
        appointmentDate: date,
        startTime: time,
        consultationType,
        reason,
      });
      setSuccess(true);
      setTimeout(() => {
        onBooked?.();
        onClose();
        setSuccess(false);
        setSelectedDoctor("");
        setDate("");
        setTime("");
        setReason("");
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-blue-400">📅</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Book Appointment</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center text-lg"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Doctor Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Doctor <span className="text-rose-400">*</span>
            </label>
            {loadingDoctors ? (
              <div className="h-10 bg-zinc-800 rounded-lg animate-pulse" />
            ) : (
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="">Select a doctor...</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.specialization}
                    {doc.consultationFee ? ` (₹${doc.consultationFee})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Time <span className="text-rose-400">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Consultation Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Consultation Type
            </label>
            <div className="flex gap-2">
              {CONSULTATION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setConsultationType(type)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                    consultationType === type
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {type === "online" ? "🌐" : type === "clinic" ? "🏥" : "🏨"} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Reason / Symptoms
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or reason for visit..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-center">
              ✅ Appointment booked successfully!
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg text-sm transition-all"
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
