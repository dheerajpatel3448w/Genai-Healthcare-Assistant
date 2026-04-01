import React from "react";
import { PatientDashboardProvider } from "../../../context/patient-dashboard.context";

export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
  // Normally you would fetch the user's ID from session/cookies here
  const MOCK_USER_ID = "user_123";

  return (
    <PatientDashboardProvider userId={MOCK_USER_ID}>
      {/* We can wrap other global layout elements like headers/navbars here if needed */}
      <div className="min-h-screen bg-black text-white w-full">
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </PatientDashboardProvider>
  );
}
