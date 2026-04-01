"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PatientDashboardState } from "../types/patient.types";
import { patientApi } from "../lib/api/patient.api";

// Extends the state with actions
interface PatientDashboardContextType extends PatientDashboardState {
  refreshDashboard: () => Promise<void>;
  submitAiQuery: (query: string) => Promise<boolean>;
  requestRefill: (medication: string) => Promise<boolean>;
}

const initialState: PatientDashboardState = {
  profile: null,
  appointments: [],
  recentChats: [],
  reports: [],
  analysis: null,
  careTeam: [],
  loading: true,
  error: null,
};

const PatientDashboardContext = createContext<PatientDashboardContextType | undefined>(undefined);

export const PatientDashboardProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({
  children,
  userId = "user_123" // Fallback mock user if no auth is hooked up yet
}) => {
  const [state, setState] = useState<PatientDashboardState>(initialState);

  const fetchDashboardData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await patientApi.getDashboardData(userId);
      setState({ ...data, loading: false, error: null });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load dashboard data",
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const submitAiQuery = async (query: string) => {
    try {
      const res = await patientApi.triggerAiConsultation(query);
      if (res.success && res.response) {
        setState((prev) => ({
          ...prev,
          recentChats: [
            {
              _id: Date.now().toString(),
              userQuery: query,
              aiResponse: res.response,
              timestamp: new Date().toISOString(),
            },
            ...prev.recentChats,
          ],
        }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const requestRefill = async (medication: string) => {
    try {
      await patientApi.requestPrescriptionRefill(medication);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <PatientDashboardContext.Provider
      value={{
        ...state,
        refreshDashboard: fetchDashboardData,
        submitAiQuery,
        requestRefill
      }}
    >
      {children}
    </PatientDashboardContext.Provider>
  );
};

export const usePatientDashboard = () => {
  const context = useContext(PatientDashboardContext);
  if (!context) {
    throw new Error("usePatientDashboard must be used within a PatientDashboardProvider");
  }
  return context;
};
