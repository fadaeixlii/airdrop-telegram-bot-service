import express from "express";
import mongoose from "mongoose";
import { isCacheValid, readCache, writeCache } from "../utils/cacheFile";
import Ranks from "../Models/Ranks";
import Users from "../Models/Users";

const router = express.Router();

const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export const topUserPerRank = router.get(
  "/top-users-per-rank",
  async (req, res) => {
    try {
      const cachedData = readCache();

      if (cachedData && isCacheValid(cachedData, CACHE_DURATION_MS)) {
        console.log("Returning cached data");
        return res.status(200).json({
          success: true,
          message: "Top users per rank fetched successfully",
          data: cachedData.data,
        });
      }

      const ranks = await Ranks.find().sort({ minScore: 1 });

      const rankUserPromises = ranks.map(async (rank) => {
        const users = await Users.find({
          storedScore: { $gte: rank.minScore, $lt: rank.maxScore },
        })
          .sort({ storedScore: -1 })
          .limit(300)
          .select(
            "-_id telegramId username firstName lastName storedScore collectedTon"
          );

        return {
          rank: rank.name,
          maxScore: rank.maxScore,
          minScore: rank.minScore,
          users,
        };
      });

      const rankUserData = await Promise.all(rankUserPromises);

      writeCache(rankUserData);

      res.status(200).json({
        success: true,
        message: "Top users per rank fetched successfully",
        data: rankUserData,
      });
    } catch (error) {
      console.error("Error fetching top users per rank:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);
