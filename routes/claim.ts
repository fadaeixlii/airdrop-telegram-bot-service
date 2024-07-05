import express from "express";
import Users from "../Models/Users";
import { isMongoConnected } from "../utils/connectToDB";
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
      Date.now() - user.lastClaimTimestamp < user.timeLimit * 60 * 1000
    ) {
      return res.sendError(
        403,
        `You can only claim once every ${user.timeLimit} minutes`
      );
    }

    const { storedScore, maxScore } = user;
    let newStoredScore = storedScore + maxScore;
    user.storedScore = newStoredScore;
    user.claimCount++;

    const parentUser = await Users.findById(user.parentReferral);
    if (parentUser) {
      if (user.claimCount === 2) {
        parentUser.collectedTon += 0.001;
      }
      parentUser.storedScore += maxScore / 5;
      user.rewardFromRank += maxScore / 5;
      await parentUser?.save();
    }
    await user.save();

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
      lastClaimTimestamp: newClaimTime.getTime(),
    });
  } catch (error) {
    console.error("Error processing claim:", error);
    res.sendError(500, "Internal server error");
  }
});
