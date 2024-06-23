import express from "express";
import Users from "../Models/Users";
import TimeLimitBoosts from "../Models/TimeLimitBoost";
import MaxScoreBoosts from "../Models/MaxScoreBoost";

const router = express.Router();

export const purchaseBoost = router.post(
  "/purchase-boost",
  async (req, res) => {
    const { userId, boostType, boostId } = req.body;

    try {
      const user = await Users.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let BoostModel;
      let claimedBoosts;
      let boostEffectField: "timeLimit" | "maxScore";

      if (boostType === "timeLimit") {
        BoostModel = TimeLimitBoosts;
        claimedBoosts = user.claimedTimeLimitBoosts;
        boostEffectField = "timeLimit";
      } else if (boostType === "maxScore") {
        BoostModel = MaxScoreBoosts;
        claimedBoosts = user.claimedMaxScoreBoosts;
        boostEffectField = "maxScore";
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid boost type" });
      }

      const boost = await BoostModel.findById(boostId);

      if (!boost) {
        return res
          .status(404)
          .json({ success: false, message: "Boost not found" });
      }

      // Ensure user has purchased all previous boosts
      const previousBoosts = await BoostModel.find({
        order: { $lt: boost.order },
      });
      const missingBoosts = previousBoosts.filter(
        (previousBoost) => !claimedBoosts.includes(previousBoost._id)
      );

      if (missingBoosts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Must purchase previous boosts first",
        });
      }

      // Check if user has enough stored score to purchase boost
      if (user.storedScore < boost.price) {
        return res
          .status(403)
          .json({ success: false, message: "Insufficient stored score" });
      }

      // Deduct price from user's stored score
      user.storedScore -= boost.price;

      // Apply boost effects to user
      user[boostEffectField] +=
        boostEffectField === "timeLimit" ? -boost.effect : boost.effect;

      // Add boost to claimed boosts
      claimedBoosts.push(boost._id);

      // Save user changes
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

export const availableBoost = router.get(
  "/available-boosts/:userId/:boostType",
  async (req, res) => {
    const { userId, boostType } = req.params;

    try {
      const user = await Users.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      let BoostModel;
      let claimedBoosts;

      if (boostType === "timeLimit") {
        BoostModel = TimeLimitBoosts;
        claimedBoosts = user.claimedTimeLimitBoosts;
      } else if (boostType === "maxScore") {
        BoostModel = MaxScoreBoosts;
        claimedBoosts = user.claimedMaxScoreBoosts;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid boost type" });
      }

      // Find the next available boost
      const nextBoost = await BoostModel.findOne({
        _id: { $nin: claimedBoosts },
      }).sort({ order: 1 });

      if (!nextBoost) {
        return res.status(200).json({
          success: true,
          message: "All boosts claimed",
          availableBoost: null,
        });
      }

      res.status(200).json({
        success: true,
        availableBoost: {
          title: nextBoost?.title,
          effect: nextBoost?.effect,
          price: nextBoost?.price,
          order: nextBoost?.order,
          id: nextBoost?._id,
        },
      });
    } catch (error) {
      console.error("Error fetching available boosts:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export default router;
