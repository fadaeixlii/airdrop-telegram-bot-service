import express from "express";
import Users from "../Models/Users";
import { isMongoConnected } from "../utils/connectToDB";
import { giveRankReward } from "../utils/userUtils";
import UserState from "../Models/UserState";

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

    let numClaims = 1; // Default 1 claim
    if (
      user.lastClaimTimestamp &&
      Date.now() - user.lastClaimTimestamp.getTime() >
        user.timeLimit * 60 * 1000
    ) {
      const elapsedMinutes = Math.floor(
        (Date.now() - user.lastClaimTimestamp.getTime()) /
          (user.timeLimit * 60 * 1000)
      );

      numClaims = Math.min(
        user.robotTimeRemain + 1,
        Math.floor(elapsedMinutes)
      );
    }

    if (user.robotTimeRemain > 0) numClaims++;

    const { storedScore, maxScore } = user;
    let newStoredScore = storedScore + numClaims * maxScore;
    let newNextRankScore = user.nextRankScore;
    console.log("numClaims", numClaims);
    console.log("newStoredScore", newStoredScore);
    console.log("storedScore", storedScore);
    console.log("maxScore", maxScore);

    const result = await giveRankReward(newStoredScore);

    if (result) {
      newStoredScore = result[0];
      newNextRankScore = result[1];
    }

    console.log("result", result);
    console.log("newStoredScore", newStoredScore);
    console.log("newNextRankScore", newNextRankScore);

    let robotRemain = 0;
    if (user.robotTimeRemain > 0) {
      robotRemain = user.robotTimeRemain - (numClaims - 1);
    }

    const newClaimTime = new Date();
    await user.updateOne({
      storedScore: newStoredScore,
      nextRankScore: newNextRankScore,
      lastClaimTimestamp: newClaimTime,
      robotTimeRemain: robotRemain, // Ensure non-negative value
      rewardFromRank: result ? result[2] : 0,
    });

    const parentRef = user.parentReferral;
    if (parentRef) {
      const parentUser = await Users.findById(parentRef);
      if (parentUser) parentUser.storedScore += numClaims * maxScore * 0.2;
      parentUser?.save();
    }

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
