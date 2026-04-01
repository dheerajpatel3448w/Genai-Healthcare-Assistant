import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDoctorProfile extends Document {

  userId: Types.ObjectId;

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
  consultationType?: ("online" | "clinic" | "hospital")[];
  slotDuration?: number;

  // Availability
  availability?: {
    days?: string[];
    startTime?: string;
    endTime?: string;
  };

  // Doctor Info
  bio?: string;
  profileImage?: string;
  languages?: string[];
  services?: string[];

  // Education
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];

  // Platform stats
  rating?: number;
  totalPatients?: number;

  // Admin verification
  isVerified?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const doctorProfileSchema = new Schema<IDoctorProfile>(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  // Professional Info
  specialization: {
    type: String,
    required: true
  },

  experience: {
    type: Number,
    required: true
  },

  qualification: {
    type: String,
    required: true
  },

  licenseNumber: {
    type: String,
    required: true
  },

  // Clinic Info
  hospitalName: String,
  clinicAddress: String,

  // Consultation
  consultationFee: Number,

  consultationType: {
    type: [String],
    enum: ["online", "clinic", "hospital"]
  },

  slotDuration: {
    type: Number,
    default: 30
  },

  // Availability
  availability: {
    days: [String],
    startTime: String,
    endTime: String
  },

  // Doctor info
  bio: String,
  profileImage: String,

  languages: [String],
  services: [String],

  // Education
  education: [
    {
      degree: String,
      institution: String,
      year: Number
    }
  ],

  // Platform stats
  rating: {
    type: Number,
    default: 0
  },

  totalPatients: {
    type: Number,
    default: 0
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);

export const DoctorProfile = mongoose.model<IDoctorProfile>(
  "DoctorProfile",
  doctorProfileSchema
);