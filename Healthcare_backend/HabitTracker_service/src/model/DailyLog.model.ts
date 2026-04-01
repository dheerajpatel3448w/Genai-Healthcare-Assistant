import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // Stored as "YYYY-MM-DD"
  hydration: number;
  sleep: number;
  physicalActivity: number;
  meals: number;
  screenBreaks: number;
  stressRelief: boolean;
  wellnessScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
  },
  hydration: {
    type: Number,
    default: 0,
  },
  sleep: {
    type: Number,
    default: 0,
  },
  physicalActivity: {
    type: Number,
    default: 0,
  },
  meals: {
    type: Number,
    default: 0,
  },
  screenBreaks: {
    type: Number,
    default: 0,
  },
  stressRelief: {
    type: Boolean,
    default: false,
  },
  wellnessScore: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Ensure a user only has one log per date
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyLog = mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
