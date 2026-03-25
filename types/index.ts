// User Types
export type UserRole = 'patient' | 'doctor'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface PatientProfile extends User {
  dateOfBirth?: string
  gender?: string
  medicalHistory?: string
  allergies?: string
  emergencyContact?: string
  phoneNumber?: string
  address?: string
}

export interface DoctorProfile extends User {
  specialty: string
  qualifications: string
  experience: string
  licenseNumber: string
  hospital?: string
  consultationFee?: number
  availability?: {
    day: string
    startTime: string
    endTime: string
  }[]
  phoneNumber?: string
}

// Appointment Types
export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string
  startTime: string
  endTime: string
  reason: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

// Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// Medical Report Types
export interface MedicalReport {
  id: string
  patientId: string
  fileName: string
  fileUrl: string
  uploadDate: string
  fileType: string
  fileSize: number
  description?: string
}

// Analysis Types
export interface AnalysisResult {
  id: string
  patientId: string
  reportId?: string
  analysisText: string
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterResponse {
  user: User
  token?: string
}
