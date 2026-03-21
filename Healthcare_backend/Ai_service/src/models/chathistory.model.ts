import mongoose, { Schema, Document } from "mongoose";

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  userQuery: string;
  aiResponse: string;
  timestamp: Date;
}

const chatHistorySchema = new Schema<IChatHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userQuery: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const ChatHistory = mongoose.model<IChatHistory>("ChatHistory", chatHistorySchema);
