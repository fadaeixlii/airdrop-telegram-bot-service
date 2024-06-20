import express from "express";
import Users, { IUser } from "../Models/Users";
import { isMongoConnected } from "../utils/connectToDB";
import { giveRankReward } from "../utils/userUtils";
import UserState from "../Models/UserState";
import Ranks, { IRanks } from "../Models/Ranks";

const router = express.Router();

// Middleware specific to these routes
router.use((req, res, next) => {
  if (isMongoConnected()) next();
  else {
    res.sendError(405, "Something Bad Happended");
    return;
  }
});

export const claimRoute = router.post("/claim", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.sendError(404, "User not found");
    }
    if (
      user.lastClaimTimestamp &&
      Date.now() - user.lastClaimTimestamp.getTime() <
        user.timeLimit * 60 * 1000
    ) {
      return res.sendError(
        403,
        `You can only claim once every ${user.timeLimit} minutes`
      );
    }

    const { storedScore, maxScore } = user;
    let newStoredScore = storedScore + maxScore;
    user.storedScore = newStoredScore;
    user.save();
    let newNextRankScore = user.nextRankScore;
    console.log("newStoredScore", newStoredScore);
    console.log("storedScore", storedScore);
    console.log("maxScore", maxScore);

    const ranks: IRanks[] = await Ranks.find({
      minScore: { $lte: user.storedScore },
      maxScore: { $gte: user.storedScore },
    });
    for (const rank of ranks) {
      if (!user.claimedRanks.includes(rank._id)) {
        // Award the user
        const reward = rank.maxScore * 0.1;
        user.storedScore += reward;
        user.rewardFromRank += reward;

        // Award the parent referral
        if (user.parentReferral) {
          const parent: IUser | null = await Users.findById(
            user.parentReferral
          );
          if (parent) {
            const parentReward = reward * 0.025;
            parent.storedScore += parentReward;
            await parent.save();
          }
        }

        // Mark the rank as claimed
        user.claimedRanks.push(rank._id);
        await user.save();
      }
    }

    console.log("newStoredScore", newStoredScore);
    console.log("newNextRankScore", newNextRankScore);

    const newClaimTime = new Date();
    await user.updateOne({
      lastClaimTimestamp: newClaimTime,
    });

    const userState = await UserState.findOne({});
    if (userState) {
      userState.totalScore += maxScore;
      await userState.save();
    } else {
      await UserState.create({
        totalScore: maxScore,
        userCount: 0,
        newUsersIn24h: 0,
      });
    }

    res.sendSuccess(200, "Claim Successfull", {
      newStoredScore: newStoredScore,
      lastClaimTimestamp: newClaimTime,
    });
  } catch (error) {
    console.error("Error processing claim:", error);
    res.sendError(500, "Internal server error");
  }
});
