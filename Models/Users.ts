import mongoose, { Schema } from "mongoose";

const defaultNumber = (envVar: string, defaultValue: number): number => {
  const value = Number(process.env[envVar]);
  return isNaN(value) ? defaultValue : value;
}

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
  maxScore: number;
  robotTimeRemain: number;
  storedScore: number;
  referralCode?: string;
  lastClaimTimestamp?: Date;
  timeLimit: number;
  nextRankScore: number;
  maxScoreMaxBoostCount: number;
  timeLimitMaxBoostCount: number;
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
  maxScore: {
    type: Number,
    default: defaultNumber('MAX_SCORE_DEFAULT', 100),
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
    default: defaultNumber('TIME_LIMIT_DEFAULT', 10),
  },
  userMaxScorePrice: {
    type: Number,
    default: defaultNumber('USER_MAX_SCORE_PRICE_DEFAULT', 100),
  },
  userTimeLimitPrice: {
    type: Number,
    default: defaultNumber('USER_TIME_LIMIT_PRICE_DEFAULT', 100),
  },
  maxScoreMaxBoostCount: {
    type: Number,
    default: defaultNumber('APP_MAX_SCORE_MAX_BOOST_COUNT', 20),
  },
  timeLimitMaxBoostCount: {
    type: Number,
    default: defaultNumber('APP_TIME_LIMIT_MAX_BOOST_COUNT', 20),
  },
  nextRankScore: {
    type: Number,
    default: 100,
  },
});

const Users = mongoose.model<User>("Users", userSchema);
export default Users;
