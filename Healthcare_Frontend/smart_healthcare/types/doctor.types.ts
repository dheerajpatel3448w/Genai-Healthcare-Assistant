export interface IDoctorProfile {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  specialization: string;
  experience: number;
  qualification: string;
  licenseNumber: string;
  consultationFee?: number;
  consultationType?: string[];
  availability?: {
    days?: string[];
    startTime?: string;
    endTime?: string;
  };
  totalPatients?: number;
  rating?: number;
  profileImage?: string;
  bio?: string;
}

export interface IDoctorAppointment {
  _id: string;
  userId: { _id: string; name?: string; email?: string } | string;
  patientName?: string; 
  doctorId: string; // the doctor's _id
  date: string; // ISO date or YYYY-MM-DD
  time: string; // HH:mm
  status: "pending" | "confirmed" | "completed" | "cancelled" | "reschedule_requested";
  consultationType: "online" | "clinic" | "hospital";
  reason?: string;
}

export interface DoctorDashboardState {
  profile: IDoctorProfile | null;
  appointments: IDoctorAppointment[];
  needsOnboarding: boolean;
  loading: boolean;
  error: string | null;
}
