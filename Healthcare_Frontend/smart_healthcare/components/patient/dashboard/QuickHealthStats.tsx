"use client";

import React from "react";
import { usePatientDashboard } from "../../../context/patient-dashboard.context";
import Tilt from "react-parallax-tilt";
import { 
  User, CalendarDays, Ruler, Scale, Activity, 
  Droplet, AlertTriangle, HeartPulse, PhoneCall, Target 
} from "lucide-react";

const GENDER_ICON: Record<string, string> = {
  male: "♂",
  female: "♀",
  other: "⚧",
};

export const QuickHealthStats = () => {
  const { profile, loading } = usePatientDashboard();

  if (loading) {
    return (
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col gap-4 h-full animate-pulse">
        <div className="h-4 w-32 bg-zinc-800 rounded" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-zinc-800/60 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col items-center justify-center gap-3 h-full text-center">
        <User className="w-10 h-10 text-zinc-500" />
        <p className="text-sm text-zinc-500">No profile found.</p>
        <p className="text-xs text-zinc-600">Complete your profile to see health stats.</p>
      </div>
    );
  }

  const bmi =
    profile.height && profile.weight
      ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : null;

  const bmiCategory = bmi
    ? Number(bmi) < 18.5
      ? { label: "Underweight", color: "text-blue-400" }
      : Number(bmi) < 25
      ? { label: "Normal", color: "text-green-400" }
      : Number(bmi) < 30
      ? { label: "Overweight", color: "text-amber-400" }
      : { label: "Obese", color: "text-red-400" }
    : null;

  return (
    <div className="relative p-7 rounded-[2rem] border border-white/5 bg-zinc-950/80 backdrop-blur-2xl flex flex-col gap-4 h-full shadow-[0_20px_40px_-15px_rgba(6,182,212,0.15)]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-[2rem]" />
      
      <h3 className="text-lg font-medium text-white flex items-center gap-2 relative z-10">
        <Activity className="w-5 h-5 text-cyan-400" />
        Health Profile
      </h3>

      <div className="flex flex-col gap-3 relative z-10">
        {/* Basic Info Row */}
        <div className="grid grid-cols-2 gap-2">
          {profile.age && (
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1} className="w-full">
              <div className="flex flex-col p-3 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-inner">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  <CalendarDays className="w-3 h-3" /> Age
                </span>
                <span className="text-sm font-semibold text-zinc-100">{profile.age} yrs</span>
              </div>
            </Tilt>
          )}
          {profile.gender && (
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1} className="w-full">
              <div className="flex flex-col p-3 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-inner">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  <User className="w-3 h-3" /> Gender
                </span>
                <span className="text-sm font-semibold text-zinc-100 capitalize">
                  {GENDER_ICON[profile.gender]} {profile.gender}
                </span>
              </div>
            </Tilt>
          )}
          {profile.height && (
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1} className="w-full">
              <div className="flex flex-col p-3 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-inner">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  <Ruler className="w-3 h-3" /> Height
                </span>
                <span className="text-sm font-semibold text-zinc-100">{profile.height} cm</span>
              </div>
            </Tilt>
          )}
          {profile.weight && (
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1} className="w-full">
              <div className="flex flex-col p-3 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-inner">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  <Scale className="w-3 h-3" /> Weight
                </span>
                <span className="text-sm font-semibold text-zinc-100">{profile.weight} kg</span>
              </div>
            </Tilt>
          )}
        </div>

        {/* BMI */}
        {bmi && bmiCategory && (
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.05}>
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-white/5 shadow-sm group hover:border-cyan-500/30 transition-colors">
              <div>
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                  <Activity className="w-3.5 h-3.5" /> Body Mass Index
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                   <p className="text-xl font-bold text-zinc-100">{bmi}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800/80 shadow-inner ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
            </div>
          </Tilt>
        )}

        {/* Blood Group */}
        {profile.bloodGroup && (
          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
            <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-rose-400 font-semibold">
                <Droplet className="w-4 h-4" fill="currentColor" /> Blood Group
              </p>
              <span className="text-xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(244,63,94,0.8)] leading-none">{profile.bloodGroup}</span>
            </div>
          </Tilt>
        )}

        {/* Allergies */}
        {profile.allergies && profile.allergies.length > 0 && (
          <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-500/80 font-semibold">
              <AlertTriangle className="w-3 h-3" /> Allergies
            </p>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {profile.allergies.slice(0, 4).map((a, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                  {a}
                </span>
              ))}
              {profile.allergies.length > 4 && (
                <span className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-md shadow-inner">
                  +{profile.allergies.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chronic Conditions */}
        {profile.chronicDiseases && profile.chronicDiseases.length > 0 && (
          <div className="flex flex-col gap-2 p-3.5 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-purple-400/80 font-semibold">
              <HeartPulse className="w-3 h-3" /> Chronic Conditions
            </p>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {profile.chronicDiseases.map((d, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {profile.emergencyContact?.name && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 rounded-lg">
                <PhoneCall className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-red-400/80 font-bold">Emergency Contact</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">{profile.emergencyContact.name}</p>
              </div>
            </div>
            {profile.emergencyContact.phone && (
              <a
                href={`tel:${profile.emergencyContact.phone}`}
                className="text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg transition-colors font-bold shadow-[0_0_10px_rgba(239,68,68,0.4)]"
              >
                Call
              </a>
            )}
          </div>
        )}

      </div>
      
      {/* Link to Wellness Tracker */}
      <div className="mt-auto pt-4 relative z-10">
        <a 
          href="/dashboard/wellness" 
          className="group flex items-center justify-center w-full p-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all font-semibold text-sm gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        >
          <Target className="w-4 h-4 group-hover:scale-110 transition-transform" /> Open Wellness Tracker
        </a>
      </div>

    </div>
  );
};
