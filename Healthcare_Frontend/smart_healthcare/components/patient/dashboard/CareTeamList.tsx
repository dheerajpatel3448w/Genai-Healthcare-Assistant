"use client";

import React from "react";
import { usePatientDashboard } from "../../../context/patient-dashboard.context";

export const CareTeamList = () => {
  const { careTeam, loading } = usePatientDashboard();

  if (loading) {
    return <div className="p-6 border rounded-xl bg-gray-50/5 animate-pulse">Loading Care Team...</div>;
  }

  return (
    <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col gap-4">
      <h3 className="text-lg font-medium text-white">My Care Team</h3>

      {careTeam.length === 0 ? (
        <div className="text-sm text-zinc-500 py-4 text-center">
          No doctors assigned yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {careTeam.map((doctor) => (
            <div key={doctor._id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium">
                  {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-medium text-zinc-200 text-sm">{doctor.name}</h4>
                  <p className="text-xs text-zinc-500">{doctor.specialty}</p>
                </div>
              </div>
              
              <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors">
                Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
