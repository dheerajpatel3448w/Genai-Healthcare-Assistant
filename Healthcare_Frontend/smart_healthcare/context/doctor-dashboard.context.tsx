"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useDoctorData } from "./docter.context"; 
import { doctorApi } from "../lib/api/doctor.api";
import { DoctorDashboardState, IDoctorAppointment, IDoctorProfile } from "../types/doctor.types";

interface DoctorDashboardContextValue extends DoctorDashboardState {
  refreshDashboard: () => Promise<void>;
  updateAppointment: (id: string, status: string) => Promise<boolean>;
}

const DoctorDashboardContext = createContext<DoctorDashboardContextValue | undefined>(undefined);

export const DoctorDashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuth2, doctor } = useDoctorData(); // Global auth context for doctors

  const [state, setState] = useState<DoctorDashboardState>({
    profile: null,
    appointments: [],
    needsOnboarding: false,
    loading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    // Need logged-in user id to check profile
    if (!isAuth2 || !doctor?._id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const profileInfo = await doctorApi.fetchProfile();
      
      if (!profileInfo) {
        // First time doctor — needs to fill out the form
        setState((prev) => ({
          ...prev,
          profile: null,
          needsOnboarding: true,
          loading: false,
        }));
        return;
      }

      // We have a profile! Fetch their appointments
      const appts = await doctorApi.fetchAppointments(profileInfo._id);

      setState({
        profile: profileInfo,
        appointments: appts,
        needsOnboarding: false,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("[DoctorDashboardProvider] Failed to load data", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "An unexpected error occurred while loading your dashboard.",
      }));
    }
  }, [isAuth2, doctor]);

  // Initial fetch on mount / auth change
  useEffect(() => {
    if (isAuth2) {
      fetchDashboardData();
    } else {
      // Not authenticated, reset state
      setState({
        profile: null,
        appointments: [],
        needsOnboarding: false,
        loading: false,
        error: null,
      });
    }
  }, [isAuth2, fetchDashboardData]);

  const updateAppointment = async (id: string, status: string): Promise<boolean> => {
    const success = await doctorApi.updateAppointmentStatus(id, status);
    if (success) {
      // Optimistically update the UI without refetching everything
      setState((prev) => ({
        ...prev,
        appointments: prev.appointments.map((appt) =>
          appt._id === id ? { ...appt, status: status as any } : appt
        ),
      }));
    }
    return success;
  };

  const value = useMemo(
    () => ({
      ...state,
      refreshDashboard: fetchDashboardData,
      updateAppointment
    }),
    [state, fetchDashboardData]
  );

  return (
    <DoctorDashboardContext.Provider value={value}>
      {children}
    </DoctorDashboardContext.Provider>
  );
};

export const useDoctorDashboard = () => {
  const context = useContext(DoctorDashboardContext);
  if (context === undefined) {
    throw new Error("useDoctorDashboard must be used within a DoctorDashboardProvider");
  }
  return context;
};
