import React, { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle2 } from "lucide-react";

export const DoctorPolishStep = () => {
  const { register, setValue, watch } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // In a real app, upload to AWS S3/Cloudinary and set URL. Here we set local preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setValue("profileImage", objectUrl); // Pretend it's the uploaded URL
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    maxFiles: 1 
  });

  return (
    <div className="w-full">
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">Profile <span className="text-blue-400 font-semibold">Polish.</span></h2>
      <p className="text-zinc-400 mb-10 text-lg">Finalize your public-facing holographic persona for the network.</p>
      
      <div className="space-y-8">
        
        {/* React Dropzone Avatar Uploader */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-blue-500/80 uppercase tracking-wider">Clinical Avatar</label>
          <div 
            {...getRootProps()} 
            className={`w-full max-w-sm aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-6 cursor-pointer transition-all ${
              isDragActive ? "border-blue-500 bg-blue-500/10 scale-105" : "border-white/20 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-white/40"
            } overflow-hidden relative`}
          >
            <input {...getInputProps()} />
            
            {preview ? (
              <>
                <img src={preview} alt="Avatar Preview" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                   <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Change Avatar</p>
                </div>
                <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </>
            ) : (
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-white font-medium">Drag & drop your portrait</p>
                <p className="text-zinc-500 text-sm mt-2">or click to browse local files</p>
              </div>
            )}
          </div>
        </div>

        {/* Bio Textarea */}
        <div className="space-y-2 pt-4">
          <label className="text-sm font-medium text-blue-500/80 uppercase tracking-wider">Professional Biometric Summary</label>
          <textarea 
            {...register("bio")} 
            rows={5}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-light text-lg resize-y"
            placeholder="Detail your clinical approach, research interests, and patient philosophy..."
          />
        </div>

      </div>
    </div>
  );
};
