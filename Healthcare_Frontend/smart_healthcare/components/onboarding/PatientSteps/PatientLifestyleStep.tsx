import React from "react";
import { useFormContext } from "react-hook-form";

export const PatientLifestyleStep = () => {
  const { register } = useFormContext();

  return (
    <div className="w-full">
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">Behavioral <span className="text-emerald-400 font-semibold">Telemetry.</span></h2>
      <p className="text-zinc-400 mb-10 text-lg">Document routine lifestyle parameters to feed predictive health models.</p>
      
      <div className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Smoking Toggle */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/50 border border-white/10 shadow-sm">
            <div>
              <p className="text-white font-medium text-lg">Smoking History</p>
              <p className="text-zinc-400 text-sm">Do you consume tobacco products?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("lifestyle.smoking")} className="sr-only peer" />
              <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 border border-white/10"></div>
            </label>
          </div>

          {/* Alcohol Toggle */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/50 border border-white/10 shadow-sm">
            <div>
              <p className="text-white font-medium text-lg">Alcohol Consumption</p>
              <p className="text-zinc-400 text-sm">Do you consume alcohol regularly?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("lifestyle.alcohol")} className="sr-only peer" />
              <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 border border-white/10"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider">Exercise Frequency</label>
            <select 
              {...register("lifestyle.exerciseFrequency")} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-lg appearance-none"
            >
              <option value="" className="bg-zinc-900 text-zinc-500">Select Activity Level...</option>
              <option value="none" className="bg-zinc-900">None (Sedentary)</option>
              <option value="rare" className="bg-zinc-900">Rarely (1-2x month)</option>
              <option value="weekly" className="bg-zinc-900">Weekly (1-3x week)</option>
              <option value="daily" className="bg-zinc-900">Daily (4+ week)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider">Dietary Vector</label>
            <select 
              {...register("lifestyle.dietType")} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-lg appearance-none"
            >
              <option value="" className="bg-zinc-900 text-zinc-500">Select Diet Plan...</option>
              <option value="veg" className="bg-zinc-900">Vegetarian</option>
              <option value="non-veg" className="bg-zinc-900">Non-Vegetarian</option>
              <option value="vegan" className="bg-zinc-900">Vegan</option>
              <option value="mixed" className="bg-zinc-900">Mixed / Unrestricted</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-sm font-medium text-emerald-500/80 uppercase tracking-wider">Average Sleep (Hours)</label>
          <input 
            type="number" 
            {...register("lifestyle.sleepHours", { valueAsNumber: true })} 
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-light text-lg"
            placeholder="e.g. 7"
          />
        </div>

      </div>
    </div>
  );
};
