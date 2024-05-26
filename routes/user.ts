import express from "express";
import Users, { IUser } from "./../Models/Users";
import Robots, { IRobot } from "../Models/Robots";
import { isMongoConnected } from "../utils/connectToDB";
import { IRanks } from "../Models/Ranks";

const router = express.Router();

// Middleware specific to these routes
router.use((req, res, next) => {
  if (isMongoConnected()) next();
  else {
    res.sendError(405, "Something Bad Happended");
    return;
  }
});

export const getUserId = router.get(
  "/user/telegram/:telegramId",
  async (req, res) => {
    const telegramId = parseInt(req.params.telegramId, 10);

    if (isNaN(telegramId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid telegramId" });
    }

    try {
      const user = await Users.findOne({ telegramId });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res
        .status(200)
        .json({
          success: true,
          data: { userId: user._id, telegramId: user.telegramId },
        });
    } catch (error) {
      console.error("Error fetching user by telegramId:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export const userInfoRoute = router.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await Users.findById(userId)
      .populate<{ rank: IRanks }>("rank")
      .populate<{ referrals: IUser[] }>("referrals")
      .populate<{ parentReferral: IUser }>("parentReferral")
      .populate<{ robot: IRobot }>("robot");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userData = {
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
      rank: user.rank,
      storedScore: user.storedScore,
      maxScore: user.maxScore,
      referrals: user.referrals,
      parentReferral: user.parentReferral,
      robot: user.robot,
      robotTimeRemain: user.robotTimeRemain,
      lastClaimTimestamp: user.lastClaimTimestamp,
      timeLimit: user.timeLimit,
      userMaxScorePrice: user.userMaxScorePrice,
      userTimeLimitPrice: user.userTimeLimitPrice,
      maxScoreMaxBoostCount: user.maxScoreMaxBoostCount,
      timeLimitMaxBoostCount: user.timeLimitMaxBoostCount,
      nextRankScore: user.nextRankScore,
    };

    res.status(200).json({
      success: true,
      message: "User Info Successfully fetched",
      data: userData,
    });
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
        return res.sendError(404, "User or robot not found");
      }

      if (user.storedScore < robot.price) {
        return res.sendError(404, "Insufficient stored score");
      }

      await user.updateOne({
        robot: robot,
        robotTimeRemain: user.robotTimeRemain + robot.claimCount,
      });

      res.sendSuccess(200, "Robot purchased successfully");
    } catch (error) {
      console.error("Error purchasing robot:", error);
      res.sendError(505, "Internal server error");
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
        return res.sendError(404, "User not found");
      }

      let boostPrice = 0;
      let boostEffect = 0;
      if (boostType === "maxScore") {
        if (user.maxScoreMaxBoostCount <= 0)
          return res.sendError(401, "You Have Reached Maximum");
        user.maxScoreMaxBoostCount--;
        boostPrice = user.userMaxScorePrice;
        boostEffect = Number(process.env.MAX_SCORE_BOOST_EFFECT) ?? 5; // Increase maxScore by 5
        user.userMaxScorePrice *=
          Number(process.env.USER_MAX_SCORE_PRICE_COEFFICIENT) ?? 1.1; // Increase boost price for next purchase
      } else if (boostType === "timeLimit") {
        if (user.timeLimitMaxBoostCount <= 0)
          return res.sendError(401, "You Have Reached Maximum");
        user.timeLimitMaxBoostCount--;
        boostPrice = user.userTimeLimitPrice;
        boostEffect = Number(process.env.TIME_LIMIT_BOOST_EFFECT) ?? -0.25; // Decrease timeLimit by 0.25
        user.userTimeLimitPrice *=
          Number(process.env.USER_MAX_SCORE_PRICE_COEFFICIENT) ?? 1.1; // Increase boost price for next purchase
      } else {
        return res.sendError(400, "Invalid boost type");
      }

      if (user.storedScore < boostPrice) {
        return res.sendError(403, "Insufficient stored score");
      }

      user.storedScore -= boostPrice;

      if (boostType === "maxScore") {
        user.maxScore += boostEffect;
      } else if (boostType === "timeLimit") {
        user.timeLimit += boostEffect;
      }

      await user.save();

      res.sendSuccess(200, "Purchase Boost Completed");
      // res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("Error purchasing boost:", error);
      res.sendError(500, "Internal server error");
    }
  }
);

export default router;
