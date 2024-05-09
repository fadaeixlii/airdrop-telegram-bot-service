import express from "express";
import Users, { User } from "./../Models/Users";
import { UserInfoAndScore, getUserInfoAndScore } from "../utils/userUtils";

const router = express.Router();

export const userInfoRoute = router.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Calculate user info and score
    const userInfoAndScore: UserInfoAndScore = getUserInfoAndScore(user);

    // Prepare user data to return
    const userData: Partial<User> = {
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
      rank: user.rank,
      score: userInfoAndScore.score, // Include the calculated score
      maxScore: userInfoAndScore.maxScore,
    };

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error("Error fetching user score:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
