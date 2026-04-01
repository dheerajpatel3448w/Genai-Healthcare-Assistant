import axios from "axios";
import {
  IUserProfile,
  IAppointment,
  IChatHistory,
  IReport,
  IReportAnalysis,
  PatientDashboardState,
} from "../../types/patient.types";

// ─── Service Base URLs (from .env) ───────────────────────────────────────────
const USER_API    = process.env.NEXT_PUBLIC_API_USER;       // :5002
const DOCTOR_API  = process.env.NEXT_PUBLIC_API_DOCTOR;     // :5001
const APPT_API    = process.env.NEXT_PUBLIC_API_APPOINTMENT; // :5003
const AI_API      = process.env.NEXT_PUBLIC_API_AI;         // :8000

// Shared Axios config — sends cookies (JWT token) with every request
const api = axios.create({ withCredentials: true });

// ─── Individual Fetchers ──────────────────────────────────────────────────────

async function fetchUserProfile(): Promise<IUserProfile | null> {
  try {
    const res = await api.get(`${USER_API}/profile/getprofile`);
    // The populated userId object contains { _id, name, email }
    // Merge name/email into the profile for easy access in the UI
    const profile = res.data.profile;
    const userDetails = profile.userId as { name?: string; email?: string } | null;
    return {
      ...profile,
      name: userDetails?.name,
      email: userDetails?.email,
    } as IUserProfile;
  } catch (err: any) {
    // 404 means the user just hasn't created a profile yet (new user).
    // We return null gracefully without spamming the console.
    if (err?.response?.status !== 404) {
      console.error("[patient.api] fetchUserProfile failed:", err);
    }
    return null;
  }
}

async function fetchAppointments(): Promise<IAppointment[]> {
  try {
    const res = await api.get(`${APPT_API}/api/v1/appointments/my-appointments`);
    // doctorId is now a populated object with { specialization, consultationType }
    return res.data.appointments.map((appt: any) => ({
      ...appt,
      doctorSpecialty: appt.doctorId?.specialization ?? "",
      consultationType: appt.consultationType,
    })) as IAppointment[];
  } catch (err) {
    console.error("[patient.api] fetchAppointments failed:", err);
    return [];
  }
}

/**
 * Derives the patient's "Care Team" by:
 * 1. Looking at their appointment history (already fetched)
 * 2. Extracting unique DoctorProfile IDs
 * 3. Fetching each doctor's profile individually via GET /doctor/:id
 *
 * This ensures patients only see doctors they have actually consulted with.
 */
async function fetchCareTeamFromAppointments(
  appointments: IAppointment[]
): Promise<PatientDashboardState["careTeam"]> {
  // Extract unique DoctorProfile ObjectIds from the appointments
  const uniqueDoctorIds = [
    ...new Set(
      appointments
        .map((appt: any) => appt.doctorId?._id ?? appt.doctorId)
        .filter(Boolean)
        .map(String)
    ),
  ];

  if (uniqueDoctorIds.length === 0) return [];

  // Fetch each doctor's profile in parallel
  const doctorProfiles = await Promise.all(
    uniqueDoctorIds.map(async (doctorId) => {
      try {
        const res = await api.get(`${DOCTOR_API}/doctor/${doctorId}`);
        const doc = res.data.profile;
        return {
          _id: doc._id as string,
          name: (doc.userId as any)?.name ?? "Unknown Doctor",
          specialty: doc.specialization ?? "",
        };
      } catch {
        return null; // Silently skip if one doctor lookup fails
      }
    })
  );

  return doctorProfiles.filter(Boolean) as PatientDashboardState["careTeam"];
}

async function fetchAiHistory(): Promise<IChatHistory[]> {
  try {
    const res = await api.get(`${AI_API}/ai/history`);
    return res.data.history as IChatHistory[];
  } catch (err) {
    console.error("[patient.api] fetchAiHistory failed:", err);
    return [];
  }
}

async function fetchReportsAndAnalysis(): Promise<{
  reports: IReport[];
  analysis: IReportAnalysis | null;
}> {
  try {
    const res = await api.get(`${AI_API}/analysis/history`);
    return {
      reports: (res.data.reports as IReport[]) ?? [],
      analysis: (res.data.analysis as IReportAnalysis) ?? null,
    };
  } catch (err) {
    console.error("[patient.api] fetchReportsAndAnalysis failed:", err);
    return { reports: [], analysis: null };
  }
}

// ─── Main API Object ──────────────────────────────────────────────────────────

export const patientApi = {
  /**
   * Fetches all dashboard data in parallel from the 4 microservices.
   * Each call gracefully degrades — a single failed service won't crash the dashboard.
   */
  async getDashboardData(
    _userId: string
  ): Promise<Omit<PatientDashboardState, "loading" | "error">> {
    // Fetch appointments first — we need them to derive the care team
    const appointments = await fetchAppointments();

    // Fetch everything else in parallel, passing appointments to derive care team
    const [profile, careTeam, recentChats, { reports, analysis }] =
      await Promise.all([
        fetchUserProfile(),
        fetchCareTeamFromAppointments(appointments),  // doctors from patient's own history
        fetchAiHistory(),
        fetchReportsAndAnalysis(),
      ]);

    // Enrich appointments with doctor names matched from the care team
    const enrichedAppointments = appointments.map((appt: any) => {
      const docIdToMatch = appt.doctorId?._id || appt.doctorId;
      const matchedDoctor = careTeam.find(doc => doc._id === docIdToMatch);
      return {
        ...appt,
        doctorName: matchedDoctor?.name || "Unknown Doctor",
      };
    });

    return {
      profile,
      appointments: enrichedAppointments,
      careTeam,
      recentChats,
      reports,
      analysis,
    };
  },

  /** Posts a natural language symptom query to the patient HealthBrain AI */
  async triggerAiConsultation(query: string) {
    try {
      const res = await api.post(`${AI_API}/ai/chat`, { query });
      return { success: true, response: res.data.finalResponse || res.data.response };
    } catch (err) {
      console.error("[patient.api] triggerAiConsultation failed:", err);
      return { success: false, response: null };
    }
  },

  /** Sends a refill request as an AI consultation message */
  async requestPrescriptionRefill(medication: string) {
    try {
      await api.post(`${AI_API}/ai/chat`, {
        query: `I need a prescription refill for: ${medication}. Please notify my doctor.`,
      });
      return { success: true };
    } catch (err) {
      console.error("[patient.api] requestPrescriptionRefill failed:", err);
      return { success: false };
    }
  },
};
