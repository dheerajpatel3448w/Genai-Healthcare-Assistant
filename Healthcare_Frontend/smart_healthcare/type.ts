// types/user.ts

export type Role = "patient" | "doctor";
export type Gender = "male" | "female" | "other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type ExerciseFrequency = "none" | "rare" | "weekly" | "daily";
export type DietType = "veg" | "non-veg" | "vegan" | "mixed";
// types/doctor.ts

export type ConsultationType = "online" | "clinic" | "hospital";

export interface IAvailability {
  days?: string[];
  startTime?: string;
  endTime?: string;
}

export interface IEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface IDoctorProfile {
  _id: string;
  userId: string;
  
  // Professional Info
  specialization: string;
  experience: number;
  qualification: string;
  licenseNumber: string;
  
  // Clinic / Hospital
  hospitalName?: string;
  clinicAddress?: string;
  
  // Consultation
  consultationFee?: number;
  consultationType?: ConsultationType[];
  slotDuration?: number; // Default was 30 on backend
  
  // Availability
  availability?: IAvailability;
  
  // Doctor Info
  bio?: string;
  profileImage?: string;
  languages?: string[];
  services?: string[];
  
  // Education
  education?: IEducation[];
  
  // Platform stats
  rating?: number; // Default 0
  totalPatients?: number; // Default 0
  
  // Admin verification
  isVerified?: boolean; // Default false
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
export interface ILifestyle {
  smoking?: boolean;
  alcohol?: boolean;
  exerciseFrequency?: ExerciseFrequency;
  sleepHours?: number;
  dietType?: DietType;
}

export interface IEmergencyContact {
  name?: string;
  phone?: string;
  email?: string;
  relation?: string;
}

export interface IInsurance {
  provider?: string;
  policyNumber?: string;
}

export interface IUserProfile {
  _id: string;
  userId: string;
  age?: number;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  height?: number; // in cm
  weight?: number; // in kg
  bloodGroup?: BloodGroup;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  pastSurgeries?: string[];
  familyHistory?: string[];
  lifestyle?: ILifestyle;
  emergencyContact?: IEmergencyContact;
  insurance?: IInsurance;
  createdAt: string;
  updatedAt: string;
}

// The main User interface representing the logged-in user state
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  
  // Assuming your backend API populates or attaches the profile to the user object 
  // during login (e.g., res.json({ user: { ..., profile: userProfile } }))
  profile?: IUserProfile; 
}

export interface  AppProviderProps{
    children: React.ReactNode;
}

export interface AccontProps {
  user: IUser;
  isYourAccount: boolean;
}
export interface DoctorAccontProps {
  doctor: IUserDoctor;
  isYourAccount: boolean;
} 

export interface UserContextType{
    user: IUser | null;
    loading: boolean;
    btnLoading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    setBtnLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface DoctorContextType{
    doctor: IUserDoctor | null;
    loading2: boolean;
    btnLoading2: boolean;
    isAuth2: boolean;
    setDoctor: React.Dispatch<React.SetStateAction<IUserDoctor | null>>;
    setLoading2: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAuth2: React.Dispatch<React.SetStateAction<boolean>>;
    setBtnLoading2: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IUserDoctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "patient" | "doctor";
  createdAt: string;
  updatedAt: string;
  doctorProfile?: IDoctorProfile;
}

// ─── HabitTracker Service Types ─────────

export type HabitKey =
  | "hydration"
  | "sleep"
  | "physicalActivity"
  | "meals"
  | "screenBreaks"
  | "stressRelief";

export type HabitStatus = "complete" | "partial" | "missed";

export interface IHabitGoal {
  _id: string;
  userId: string;
  hydrationTarget: number;
  sleepTarget: number;
  physicalActivityTarget: number;
  mealsTarget: number;
  screenBreakTarget: number;
  stressReliefTarget: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDailyLog {
  _id: string;
  userId: string;
  date: string;
  hydration: number;
  sleep: number;
  physicalActivity: number;
  meals: number;
  screenBreaks: number;
  stressRelief: boolean;
  wellnessScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface StreakDay {
  date: string;
  status: HabitStatus;
  score: number;
}

export interface TrendDay {
  date: string;
  score: number;
  hydration: number;
  sleep: number;
  physicalActivity: number;
  meals: number;
  screenBreaks: number;
}

export interface WeeklyTipResult {
  tip: string;
  weakestHabit: HabitKey;
  completionRates: Record<HabitKey, number>;
}