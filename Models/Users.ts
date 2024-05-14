import mongoose, { Schema } from "mongoose";

export interface User extends mongoose.Document {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  referrals: mongoose.Types.ObjectId[];
  userMaxScorePrice: number;
  userTimeLimitPrice: number;
  rank: mongoose.Types.ObjectId;
  robot: mongoose.Types.ObjectId;
  parentReferral?: mongoose.Types.ObjectId;
  score: number;
  maxScore: number;
  robotTimeRemain: number;
  storedScore: number;
  referralCode?: string;
  lastClaimTimestamp?: Date;
  timeLimit: number;
}

const userSchema = new Schema<User>({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
  },
  username: String,
  firstName: String,
  referralCode: String,
  lastName: String,
  referrals: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  parentReferral: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    default: null,
  },
  score: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: Number(process.env.MAX_SCORE_DEFAULT) ?? 100,
  },
  storedScore: {
    type: Number,
    default: 0,
  },
  rank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ranks",
  },
  robot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Robots",
  },
  robotTimeRemain: {
    type: Number,
    default: 0,
  },
  lastClaimTimestamp: Date,
  timeLimit: {
    type: Number,
    default: Number(process.env.TIME_LIMIT_DEFAULT) ?? 10,
  },
  userMaxScorePrice: {
    type: Number,
    default: Number(process.env.USER_MAX_SCORE_PRICE_DEFAULT) ?? 100,
  },
  userTimeLimitPrice: {
    type: Number,
    default: Number(process.env.USER_TIME_LIMIT_PRICE_DEFAULT) ?? 10,
  },
});

const Users = mongoose.model<User>("Users", userSchema);
export default Users;
