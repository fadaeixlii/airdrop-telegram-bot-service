import express from "express";
import Users, { IUser } from "../Models/Users";
import ReferralRewards from "../Models/ReferralReward";

const router = express.Router();

export const claimReferralReward = router.post(
  "/claim-referral-reward",
  async (req, res) => {
    const { userId, rewardId } = req.body;

    try {
      const user = await Users.findById(userId).populate<{
        referrals: IUser[];
      }>("referrals");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const reward = await ReferralRewards.findById(rewardId);

      if (!reward) {
        return res
          .status(404)
          .json({ success: false, message: "Reward not found" });
      }

      const userReferralsCount = user.referrals.length;
      if (userReferralsCount < reward.referralsNeeded) {
        return res.status(403).json({
          success: false,
          message: `You need ${reward.referralsNeeded} referrals to claim this reward`,
        });
      }

      // Check if the user has already claimed this reward
      if (user.referralRewardClaimed.includes(reward._id)) {
        return res.status(400).json({
          success: false,
          message: "You have already claimed this reward",
        });
      }

      // Grant the reward to the user
      user.storedScore += reward.rewardValue;
      user.referralRewardClaimed.push(reward._id);

      await user.save();

      res
        .status(200)
        .json({ success: true, message: "Reward claimed successfully", user });
    } catch (error) {
      console.error("Error claiming referral reward:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export const unclaimedReferralReward = router.get(
  "/unclaimed-referral-rewards/:userId",
  async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await Users.findById(userId).populate<{
        referrals: IUser[];
      }>("referrals");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const allRewards = await ReferralRewards.find();
      const claimedRewards = user.referralRewardClaimed;
      const userReferralsCount = user.referrals.length;

      const unclaimedRewards = [...allRewards];

      res.status(200).json({
        success: true,
        unclaimedRewards: unclaimedRewards.map((unclaimedRef) => ({
          title: unclaimedRef.title,
          rewardValue: unclaimedRef.rewardValue,
          referralsNeeded: unclaimedRef.referralsNeeded,
          id: unclaimedRef._id,
          isCompleted: claimedRewards.includes(unclaimedRef._id),
        })),
      });
    } catch (error) {
      console.error("Error fetching unclaimed referral rewards:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);
