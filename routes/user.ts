import express from "express";
import Users, { IUser } from "./../Models/Users";
import Robots, { IRobot } from "../Models/Robots";
import { isMongoConnected } from "../utils/connectToDB";
import { IRanks } from "../Models/Ranks";
import { addUserIfExist } from "../utils/userUtils";

const router = express.Router();

// Middleware specific to these routes
router.use((req, res, next) => {
  if (isMongoConnected()) next();
  else {
    res.sendError(405, "Something Bad Happended");
    return;
  }
});

export const getUserId = router.post(
  "/user/telegram/:telegramId",
  async (req, res) => {
    const telegramId = parseInt(req.params.telegramId, 10);
    const username = req.body.username;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;

    if (isNaN(telegramId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid telegramId" });
    }

    try {
      let user = await Users.findOne({ telegramId: +req.params.telegramId });
      if (!user) {
        user = await addUserIfExist(
          telegramId,
          username,
          first_name,
          last_name,
          null
        );
      }

      res.status(200).json({
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

    const NowDate = new Date();

    if (user.profitPerHour > 0 && user.lastTimeCallApi) {
      const elapsedTime =
        (NowDate.getTime() - user.lastTimeCallApi) / (1000 * 60 * 60); // elapsed time in hours
      user.storedScore += user.profitPerHour * elapsedTime;
    }

    user.lastTimeCallApi = NowDate.getTime();
    await user.save();

    const canClaim = !(
      user.lastClaimTimestamp &&
      NowDate.getTime() - user.lastClaimTimestamp < user.timeLimit * 60 * 1000
    );
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
      lastClaimTimestamp: user?.lastClaimTimestamp ?? null,
      timeLimit: user.timeLimit,
      userMaxScorePrice: user.userMaxScorePrice,
      userTimeLimitPrice: user.userTimeLimitPrice,
      maxScoreMaxBoostCount: user.maxScoreMaxBoostCount,
      timeLimitMaxBoostCount: user.timeLimitMaxBoostCount,
      nextRankScore: user.nextRankScore,
      completedTasks: user.completedTasks,
      canClaim,
      profitPerHour: user.profitPerHour,
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

      // have threshold for max boost
      if (boostType === "maxScore") {
        if (user.maxScoreMaxBoostCount <= 0)
          return res.sendError(401, "You Have Reached Maximum");
        const n = 21 - user.maxScoreMaxBoostCount;
        user.maxScoreMaxBoostCount--;
        boostPrice = parseInt(user.userMaxScorePrice.toFixed(0));
        boostEffect = 10; // Increase maxScore by 5
        user.userMaxScorePrice = Math.ceil((80 * Math.pow(1.2, n)) / 5) * 5;
      } else if (boostType === "timeLimit") {
        if (user.timeLimitMaxBoostCount <= 0)
          return res.sendError(401, "You Have Reached Maximum");
        const n = 21 - user.timeLimitMaxBoostCount;
        user.timeLimitMaxBoostCount--;

        boostPrice = parseInt(user.userTimeLimitPrice.toFixed(0));
        boostEffect = -6; // Increase maxScore by 5
        user.userTimeLimitPrice = Math.ceil((80 * Math.pow(1.2, n)) / 5) * 5;
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
