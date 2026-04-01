"use client";

import React from "react";
import { PersonalizedOverview } from "../../../components/patient/dashboard/PersonalizedOverview";
import { UpcomingAppointments } from "../../../components/patient/dashboard/UpcomingAppointments";
import { MedicalRecords } from "../../../components/patient/dashboard/MedicalRecords";
import { QuickHealthStats } from "../../../components/patient/dashboard/QuickHealthStats";
import { AppointmentReminderBanner } from "../../../components/patient/dashboard/AppointmentReminderBanner";
import { OnboardingEmptyState } from "../../../components/patient/dashboard/OnboardingEmptyState";

import { motion } from "framer-motion";

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25, mass: 0.8 } },
};

export default function PatientDashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 md:px-8 py-8 -mt-8 pt-12 text-zinc-100">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8 w-full max-w-[95rem] mx-auto relative z-10"
      >
        {/* Background Subtle Gradient */}
        <div className="absolute inset-x-0 -top-40 h-80 bg-cyan-500/10 blur-[120px] pointer-events-none z-0" />

        <motion.header variants={itemVariants} className="mb-2 relative z-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-white drop-shadow-md">
            Patient <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Dashboard</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-light tracking-wide mt-2">Your central health hub.</p>
        </motion.header>

      {/* Tomorrow reminder — only visible when patient has an appointment the next day */}
      <motion.div variants={itemVariants}>
        <AppointmentReminderBanner />
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Onboarding card — only visible to brand new patients (no appts, no reports) */}
        <OnboardingEmptyState />

        {/* Row 1: Overview (8) + Health Stats (4) */}
        <motion.div variants={itemVariants} className="md:col-span-8">
          <PersonalizedOverview />
        </motion.div>
        <motion.div variants={itemVariants} className="md:col-span-4">
          <QuickHealthStats />
        </motion.div>

        {/* Row 2: Appointments (Stack Full Width) */}
        <motion.div variants={itemVariants} className="md:col-span-12">
          <UpcomingAppointments />
        </motion.div>
        
        {/* Row 3: Medical Records (Stack Full Width) */}
        <motion.div variants={itemVariants} className="md:col-span-12">
          <MedicalRecords />
        </motion.div>

      </div>
      </motion.div>
    </div>
  );
}
