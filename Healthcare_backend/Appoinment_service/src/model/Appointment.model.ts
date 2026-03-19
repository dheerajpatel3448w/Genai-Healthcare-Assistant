import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAppointment extends Document {
  userId: Types.ObjectId;
  doctorId: Types.ObjectId;
  appointmentDate: Date;
  startTime: string;
  endTime?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
  consultationType: "online" | "offline";
  reason?: string;
  notes?: string;
  rescheduledFrom?: Types.ObjectId;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: "DoctorProfile",
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // "10:30 AM"
    required: true
  },
  endTime: {
    type: String, // optional
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "rescheduled", "no_show"],
    default: "scheduled"
  },
  consultationType: {
    type: String,
    enum: ["online", "offline"],
    default: "online"
  },
  reason: {
    type: String
  },
  notes: {
    type: String
  },
  rescheduledFrom: {
    type: Schema.Types.ObjectId,
    ref: "Appointment"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  }
}, { timestamps: true });

export const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);
