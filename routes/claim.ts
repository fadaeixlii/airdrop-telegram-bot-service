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

    // Check if last claim was made more than 10 minutes ago
    if (
      user.lastClaimTimestamp &&
      Date.now() - user.lastClaimTimestamp.getTime() < 10 * 60 * 1000
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only claim once every 10 minutes",
      });
    }

    // Perform the claim operation
    const { storedScore, maxScore } = user;
    const newStoredScore = storedScore + maxScore;

    // Update the user's score and last claim timestamp
    await user.updateOne({
      storedScore: newStoredScore,
      lastClaimTimestamp: new Date(),
    });

    res.status(200).json({ success: true, newStoredScore });
  } catch (error) {
    console.error("Error processing claim:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
