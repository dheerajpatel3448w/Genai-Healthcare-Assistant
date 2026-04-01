"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Lottie from "lottie-react";
import axios from "axios";
import Cookies from "js-cookie";
// Patient Steps
import { PatientBaselineStep } from "./PatientSteps/PatientBaselineStep";
import { PatientMedicalStep } from "./PatientSteps/PatientMedicalStep";
import { PatientLifestyleStep } from "./PatientSteps/PatientLifestyleStep";
import { PatientSafetyStep } from "./PatientSteps/PatientSafetyStep";

// Doctor Steps
import { DoctorCredentialsStep } from "./DoctorSteps/DoctorCredentialsStep";
import { DoctorPracticeStep } from "./DoctorSteps/DoctorPracticeStep";
import { DoctorAvailabilityStep } from "./DoctorSteps/DoctorAvailabilityStep";
import { DoctorPolishStep } from "./DoctorSteps/DoctorPolishStep";

const animationVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
  }),
  animate: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
  }),
};

export const OnboardingWizard = ({ role }: { role: "patient" | "doctor" }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize unified massive form without strict Zod resolver yet (we will implement it per-step if needed)
  const methods = useForm({
    mode: "onBlur",
    defaultValues: {}
  });

  const { handleSubmit } = methods;

  const patientSteps = [PatientBaselineStep, PatientMedicalStep, PatientLifestyleStep, PatientSafetyStep];
  const doctorSteps = [DoctorCredentialsStep, DoctorPracticeStep, DoctorAvailabilityStep, DoctorPolishStep];
  const activeSteps = role === "patient" ? patientSteps : doctorSteps;
  
  const CurrentStepComponent = activeSteps[step];

  const handleNext = async () => {
    // In the future: trigger validation for current step fields before allowing next
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, activeSteps.length - 1));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: any) => {
    if (step !== activeSteps.length - 1) {
      handleNext();
      return;
    }

    // Final Submission Payload
    setIsSubmitting(true);
    try {
      const endpoint = role === "patient" ? `${process.env.NEXT_PUBLIC_API_USER}/profile/create` : `${process.env.NEXT_PUBLIC_API_DOCTOR}/doctor/create`;
      const response = await axios.post(endpoint, data, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`
        }
      });
      

      if (!response.data.success) throw new Error("Failed to create profile");

      setIsSuccess(true);
      toast.success("Profile created perfectly. Welcome to NovaCure.");
      
      setTimeout(() => {
        window.location.href = role === "patient" ? "/dashboard/patient" : "/dashboard/doctor";
      }, 4000);

    } catch (err) {
      console.error(err);
      toast.error("An error occurred synchronizing your profile to the network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Maps Contextual Images for the Split Screen
  const ContextualImages = {
    patient: [
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2600&auto=format&fit=crop", // Abstract DNA/Tech
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=2940&auto=format&fit=crop", // Diagnostics/Scans
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2540&auto=format&fit=crop", // Lifestyle/Yoga
      "https://images.unsplash.com/photo-1516841273335-e39b37888115?q=80&w=2938&auto=format&fit=crop"  // Security/Shield Fix
    ],
    doctor: [
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=60", // Credentials
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2906&auto=format&fit=crop", // Hospital
      "https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=2668&auto=format&fit=crop", // Schedule
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=60" // Verified Polished
    ]
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Heavy Contextual Aesthetic Image (Floating Behind) */}
      <div className="absolute inset-x-0 top-0 h-full w-full opacity-10 blur-3xl saturate-200 pointer-events-none transition-all duration-1000 z-0">
        <AnimatePresence mode="wait">
           <motion.img
             key={step}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1 }}
             src={ContextualImages[role][step]}
             className="w-full h-full object-cover"
           />
        </AnimatePresence>
      </div>
      
      {/* Top Navbar Header */}
      <header className="relative z-20 w-full p-6 lg:px-12 flex justify-between items-center border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center">
             <span className="text-zinc-950 font-bold text-lg">N</span>
           </div>
           <h1 className="text-xl tracking-tight font-semibold text-white">NovaCure Configurator</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm font-medium text-cyan-400/80 uppercase tracking-widest hidden sm:block">Step {step + 1} of {activeSteps.length}</div>
          {/* Progress Bar */}
          <div className="w-48 md:w-64 h-2 bg-zinc-900 rounded-full overflow-hidden shadow-inner border border-white/5">
             <motion.div 
               className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 relative" 
               initial={{ width: 0 }}
               animate={{ width: `${((step + 1) / activeSteps.length) * 100}%` }}
               transition={{ duration: 0.6, ease: "circOut" }}
             >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
             </motion.div>
          </div>
        </div>
      </header>

      {/* Main 50/50 Layout */}
      <main className="flex-1 flex flex-col lg:flex-row relative z-10 w-full">
        
        {/* Left Side: Contextual Image Area */}
        <div className="hidden lg:flex lg:w-5/12 p-12 flex-col justify-end relative border-r border-white/5 bg-zinc-900/50 overflow-hidden">
          <AnimatePresence mode="wait">
             <motion.img
               key={step}
               initial={{ opacity: 0, scale: 1.05 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.8 }}
               src={ContextualImages[role][step]}
               className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 z-0"
             />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent z-10" />
          
          <div className="relative z-20">
            <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
              {role === "patient" ? "Architect Your Protocol" : "Verify Your Credentials"}
            </h2>
            <p className="text-zinc-400 mt-4 text-lg font-light leading-relaxed max-w-md">
              Complete your profile to unlock the full potential of the NovaCure clinical OS. Your data is encrypted and strictly secured.
            </p>
          </div>
        </div>
        
        {/* Right Side: The Form */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full p-6 lg:p-16 xl:p-24 overflow-y-auto">
          
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col min-h-[50vh] relative">
              
              <div className="relative flex-1">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={animationVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="w-full"
                  >
                    <CurrentStepComponent />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Navigation */}
              <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack} 
                  disabled={step === 0 || isSubmitting}
                  className="rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-800 disabled:opacity-50 h-12 px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-8 h-12 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {step === activeSteps.length - 1 ? "Initialize Profile" : "Continue"}
                  {!isSubmitting && step !== activeSteps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>

            </form>
          </FormProvider>

        </div>
      </main>

      {/* Full-Screen Success Overlay */}
      <AnimatePresence>
        {isSuccess && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
           >
              {/* Lottie or glowing visual here later */}
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.4)] flex items-center justify-center mb-8">
                 <div className="w-16 h-16 rounded-full bg-emerald-400 rotate-45 flex items-center justify-center">
                   <div className="w-6 h-3 border-b-4 border-l-4 border-zinc-950 -rotate-45 -mt-2" />
                 </div>
              </div>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-light text-white tracking-tighter"
              >
                Profile <span className="font-semibold text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">Synchronized.</span>
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-zinc-400 text-xl md:text-2xl font-light max-w-lg mx-auto"
              >
                Generating cryptographic keys and routing to your highly secure clinical dashboard...
              </motion.p>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
