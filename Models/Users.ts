import mongoose, { Schema } from "mongoose";

const defaultNumber = (envVar: string, defaultValue: number): number => {
  const value = Number(process.env[envVar]);
  return isNaN(value) ? defaultValue : value;
};

export interface IUser extends mongoose.Document {
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
  lastClaimTimestamp?: number;
  timeLimit: number;
  nextRankScore: number;
  maxScoreMaxBoostCount: number;
  timeLimitMaxBoostCount: number;
  completedTasks: mongoose.Types.ObjectId[];
  profitPerHour: number;
  rewardFromRank: number;
  lastTimeCallApi: number;
  claimedRanks: mongoose.Types.ObjectId[];
  referralRewardClaimed: mongoose.Types.ObjectId[];
  claimedTimeLimitBoosts: mongoose.Types.ObjectId[];
  claimedMaxScoreBoosts: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
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
    default: 100,
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
  lastClaimTimestamp: Number,
  timeLimit: {
    type: Number,
    default: 480,
  },
  userMaxScorePrice: {
    type: Number,
    default: 80,
  },
  userTimeLimitPrice: {
    type: Number,
    default: 80,
  },
  maxScoreMaxBoostCount: {
    type: Number,
    default: defaultNumber("APP_MAX_SCORE_MAX_BOOST_COUNT", 20),
  },
  timeLimitMaxBoostCount: {
    type: Number,
    default: defaultNumber("APP_TIME_LIMIT_MAX_BOOST_COUNT", 20),
  },
  nextRankScore: {
    type: Number,
    default: 1000,
  },
  completedTasks: [{ type: Schema.Types.ObjectId, ref: "Tasks" }],
  profitPerHour: {
    type: Number,
    default: 0,
  },
  rewardFromRank: {
    type: Number,
    default: 0,
  },
  lastTimeCallApi: {
    type: Number,
    default: new Date().getTime(),
  },
  claimedRanks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ranks",
      default: [],
    },
  ],
  referralRewardClaimed: [
    {
      type: Schema.Types.ObjectId,
      ref: "ReferralRewards",
    },
  ],
  claimedTimeLimitBoosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeLimitBoosts",
    },
  ],
  claimedMaxScoreBoosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaxScoreBoosts",
    },
  ],
});

const Users = mongoose.model<IUser>("Users", userSchema);
export default Users;
