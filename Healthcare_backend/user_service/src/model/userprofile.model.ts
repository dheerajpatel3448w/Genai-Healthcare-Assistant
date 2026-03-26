import mongoose, { Schema, Document, Types } from "mongoose";
import type { email } from "zod";

export interface IUserProfile extends Document {

  userId: Types.ObjectId;

  // Personal Info
  age?: number;
  gender?: "male" | "female" | "other";
  address?: string;
  city?: string;
  state?: string;

  // Body Metrics
  height?: number; // in cm
  weight?: number; // in kg
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

  // Medical Background
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  pastSurgeries?: string[];

  // Family History
  familyHistory?: string[];

  // Lifestyle Information
  lifestyle?: {
    smoking?: boolean;
    alcohol?: boolean;
    exerciseFrequency?: "none" | "rare" | "weekly" | "daily";
    sleepHours?: number;
    dietType?: "veg" | "non-veg" | "vegan" | "mixed";
  };

  // Emergency Contact
  emergencyContact?: {
    name?: string;
    phone?: string;
    email?: string;
    relation?: string;
  };

  // Insurance (future healthcare integration)
  insurance?: {
    provider?: string;
    policyNumber?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  // Personal
  age: Number,
  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },

  address: String,
  city: String,
  state: String,

  // Body Metrics
  height: Number,
  weight: Number,

  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  },

  // Medical
  allergies: [String],
  chronicDiseases: [String],
  currentMedications: [String],
  pastSurgeries: [String],

  // Family history
  familyHistory: [String],

  // Lifestyle
  lifestyle: {
    smoking: Boolean,
    alcohol: Boolean,
    exerciseFrequency: {
      type: String,
      enum: ["none", "rare", "weekly", "daily"]
    },
    sleepHours: Number,
    dietType: {
      type: String,
      enum: ["veg", "non-veg", "vegan", "mixed"]
    }
  },

  // Emergency
  emergencyContact: {
    name: String,
    phone: String,
    email: String,
    relation: String
  },

  // Insurance
  insurance: {
    provider: String,
    policyNumber: String
  }

},
{ timestamps: true }
);

export const UserProfile = mongoose.model<IUserProfile>(
  "UserProfile",
  userProfileSchema
);