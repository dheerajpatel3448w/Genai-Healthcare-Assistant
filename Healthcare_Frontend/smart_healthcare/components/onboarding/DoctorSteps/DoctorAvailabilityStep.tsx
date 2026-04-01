import React, { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Required for raw styles, though we will override heavily
import { format } from "date-fns";
import { Plus, X } from "lucide-react";

export const DoctorAvailabilityStep = () => {
  const { register, control, setValue, watch } = useFormContext();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  
  // Use Field Array for Dynamic Education Array
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education"
  });

  // Handle DayPicker selection to inject into standard React Hook Form state
  const handleDaySelect = (days: Date[] | undefined) => {
    if (days) {
      setSelectedDays(days);
      const isoDays = days.map(d => format(d, 'yyyy-MM-dd'));
      setValue("availability.days", isoDays);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">Scheduling & <span className="text-purple-400 font-semibold">Education.</span></h2>
      <p className="text-zinc-400 mb-8 text-lg">Define your global availability matrices and academic background.</p>
      
      <div className="space-y-10">
        
        {/* Calendar Interaction Block */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-medium text-white mb-4 w-full text-left">Select Operational Days</h3>
              
              {/* react-day-picker highly customized to fit the dark aesthetic */}
              <style dangerouslySetInnerHTML={{__html: `
                .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #a855f7; --rdp-background-color: #3f3f46; margin: 0; }
                .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: var(--rdp-accent-color); color: #fff; font-weight: bold; }
                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: var(--rdp-background-color); }
                .rdp-day { border-radius: 8px; font-weight: 300; }
              `}} />
              
              <div className="bg-zinc-950 p-4 rounded-xl border border-white/5">
                <DayPicker
                  mode="multiple"
                  selected={selectedDays}
                  onSelect={handleDaySelect}
                  className="text-white"
                />
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-2">Daily Time Constraints</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-500/80 uppercase tracking-wider">Start Time</label>
                <input 
                  type="time" 
                  {...register("availability.startTime")} 
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-light text-lg [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-500/80 uppercase tracking-wider">End Time</label>
                <input 
                  type="time" 
                  {...register("availability.endTime")} 
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-light text-lg [color-scheme:dark]"
                />
              </div>
           </div>
        </div>

        {/* Dynamic Education Array */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Academic History</h3>
            <button 
              type="button"
              onClick={() => append({ degree: "", institution: "", year: new Date().getFullYear() })}
              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Degree
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl bg-zinc-900/30 border border-white/5 relative items-start">
                <div className="md:col-span-5 space-y-2">
                   <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Degree</label>
                   <input 
                    {...register(`education.${index}.degree`)} 
                    placeholder="e.g. Doctor of Medicine (MD)"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                   <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Institution</label>
                   <input 
                    {...register(`education.${index}.institution`)} 
                    placeholder="e.g. Harvard Med"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Year</label>
                   <input 
                    type="number"
                    {...register(`education.${index}.year`, { valueAsNumber: true })} 
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="md:col-span-1 pt-6 flex justify-end">
                   <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="text-center p-8 rounded-xl border border-dashed border-white/10 text-zinc-500">
                No academic history added. Click "Add Degree" to append.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
