"use client"

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, ArrowRight, User, Phone, Stethoscope, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useAppData } from "@/context/user.context";
import { useDoctorData } from "@/context/docter.context";
import axios from "axios";
import { ThreeVisualizer } from "@/components/ui/ThreeVisualizer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegistrationPage() {
  const router = useRouter();
  const { setBtnLoading, btnLoading, setIsAuth, setUser } = useAppData();
  const { setDoctor, setBtnLoading2, btnLoading2, setIsAuth2 } = useDoctorData();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "patient" as "patient" | "doctor"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setRole = (role: "patient" | "doctor") => {
    setFormData({ ...formData, role });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    setBtnLoading(true);
    setBtnLoading2(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_AUTH}/auth/register`, formData);
      if (res.data.success) {
        toast.success(res.data.message);
        Cookies.set("token", res.data.token);
        router.push(`/onboarding?role=${formData.role}`);
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setBtnLoading(false);
      setBtnLoading2(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-zinc-950 text-zinc-100 font-sans">
      {/* LEFT: 3D Visualizer Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-black flex-col justify-end p-12 overflow-hidden border-r border-zinc-900">
        <div className="absolute inset-0 z-0">
          <ThreeVisualizer />
        </div>
        <div className="relative z-10 select-none pointer-events-none">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-500/10 backdrop-blur border border-cyan-500/30 rounded-xl flex items-center justify-center">
                <Activity className="text-cyan-400 w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">NovaCure</h1>
            </div>
            <h2 className="text-4xl font-light text-zinc-100 mb-2 drop-shadow-lg shadow-black">Join NovaCure today.</h2>
            <p className="text-zinc-300 text-lg max-w-md drop-shadow">Create your account to start managing your healthcare journey or connect with verified patients.</p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Registration Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#09090B] relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.03),transparent_50%)] pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm relative z-10 py-12">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-cyan-500/10 backdrop-blur border border-cyan-500/30 rounded-xl flex items-center justify-center">
              <Activity className="text-cyan-400 w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">NovaCure</h1>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Create Identity</h2>
              <p className="text-sm text-zinc-400 mt-2">Establish your secure NovaCure profile to begin</p>
            </div>

            {/* Role Selection Toggle */}
            <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/80 mb-6 relative shadow-inner">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all z-10 ${
                  formData.role === "patient" ? "text-white bg-zinc-800 shadow shadow-black/50" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <UserCircle className="w-4 h-4" /> Patient
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all z-10 ${
                  formData.role === "doctor" ? "text-white bg-zinc-800 shadow shadow-black/50" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Stethoscope className="w-4 h-4" /> Doctor
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500 z-10" />
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-zinc-600 text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500 z-10" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-zinc-600 text-sm"
                    placeholder="doctor@novacure.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500 z-10" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-zinc-600 text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500 z-10" />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-zinc-600 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={btnLoading || btnLoading2}
                className="w-full group relative flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 py-2 rounded-md text-sm font-semibold transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 mt-6 h-10"
              >
                {btnLoading || btnLoading2 ? (
                  <div className="h-4 w-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Profile
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-6 pt-4 border-t border-zinc-800/50">
              Already a member? <a href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign in</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}