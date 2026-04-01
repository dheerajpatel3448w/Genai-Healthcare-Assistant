"use client";

import React from "react";

export interface DoctorFiltersState {
  specialization: string;
  consultationType: string;
  minExperience: string;
}

interface DoctorFiltersProps {
  filters: DoctorFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<DoctorFiltersState>>;
}

const CONSULTATION_TYPES = [
  { value: "", label: "All Types" },
  { value: "online", label: "Online" },
  { value: "clinic", label: "In-Clinic" },
  { value: "hospital", label: "Hospital Visit" },
];

const EXPERIENCES = [
  { value: "", label: "Any Experience" },
  { value: "1", label: "1+ Years" },
  { value: "5", label: "5+ Years" },
  { value: "10", label: "10+ Years" },
  { value: "15", label: "15+ Years" },
];

export const DoctorFilters = ({ filters, setFilters }: DoctorFiltersProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center shadow-lg shadow-black/20">
      
      {/* Search Input */}
      <div className="flex-1 w-full relative">
        <label className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
          🔍
        </label>
        <input
          type="text"
          name="specialization"
          value={filters.specialization}
          onChange={handleChange}
          placeholder="Search name or specialty (e.g. Cardiologist)..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {/* Vertical Divider (Desktop) */}
      <div className="hidden md:block w-px h-10 bg-zinc-800 shrink-0"></div>

      {/* Filters Container */}
      <div className="flex w-full md:w-auto gap-4">
        
        {/* Consultation Type */}
        <div className="flex-1 md:w-48 relative">
          <select
            name="consultationType"
            value={filters.consultationType}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
          >
            {CONSULTATION_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom Select Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">
            ▼
          </div>
        </div>

        {/* Minimum Experience */}
        <div className="flex-1 md:w-48 relative">
          <select
            name="minExperience"
            value={filters.minExperience}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
          >
            {EXPERIENCES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom Select Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">
            ▼
          </div>
        </div>

      </div>

    </div>
  );
};
