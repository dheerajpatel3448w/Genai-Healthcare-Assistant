"use client";

import React, { useState } from "react";
import { usePatientDashboard } from "../../../context/patient-dashboard.context";
import toast from "react-hot-toast";

export const ActiveMedications = () => {
  const { profile, requestRefill, loading } = usePatientDashboard();
  const [refilling, setRefilling] = useState<string | null>(null);
  const [refilled, setRefilled] = useState<Set<string>>(new Set());

  if (loading || !profile) {
    return <div className="p-6 border rounded-xl bg-gray-50/5 animate-pulse">Loading Medications...</div>;
  }

  const { currentMedications } = profile;

  const handleRefill = async (med: string) => {
    setRefilling(med);
    const success = await requestRefill(med);
    setRefilling(null);
    if (success) {
      setRefilled((prev) => new Set([...prev, med]));
      toast.success(`Refill request sent to your doctor for ${med}`, {
        icon: "💊",
        duration: 4000,
      });
    } else {
      toast.error("Refill request failed. Please try again.");
    }
  };

  return (
    <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col gap-4">
      <h3 className="text-lg font-medium text-white">Active Medications</h3>

      {!currentMedications || currentMedications.length === 0 ? (
        <div className="text-sm text-zinc-500 py-4 text-center">
          No active prescriptions.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {currentMedications.map((med, index) => {
            const isDone = refilled.has(med);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    💊
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-200 text-sm">{med}</h4>
                    <p className="text-xs text-zinc-500">Take as prescribed</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRefill(med)}
                  disabled={refilling === med || isDone}
                  className={`px-3 py-1.5 border rounded text-xs transition-all ${
                    isDone
                      ? "border-green-600/40 bg-green-500/10 text-green-400 cursor-default"
                      : "border-zinc-700 hover:border-zinc-500 disabled:opacity-50 text-zinc-300"
                  }`}
                  title="Send refill request to your doctor via AI"
                >
                  {refilling === med ? "Requesting..." : isDone ? "✓ Requested" : "Request Refill"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
