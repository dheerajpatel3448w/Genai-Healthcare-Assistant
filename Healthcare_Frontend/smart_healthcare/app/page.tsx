"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import Link from "next/link";
import { BentoCard } from "@/components/ui/BentoCard";
import { PlatformVisualizer } from "@/components/ui/PlatformVisualizer";
import { ShieldAlert, Activity, Cpu, Network, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/user.context";
import { useDoctorData } from "@/context/docter.context";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const containerRef = useRef(null);
  
  const { isAuth } = useAppData();
  const { isAuth2 } = useDoctorData();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(isAuth || isAuth2 || !!Cookies.get("token"));
  }, [isAuth, isAuth2]);

  const dashboardRoute = isAuth ? "/dashboard/patient" : "/dashboard/doctor";
  const ctaRoute = mounted && isAuthenticated ? dashboardRoute : "/register";
  const ctaText = mounted && isAuthenticated ? "Access Portal" : "Initialize Profile";
  
  // Physics for Event Horizon Hero
  const { scrollYProgress: heroProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  
  const heroOpacity = useTransform(heroProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 0.2], [1, 0.8]);
  const heroY = useTransform(heroProgress, [0, 0.2], [0, -100]);

  // Physics for Platform Reveal
  const revealRef = useRef(null);
  const { scrollYProgress: revealProgress } = useScroll({
    target: revealRef,
    offset: ["start end", "center center"],
  });
  
  const rotateX = useTransform(revealProgress, [0, 1], [45, 0]);
  const scale = useTransform(revealProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(revealProgress, [0, 0.5], [0.3, 1]);
  const glareX = useTransform(revealProgress, [0, 1], ["-100%", "100%"]);

  return (
    <div ref={containerRef} className="bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden pt-20 pb-40">
      
      {/* 1. The Event Horizon Hero */}
      <div className="relative h-[110vh] flex items-center justify-center -mt-24">
        {/* Background Cinematic Imagery */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none -z-10">
          <motion.img 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.15 }}
            transition={{ duration: 40, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=2938&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-10"
            alt="Abstract medical geometry"
            style={{ willChange: 'transform' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-950" />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY, willChange: 'transform, opacity' }}
          className="relative z-30 pointer-events-auto text-center px-4 max-w-6xl mx-auto flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-sm font-semibold mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              Welcome to NovaCure
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-light tracking-tighter text-white drop-shadow-2xl">
              Smarter Healthcare.<br/>
              <span className="font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Better </span>
              Outcomes.
            </h1>
            
            <p className="mt-8 text-xl md:text-2xl text-zinc-400 font-light max-w-3xl mx-auto tracking-wide">
              Connecting patients and healthcare professionals through an intelligent, secure, and easy-to-use platform.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link href={ctaRoute}>
                <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-full text-lg font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105">
                  {ctaText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Button variant="outline" className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-zinc-900 text-lg transition-all hover:border-white/40">
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* 2. Apple-Grade Platform Reveal */}
      <div className="relative py-24 z-20 -mt-32 md:-mt-64 bg-transparent perspective-[2500px]">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8" ref={revealRef}>
          <motion.div 
            style={{ rotateX, scale, opacity, willChange: 'transform, opacity' }}
            className="w-full aspect-[16/9] rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_20px_100px_-20px_rgba(6,182,212,0.15)] bg-zinc-950 relative isolate transform-gpu"
          >
            <div className="absolute inset-0">
               <PlatformVisualizer />
            </div>
            {/* The Glare Effect moving across the glass */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent z-10 pointer-events-none"
              style={{ x: glareX }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent z-10" />
            <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 z-20 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div>
                <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">Your Health Portal</h3>
                <p className="text-cyan-400 font-medium text-lg md:text-xl mt-1">Real-time patient updates and seamless appointment management.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Infinite Hardware-Accelerated Marquee */}
      <div className="py-24 bg-zinc-950/50 border-y border-white/5 relative z-20 overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_50%)]" />
        <div className="mb-14 text-center">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase">Trusted by our Global Medical Network</h2>
        </div>
        
        <Marquee gradient={true} gradientColor="rgba(9, 9, 11, 1)" gradientWidth={200} speed={45} className="py-4" pauseOnHover>
          {[
            { name: "Dr. Sarah Chen", spec: "Neurology", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=60" },
            { name: "Dr. Marcus Vance", spec: "Cardiology", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop&q=60" },
            { name: "Dr. Elena Rostova", spec: "Oncology", img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&auto=format&fit=crop&q=60" },
            { name: "Dr. James Wilson", spec: "Pediatrics", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=60" },
            { name: "Global Diagnostics", spec: "Research Partner", img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=60" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 mx-4 md:mx-6 rounded-full bg-zinc-900 border border-white/5 cursor-pointer hover:bg-zinc-800 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all">
              <img src={item.img} alt={item.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-lg" />
              <div>
                <p className="text-white font-medium text-sm md:text-base leading-tight">{item.name}</p>
                <p className="text-cyan-400 text-xs md:text-sm font-medium opacity-80">{item.spec}</p>
              </div>
            </div>
          ))}
        </Marquee>
      </div>

      {/* 3. The 3D Cursor Spotlight Bento Grid */}
      <div className="py-32 relative z-20 max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-white">
              Features Designed <br/>for <span className="text-cyan-400 font-semibold drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">You.</span>
            </h2>
            <p className="text-zinc-400 mt-6 text-xl md:text-2xl max-w-2xl font-light leading-relaxed">
              Everything you need to manage your health securely, book appointments, and consult with specialists in one place.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {/* Bento Card 1: Large Span */}
          <div className="md:col-span-2">
            <BentoCard imageSrc="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=2940&auto=format&fit=crop">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <Cpu className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-3xl font-semibold text-white tracking-tight">AI Health Assistant</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed text-lg lg:text-xl max-w-lg font-light">
                Our smart diagnostic assistant helps you identify early symptoms and guides you seamlessly to the right specialist.
              </p>
            </BentoCard>
          </div>

          {/* Bento Card 2: Tall */}
          <div className="auto-rows-fr">
             <BentoCard>
              <div className="flex flex-col h-full">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 w-max mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Activity className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-semibold text-white tracking-tight mb-2">Real-Time Updates</h3>
                <p className="text-zinc-400 leading-relaxed text-lg font-light">
                  Instantly track your appointment status and access your medical records securely from anywhere.
                </p>
                
                {/* Embedded Animated Visual Graphic */}
                <div className="flex-1 mt-10 relative rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden min-h-[160px]">
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-emerald-500/10 to-transparent mix-blend-screen" />
                  <svg className="absolute w-[150%] h-full bottom-0 -left-1/4" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path 
                      d="M0 80 Q10 50 20 80 T40 60 T60 85 T80 40 T100 70" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: false, margin: "-100px" }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                    <motion.path 
                      d="M0 60 Q15 40 30 70 T55 50 T80 80 T100 45" 
                      fill="none" 
                      stroke="#34d399" 
                      strokeWidth="1"
                      opacity="0.5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: false, margin: "-100px" }}
                      transition={{ duration: 3, ease: "easeInOut", delay: 0.2 }}
                    />
                  </svg>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Bento Card 3 */}
          <div>
            <BentoCard>
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 w-max mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <Network className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-3xl font-semibold text-white tracking-tight mb-3">Connected Network</h3>
              <p className="text-zinc-400 leading-relaxed text-lg font-light">
                Easily find and book consultations with top-rated doctors and verified specialists in our trusted medical network.
              </p>
            </BentoCard>
          </div>

          {/* Bento Card 4: Span 2 */}
          <div className="md:col-span-2 xl:col-span-2">
            <BentoCard imageSrc="https://plus.unsplash.com/premium_photo-1681400678259-255b10890b08?q=80&w=2938&auto=format&fit=crop">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <ShieldAlert className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-semibold text-white tracking-tight">Industry-Leading Security</h3>
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-lg max-w-xl font-light">
                    Your medical data is protected with enterprise-grade encryption, ensuring your total privacy and HIPAA compliance from end to end.
                  </p>
                </div>
                <div className="flex-shrink-0 mt-4 sm:mt-0">
                   <Button variant="outline" className="rounded-full border-zinc-700 text-white hover:bg-zinc-800 h-12 px-6">
                     Read Security Brief <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

    </div>
  );
}
