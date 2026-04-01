import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";

// Helper component for multi-select tags
const TagsInput = ({ name, placeholder, label }: { name: string, placeholder: string, label: string }) => {
  const { register, setValue, watch } = useFormContext();
  const [inputValue, setInputValue] = useState("");
  const tags: string[] = watch(name) || [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const val = inputValue.trim();
    if (val && !tags.includes(val)) {
      setValue(name, [...tags, val]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setValue(name, tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-cyan-500/80 uppercase tracking-wider">{label}</label>
      <div className="w-full min-h-[60px] bg-zinc-900/50 border border-white/10 rounded-xl p-2 flex flex-wrap gap-2 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-2 bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-white/5 shadow-sm">
            {tag}
            <button type="button" onClick={() => removeTag(index)} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          className="flex-1 min-w-[120px] bg-transparent text-white px-2 py-1.5 focus:outline-none font-light placeholder:text-zinc-600"
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>
      {/* Hidden input to register with react-hook-form */}
      <input type="hidden" {...register(name)} />
    </div>
  );
};

export const PatientMedicalStep = () => {
  return (
    <div className="w-full">
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">Medical <span className="text-cyan-400 font-semibold">History.</span></h2>
      <p className="text-zinc-400 mb-10 text-lg">Input any pre-existing conditions or parameters for the diagnostic core.</p>
      
      <div className="space-y-8">
        <TagsInput 
          name="allergies" 
          label="Known Allergies" 
          placeholder="e.g. Penicillin, Peanuts (Press Enter)" 
        />
        
        <TagsInput 
          name="chronicDiseases" 
          label="Chronic Pathologies" 
          placeholder="e.g. Asthma, Hypertension (Press Enter)" 
        />
        
        <TagsInput 
          name="currentMedications" 
          label="Active Prescriptions" 
          placeholder="e.g. Lisinopril 10mg (Press Enter)" 
        />
        
        <TagsInput 
          name="pastSurgeries" 
          label="Surgical History" 
          placeholder="e.g. Appendectomy 2015 (Press Enter)" 
        />
        
        <TagsInput 
          name="familyHistory" 
          label="Genetic Dispositions" 
          placeholder="e.g. Type 2 Diabetes (Press Enter)" 
        />
      </div>
    </div>
  );
};
