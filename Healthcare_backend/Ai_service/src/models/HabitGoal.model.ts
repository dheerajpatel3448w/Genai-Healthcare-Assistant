import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitGoal extends Document {
  userId: mongoose.Types.ObjectId;
  hydrationTarget: number;
  sleepTarget: number;
  physicalActivityTarget: number;
  mealsTarget: number;
  screenBreakTarget: number;
  stressReliefTarget: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitGoalSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true, // One goal profile per user
    index: true
  },
  hydrationTarget: {
    type: Number,
    default: 8, // glasses of water
  },
  sleepTarget: {
    type: Number,
    default: 7, // hours
  },
  physicalActivityTarget: {
    type: Number,
    default: 30, // minutes
  },
  mealsTarget: {
    type: Number,
    default: 3, // healthy meals
  },
  screenBreakTarget: {
    type: Number,
    default: 5, // breaks
  },
  stressReliefTarget: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export const HabitGoal = mongoose.model<IHabitGoal>('HabitGoal', HabitGoalSchema);
