import React from "react";
import { useFormContext } from "react-hook-form";
import { Building2 } from "lucide-react";

export const DoctorPracticeStep = () => {
  const { register } = useFormContext();

  return (
    <div className="w-full">
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">Clinical <span className="text-emerald-400 font-semibold">Practice.</span></h2>
      <p className="text-zinc-400 mb-10 text-lg">Define your physical operations and digital consultation metrics.</p>
      
      <div className="space-y-8">
        
        {/* Practice Location */}
        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-semibold text-white">Primary Operating Location</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider">Hospital / Clinic Name</label>
              <input 
                type="text" 
                {...register("hospitalName")} 
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-lg"
                placeholder="Mount Sinai Medical Center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider">Street Address</label>
              <input 
                type="text" 
                {...register("clinicAddress")} 
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-lg"
                placeholder="100 Neural Ave, Sector 8"
              />
            </div>
          </div>
        </div>

        {/* Consultation Logistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
           
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider">Base Consultation Fee (USD)</label>
                <div className="relative">
                  <span className="absolute left-5 top-4 text-zinc-400 text-lg">$</span>
                  <input 
                    type="number" 
                    {...register("consultationFee", { valueAsNumber: true })} 
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-lg"
                    placeholder="150"
                  />
                </div>
              </div>

              <div className="space-y-2 shadow-sm rounded-xl border border-white/5 p-4 bg-zinc-900/20">
                <label className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider mb-4 block">Consultation Modes</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" value="online" {...register("consultationType")} className="w-5 h-5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-900" />
                    <span className="text-white group-hover:text-emerald-400 transition-colors">Telemedicine (Online)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" value="clinic" {...register("consultationType")} className="w-5 h-5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-900" />
                    <span className="text-white group-hover:text-emerald-400 transition-colors">Private Clinic Visit</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" value="hospital" {...register("consultationType")} className="w-5 h-5 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-900" />
                    <span className="text-white group-hover:text-emerald-400 transition-colors">Hospital Admission</span>
                  </label>
                </div>
              </div>
           </div>
           
           <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider">Default Duration (Minutes)</label>
              <select 
                  {...register("slotDuration", { valueAsNumber: true })} 
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-lg appearance-none"
                >
                  <option value={15} className="bg-zinc-900">15 Minutes (Express)</option>
                  <option value={30} className="bg-zinc-900">30 Minutes (Standard)</option>
                  <option value={45} className="bg-zinc-900">45 Minutes (Extended)</option>
                  <option value={60} className="bg-zinc-900">60 Minutes (Comprehensive)</option>
              </select>
           </div>
        </div>

      </div>
    </div>
  );
};
