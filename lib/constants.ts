export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',

  // User Profile
  PROFILE_CREATE: '/profile/create',
  PROFILE_GET: '/profile/getprofile',
  PROFILE_UPDATE: '/profile/updateprofile',
  PROFILE_DELETE: '/profile/deleteprofile',

  // Doctor Service
  DOCTOR_ALL: '/doctor/all',
  DOCTOR_CREATE: '/doctor/create',
  DOCTOR_GET: '/doctor/getprofile',
  DOCTOR_UPDATE: '/doctor/updateprofile',
  DOCTOR_DELETE: '/doctor/deleteprofile',

  // Appointments
  APPOINTMENT_CREATE: '/appointment/create',
  APPOINTMENT_MY: '/appointment/my-appointments',
  APPOINTMENT_BY_DOCTOR: '/appointment/doctor/:doctorId',
  APPOINTMENT_STATUS: '/appointment/:id/status',
  APPOINTMENT_CANCEL: '/appointment/:id/cancel',
  APPOINTMENT_RESCHEDULE: '/appointment/:id/reschedule',
  APPOINTMENT_BOOKED_SLOTS: '/appointment/doctor/:doctorId/booked-slots',

  // AI Services
  PATIENT_CHAT: '/ai/chat',
  DOCTOR_CHAT: '/doctor-ai/chat',
  ANALYSIS: '/analysis/analysis',
  ANALYSIS_REPORTS: '/analysis/analysis/reports',

  // Image Upload
  IMAGE_UPLOAD: '/images/upload',
  IMAGE_JOB_STATUS: '/images/job-status/:jobId',
}

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
} as const

export const HTTP_TIMEOUT = 30000 // 30 seconds

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
} as const
