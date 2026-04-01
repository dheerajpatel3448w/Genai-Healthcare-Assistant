"use client";

import React, { useEffect, useState, Suspense } from "react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useSearchParams } from "next/navigation";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as "patient" | "doctor" | null;
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  useEffect(() => {
    if (roleParam === "doctor" || roleParam === "patient") {
      setRole(roleParam);
    }
  }, [roleParam]);

  return <OnboardingWizard role={role} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-cyan-500">Initializing Core...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
