import express from "express";
import Users from "../Models/Users";
import { isMongoConnected } from "../utils/connectToDB";
import { Ranks } from "../Models/Ranks";

const router = express.Router();

// Middleware specific to these routes
router.use((req, res, next) => {
  if (isMongoConnected()) next();
  else {
    res.sendError(405, "Something Bad Happended");
    return;
  }
});

export const rankRoute = router.post("/admin/addRank", async (req, res) => {
  const NameRank = req.body.name;
  const minScoreRank = req.body.minScore;
  const maxScoreRank = req.body.maxScore;
  const rewardRank = req.body.reward;

  if (NameRank && minScoreRank && maxScoreRank && rewardRank) {
    if (
      typeof minScoreRank != "number" ||
      typeof maxScoreRank != "number" ||
      typeof rewardRank != "number"
    ) {
      return res.sendError(403, "Parameters are  InCorrect");
    }
  } else {
    return res.sendError(403, "Parameters are InCorrect");
  }

  try {
    if (minScoreRank >= maxScoreRank) {
      return res.sendError(403, "minScore can not be more than maxScore");
    } else {
      const ranks = await Ranks.find({});

      for (const itRank of ranks) {
        if (
          (minScoreRank >= itRank.minScore &&
            maxScoreRank <= itRank.maxScore) ||
          (maxScoreRank >= itRank.minScore &&
            maxScoreRank <= itRank.maxScore) ||
          (itRank.minScore >= minScoreRank && itRank.maxScore <= maxScoreRank)
        ) {
          return res.sendError(
            403,
            "Logical Problem \n overlaping data records"
          );
        }
      }
    }

    const itNewRank = {
      name: NameRank,
      minScore: minScoreRank,
      maxScore: maxScoreRank,
      reward: rewardRank,
    };
    Ranks.create(itNewRank);
    return res.sendSuccess(200, "Rank Created Successfully", itNewRank);
  } catch (error) {
    console.error("Error Creating Rank:", error);
    return res.sendError(500, "Error Creating Rank");
  }
});
