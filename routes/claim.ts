import express from "express";
import Users from "../Models/Users";
import { isMongoConnected } from "../utils/connectToDB";

const router = express.Router();

// Middleware specific to these routes
router.use((req, res, next) => {
  if (isMongoConnected())
    next();
  else {
    res.sendError(405,"Something Bad Happended");
    return;
  }
});

export const claimRoute = router.post("/claim", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.sendError(404,"User not found");
    }
    if (
      user.lastClaimTimestamp &&
      Date.now() - user.lastClaimTimestamp.getTime() <
      user.timeLimit * 60 * 1000
    ) {
      return res.sendError(403,`You can only claim once every ${user.timeLimit} minutes`);
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

      numClaims =
        Math.min(user.robotTimeRemain, Math.floor(elapsedMinutes)) - 1;
    }

    const { storedScore, maxScore } = user;
    const newStoredScore = storedScore + numClaims * maxScore;

    await user.updateOne({
      storedScore: newStoredScore,
      lastClaimTimestamp: new Date(),
      robotTimeRemain: user.robotTimeRemain - numClaims, // Ensure non-negative value
    });

    res.sendSuccess(200,"Claim Successfull", {"newStoredScore": newStoredScore});
  } catch (error) {
    console.error("Error processing claim:", error);
    res.sendError(500, "Internal server error");
  }
});
