import axios from "axios";
import { IDoctorProfile, IDoctorAppointment } from "../../types/doctor.types";

const DOCTOR_API = process.env.NEXT_PUBLIC_API_DOCTOR;
const APPT_API = process.env.NEXT_PUBLIC_API_APPOINTMENT;

// Shared Axios config — sends cookies (JWT token) with every request
const api = axios.create({ withCredentials: true });

export const doctorApi = {
  /** Fetch the logged-in doctor's profile */
  async fetchProfile(): Promise<IDoctorProfile | null> {
    try {
      const res = await api.get(`${DOCTOR_API}/doctor/getprofile`);
      return res.data.profile as IDoctorProfile;
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        console.error("[doctor.api] fetchProfile failed:", err);
      }
      return null;
    }
  },

  /** Fetch appointments assigned to this specific doctor profile ID */
  async fetchAppointments(doctorId: string): Promise<IDoctorAppointment[]> {
    try {
      const res = await api.get(`${APPT_API}/api/v1/appointments/doctor/${doctorId}`);
      
      return res.data.appointments.map((appt: any) => ({
        ...appt,
        patientName: appt.userId?.name || "Unknown Patient",
      })) as IDoctorAppointment[];
    } catch (err) {
      console.error("[doctor.api] fetchAppointments failed:", err);
      return [];
    }
  },

  /** Update an appointment's status (e.g., 'confirmed', 'completed', 'cancelled') */
  async updateAppointmentStatus(appointmentId: string, status: string): Promise<boolean> {
    try {
      await api.patch(`${APPT_API}/api/v1/appointments/${appointmentId}/status`, { status });
      return true;
    } catch (err) {
      console.error("[doctor.api] updateAppointmentStatus failed:", err);
      return false;
    }
  }
};
