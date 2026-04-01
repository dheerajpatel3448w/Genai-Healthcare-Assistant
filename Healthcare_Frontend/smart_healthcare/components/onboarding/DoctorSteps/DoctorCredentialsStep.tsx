import React from "react";
import { useFormContext } from "react-hook-form";
import { FileBadge2 } from "lucide-react";

export const DoctorCredentialsStep = () => {
  const { register } = useFormContext();

  return (
    <div className="w-full">
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">Professional <span className="text-cyan-400 font-semibold">Credentials.</span></h2>
      <p className="text-zinc-400 mb-10 text-lg">Verify your medical licensing and specialization parameters.</p>
      
      <div className="space-y-6">
        
        {/* Critical Licensing Block */}
        <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 relative shadow-[0_0_20px_rgba(6,182,212,0.1)]">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                 <FileBadge2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Government Medical License</h3>
                <p className="text-cyan-400/80 text-sm">Required for NovaCure network verification.</p>
              </div>
           </div>
           
           <input 
              type="text" 
              {...register("licenseNumber", { required: true })} 
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-lg uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
              placeholder="e.g. MED-XYZ-123456"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Primary Specialization</label>
            <input 
              type="text"
              list="specialty-options"
              {...register("specialization")} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg"
              placeholder="e.g. Cardiology, Neurosurgery..."
            />
            <datalist id="specialty-options">
              <option value="Cardiology" />
              <option value="Neurology" />
              <option value="Oncology" />
              <option value="Pediatrics" />
              <option value="General Practice" />
              <option value="Psychiatry" />
              <option value="Dermatology" />
              <option value="Endocrinology" />
              <option value="Gastroenterology" />
              <option value="Orthopedics" />
              <option value="Ophthalmology" />
              <option value="Urology" />
              <option value="Radiology" />
            </datalist>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Highest Qualification</label>
            <input 
              type="text" 
              {...register("qualification")} 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg tracking-wide"
              placeholder="e.g. MD, MBBS, DO"
            />
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">Clinical Experience (Years)</label>
          <input 
            type="number" 
            {...register("experience", { valueAsNumber: true })} 
            className="w-full md:w-1/2 bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-light text-lg"
            placeholder="15"
          />
        </div>

      </div>
    </div>
  );
};
