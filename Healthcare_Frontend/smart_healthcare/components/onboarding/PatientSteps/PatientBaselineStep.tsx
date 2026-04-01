import React from "react";
import { useFormContext } from "react-hook-form";

export const PatientBaselineStep = () => {
  const { register } = useFormContext();

  return (
    <div className="w-full">
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">Biological <span className="text-cyan-400 font-semibold">Baseline.</span></h2>
      <p className="text-zinc-400 mb-10 text-lg">Establish your foundational metrics for the neural diagnostic engine.</p>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Age</label>
            <input 
              type="number" 
              {...register("age", { valueAsNumber: true })} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-light text-lg"
              placeholder="e.g. 34"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Gender</label>
            <select 
              {...register("gender")} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg appearance-none"
            >
              <option value="" className="bg-zinc-900 text-zinc-500">Select Designation...</option>
              <option value="male" className="bg-zinc-900">Male</option>
              <option value="female" className="bg-zinc-900">Female</option>
              <option value="other" className="bg-zinc-900">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Height (cm)</label>
            <input 
              type="number" 
              {...register("height", { valueAsNumber: true })} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg"
              placeholder="175"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Weight (kg)</label>
            <input 
              type="number" 
              {...register("weight", { valueAsNumber: true })} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg"
              placeholder="70"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Blood Group</label>
            <select 
              {...register("bloodGroup")} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg appearance-none"
            >
              <option value="" className="bg-zinc-900 text-zinc-500">Select...</option>
              <option value="A+" className="bg-zinc-900">A+</option>
              <option value="A-" className="bg-zinc-900">A-</option>
              <option value="B+" className="bg-zinc-900">B+</option>
              <option value="B-" className="bg-zinc-900">B-</option>
              <option value="O+" className="bg-zinc-900">O+</option>
              <option value="O-" className="bg-zinc-900">O-</option>
              <option value="AB+" className="bg-zinc-900">AB+</option>
              <option value="AB-" className="bg-zinc-900">AB-</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Residential Coordinates</label>
          <input 
            type="text" 
            {...register("address")} 
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg"
            placeholder="123 Neural Avenue, Sector 4"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">City</label>
            <input 
              type="text" 
              {...register("city")} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg"
              placeholder="Metropolis"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">State / Region</label>
            <input 
              type="text" 
              {...register("state")} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg"
              placeholder="NY"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
