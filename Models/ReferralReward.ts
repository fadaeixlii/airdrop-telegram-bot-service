import mongoose, { Schema, Document } from "mongoose";

export interface IReferralReward extends Document {
  title: string;
  rewardValue: number;
  referralsNeeded: number;
}

const referralRewardSchema = new Schema<IReferralReward>({
  title: {
    type: String,
    required: true,
  },
  rewardValue: {
    type: Number,
    required: true,
  },
  referralsNeeded: {
    type: Number,
    required: true,
  },
});

const ReferralRewards = mongoose.model<IReferralReward>(
  "ReferralRewards",
  referralRewardSchema
);
export default ReferralRewards;
