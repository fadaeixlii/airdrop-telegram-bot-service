import express from "express";
import Users, { User } from "./../Models/Users";
import { UserInfoAndScore, getUserInfoAndScore } from "../utils/userUtils";
import Robots from "../Models/Robots";

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

    const userInfoAndScore: UserInfoAndScore = getUserInfoAndScore(user);

    const userData: Partial<User> = {
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
      rank: user.rank,
      score: userInfoAndScore.score,
      maxScore: userInfoAndScore.maxScore,
    };

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error("Error fetching user score:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export const purchaseRobotRoute = router.post(
  "/:userId/purchase-robot/:robotId",
  async (req, res) => {
    const userId = req.params.userId;
    const robotId = req.params.robotId;

    try {
      const user = await Users.findById(userId);
      const robot = await Robots.findById(robotId);

      if (!user || !robot) {
        return res
          .status(404)
          .json({ success: false, message: "User or robot not found" });
      }

      if (user.storedScore < robot.price) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient stored score" });
      }

      await user.updateOne({
        robot: robot,
        robotTimeRemain: user.robotTimeRemain + robot.claimCount,
      });

      res
        .status(200)
        .json({ success: true, message: "Robot purchased successfully" });
    } catch (error) {
      console.error("Error purchasing robot:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);
export const purchaseBoostRoute = router.post(
  "/purchase-boost/:userId",
  async (req, res) => {
    const userId = req.params.userId;
    const boostType = req.body.boostType; // "maxScore" or "timeLimit"

    try {
      const user = await Users.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let boostPrice = 0;
      let boostEffect = 0;
      if (boostType === "maxScore") {
        boostPrice = user.userMaxScorePrice;
        boostEffect = Number(process.env.MAX_SCORE_BOOST_EFFECT) ?? 5; // Increase maxScore by 5
        user.userMaxScorePrice *=
          Number(process.env.USER_MAX_SCORE_PRICE_COEFFICIENT) ?? 1.1; // Increase boost price for next purchase
      } else if (boostType === "timeLimit") {
        boostPrice = user.userTimeLimitPrice;
        boostEffect = Number(process.env.TIME_LIMIT_BOOST_EFFECT) ?? -0.25; // Decrease timeLimit by 0.25
        user.userTimeLimitPrice *=
          Number(process.env.USER_MAX_SCORE_PRICE_COEFFICIENT) ?? 1.1; // Increase boost price for next purchase
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid boost type" });
      }

      if (user.storedScore < boostPrice) {
        return res
          .status(403)
          .json({ success: false, message: "Insufficient stored score" });
      }

      user.storedScore -= boostPrice;

      if (boostType === "maxScore") {
        user.maxScore += boostEffect;
      } else if (boostType === "timeLimit") {
        user.timeLimit += boostEffect;
      }

      await user.save();

      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("Error purchasing boost:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export default router;
