import React from "react";
import { useFormContext } from "react-hook-form";

export const PatientSafetyStep = () => {
  const { register } = useFormContext();

  return (
    <div className="w-full">
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">Safety <span className="text-blue-400 font-semibold">Net.</span></h2>
      <p className="text-zinc-400 mb-10 text-lg">Define your emergency protocols and insurance providers.</p>
      
      <div className="space-y-10">
        
        {/* Emergency Contact Block */}
        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
          <h3 className="text-xl font-semibold text-white mb-6">Emergency Contact Proxy</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-500/80 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                {...register("emergencyContact.name")} 
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-light text-lg"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-500/80 uppercase tracking-wider">Relation</label>
              <input 
                type="text" 
                {...register("emergencyContact.relation")} 
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-light text-lg"
                placeholder="Spouse, Sibling, etc."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-500/80 uppercase tracking-wider">Direct Phone</label>
              <input 
                type="tel" 
                {...register("emergencyContact.phone")} 
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-light text-lg"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-500/80 uppercase tracking-wider">Email Route</label>
              <input 
                type="email" 
                {...register("emergencyContact.email")} 
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-light text-lg"
                placeholder="contact@network.com"
              />
            </div>
          </div>
        </div>

        {/* Insurance Block */}
        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50" />
          <h3 className="text-xl font-semibold text-white mb-6">Insurance Authorization</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-500/80 uppercase tracking-wider">Provider Network</label>
              <input 
                type="text" 
                {...register("insurance.provider")} 
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-light text-lg"
                placeholder="e.g. BlueCross, Aetna"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-500/80 uppercase tracking-wider">Policy Hash / Number</label>
              <input 
                type="text" 
                {...register("insurance.policyNumber")} 
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-light text-lg"
                placeholder="XYZ-123456789"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
