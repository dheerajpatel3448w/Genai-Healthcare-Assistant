export interface IUserProfile {
  userId: string;
  name?: string;   // populated from User model via userId
  email?: string;  // populated from User model via userId
  age?: number;
  gender?: "male" | "female" | "other";
  address?: string;
  city?: string;
  state?: string;
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  height?: number;
  weight?: number;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  pastSurgeries?: string[];
  familyHistory?: string[];
  lifestyle?: {
    smoking?: boolean;
    alcohol?: boolean;
    exerciseFrequency?: "none" | "rare" | "weekly" | "daily";
    sleepHours?: number;
    dietType?: "veg" | "non-veg" | "vegan" | "mixed";
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    email?: string;
    relation?: string;
  };
  insurance?: {
    provider?: string;
    policyNumber?: string;
  };
}

export interface IAppointment {
  _id: string;
  doctorId: string; // Will populate with doctor info later or map separately
  doctorName?: string;
  doctorSpecialty?: string;
  appointmentDate: string;
  startTime: string;
  consultationType: "online" | "offline";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
  paymentStatus: "pending" | "paid" | "failed";
}

export interface IChatHistory {
  _id: string;
  userQuery: string;
  aiResponse: string;
  timestamp: string;
}

export interface IReport {
  _id: string;
  reportName?: string;
  reportType: "lab" | "imaging" | "clinical";
  fileUrl?: string;
  uploadedAt: string;
}

export interface IReportAnalysis {
  _id: string;
  finalAnalysis?: Record<string, unknown> | string;
}

// Aggregated context state
export interface PatientDashboardState {
  profile: IUserProfile | null;
  appointments: IAppointment[];
  recentChats: IChatHistory[];
  reports: IReport[];
  analysis: IReportAnalysis | null;
  careTeam: { _id: string; name: string; specialty: string }[];
  loading: boolean;
  error: string | null;
}
