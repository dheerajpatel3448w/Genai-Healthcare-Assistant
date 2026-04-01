"use client";

import React from "react";

interface DoctorCardProps {
  doctor: {
    _id: string;
    userId: { _id?: string; name: string; email: string };
    specialization: string;
    qualification: string;
    experience: number;
    consultationFee?: number;
    profileImage?: string;
    consultationType?: string[];
    rating?: number;
    totalPatients?: number;
  };
  onBook: (id: string) => void;
}

export const DoctorCard = ({ doctor, onBook }: DoctorCardProps) => {
  const { name } = doctor.userId || {};
  const imageSrc = doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Doctor")}&background=0D8ABC&color=fff&size=200`;
  
  // Use the DoctorProfile document _id or fallback to userId._id
  const docId = doctor._id || (doctor.userId && (doctor.userId as any)._id);

  return (
    <div className="flex flex-col bg-zinc-950/50 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group">
      
      {/* Top Half: Profile details */}
      <div className="p-6 pb-4 flex gap-4 items-start relative">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-800 relative bg-zinc-900 shadow-inner flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={name || "Doctor"}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          {/* Active indicator dot */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-950 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-zinc-100 truncate flex flex-wrap items-center gap-2">
            {name || "Dr. Unknown"}
            <span className="shrink-0 text-blue-400 bg-blue-500/10 p-0.5 rounded-md text-[10px] leading-none px-1.5 uppercase font-semibold">
              Verified
            </span>
          </h3>
          <p className="text-sm font-medium text-blue-400 line-clamp-1 truncate mt-0.5">
            {doctor.specialization}
          </p>
          <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
            {doctor.qualification} • {doctor.experience} Yrs Exp.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-6 py-3 flex items-center justify-between border-t border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 font-medium">Rating</span>
          <span className="text-sm text-zinc-200 font-semibold flex items-center gap-1">
            <span className="text-yellow-500 text-xs text-center leading-none">★</span> {doctor.rating ? doctor.rating.toFixed(1) : "New"}
          </span>
        </div>
        <div className="w-px h-6 bg-zinc-800"></div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 font-medium">Patients</span>
          <span className="text-sm text-zinc-200 font-semibold">
            {doctor.totalPatients && doctor.totalPatients > 0 ? `${doctor.totalPatients}+` : "N/A"}
          </span>
        </div>
        <div className="w-px h-6 bg-zinc-800"></div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 font-medium">Consult Fee</span>
          <span className="text-sm text-emerald-400 font-bold">
            {doctor.consultationFee ? `₹${doctor.consultationFee}` : "Free"}
          </span>
        </div>
      </div>

      {/* Modes & Tags */}
      <div className="px-6 py-4 flex flex-wrap gap-2">
        {doctor.consultationType?.map((type, idx) => (
          <span
            key={idx}
            className="text-[10px] font-medium tracking-wide border border-zinc-700 text-zinc-400 px-2 py-1 rounded-md capitalize bg-zinc-900"
          >
            {type === "online" ? "🌐 Online" : type === "clinic" ? "🏥 Clinic" : type}
          </span>
        ))}
        {(!doctor.consultationType || doctor.consultationType.length === 0) && (
          <span className="text-[10px] font-medium tracking-wide border border-zinc-700 text-zinc-500 px-2 py-1 rounded-md bg-zinc-900">
            Modes unavailable
          </span>
        )}
      </div>

      {/* Action / Book Button */}
      <div className="p-4 pt-1 mt-auto">
        <button
          onClick={() => onBook(docId)}
          className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/20 hover:border-transparent font-medium rounded-xl text-sm transition-all duration-300 transform active:scale-[0.98]"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};
