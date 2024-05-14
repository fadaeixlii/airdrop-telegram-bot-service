import express from "express";
import Users from "../Models/Users";

const router = express.Router();

export const claimRoute = router.post("/claim", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (
      user.lastClaimTimestamp &&
      Date.now() - user.lastClaimTimestamp.getTime() <
        user.timeLimit * 60 * 1000
    ) {
      return res.status(403).json({
        success: false,
        message: `You can only claim once every ${user.timeLimit} minutes`,
      });
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

    // add new timestamp
    res.status(200).json({ success: true, newStoredScore });
  } catch (error) {
    console.error("Error processing claim:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
