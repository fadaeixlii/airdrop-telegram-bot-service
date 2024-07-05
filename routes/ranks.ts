import express from "express";
import Tasks from "../Models/Task";
import Users, { IUser } from "../Models/Users";
import { checkTelegramSubscription } from "../utils/taskUtil";
import Ranks, { IRanks } from "../Models/Ranks";

const router = express.Router();

export const claimRank = router.post("/claim-rank", async (req, res) => {
  const { userId, rankId } = req.body;

  try {
    const user: IUser | null = await Users.findById(userId)
      .populate("rank")
      .populate("parentReferral");
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Add the score to the stored score

    // Fetch all ranks where maxScore is less than or equal to user's storedScore
    const rank: IRanks | null = await Ranks.findById(rankId);
    if (!rank) {
      return res.status(404).send("Rank not found");
    }

    // Check if the user has already claimed this rank
    if (!user.claimedRanks.includes(rank._id)) {
      // Award the user
      user.storedScore += rank.reward;
      user.claimedRanks.push(rank._id);
      await user.save();
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

export const rankList = router.get("/rank-list/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the user by their ID
    const user: IUser | null = await Users.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Fetch all ranks from the database
    const ranks: IRanks[] = await Ranks.find().sort({ maxScore: 1 });

    // Filter out the ranks that the user has already claimed
    const unclaimedRanks = [...ranks];

    // Send the filtered ranks in the response
    res.status(200).send(
      unclaimedRanks.map((unClaimed) => ({
        name: unClaimed.name,
        minScore: unClaimed.minScore,
        maxScore: unClaimed.maxScore,
        reward: unClaimed.reward,
        id: unClaimed._id,
        isCompleted: user.claimedRanks.includes(unClaimed._id),
      }))
    );
  } catch (error) {
    console.error("Error fetching rank list:", error);
    res.status(500).send({
      message:
        "An error occurred while fetching the rank list. Please try again later.",
      error: error,
    });
  }
});
