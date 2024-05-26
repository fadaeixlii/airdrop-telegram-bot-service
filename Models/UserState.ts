import mongoose, { Schema, Document } from "mongoose";

export interface UserState extends Document {
  totalScore: number;
  userCount: number;
  newUsersIn24h: number;
  lastUpdated: Date;
}

const userStateSchema = new Schema<UserState>({
  totalScore: {
    type: Number,
    default: 0,
  },
  userCount: {
    type: Number,
    default: 0,
  },
  newUsersIn24h: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const UserState = mongoose.model<UserState>("UserState", userStateSchema);
export default UserState;
