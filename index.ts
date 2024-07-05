import express from "express";
import { json } from "body-parser";
import { connectToDb } from "./utils/connectToDB";
import { claimRoute } from "./routes/claim";
import ResponseHandler from "./routes/ResponseHandler";
import cors from "cors";
import {
  getUserId,
  purchaseBoostRoute,
  purchaseRobotRoute,
  userInfoRoute,
} from "./routes/user";
import cron from "node-cron";
import Users from "./Models/Users";
import dotenv from "dotenv";

dotenv.config();
import "./telegramBot/index";
import { rankRoute } from "./routes/rank";
import UserState from "./Models/UserState";
import { getProfileImage } from "./routes/profileImage";
import { completeTask, getUserTasks, verifyTask } from "./routes/task";
import { check } from "./utils/taskUtil";
import { claimRank, rankList } from "./routes/ranks";
import {
  claimReferralReward,
  unclaimedReferralReward,
} from "./routes/referral";
import { availableBoost, purchaseBoost } from "./routes/boost";
import { topUserPerRank } from "./routes/userRanks";

const app = express();
// const server = http.createServer(app);
app.use(cors());
app.use(json());
// RunSocket(server);

app.use(ResponseHandler);
app.use(claimRoute);
app.use(rankRoute);
app.use(userInfoRoute);
app.use(getUserId);
app.use(purchaseRobotRoute);
app.use(purchaseBoostRoute);
app.use(getProfileImage);
app.use(getUserTasks);
app.use(completeTask);
app.use(verifyTask);
app.use(check);
app.use(claimRank);
app.use(rankList);
app.use(claimReferralReward);
app.use(unclaimedReferralReward);
app.use(purchaseBoost);
app.use(availableBoost);
app.use(topUserPerRank);

app.listen(process.env.PORT ?? "7002", async () => {
  await connectToDb();
  console.log(`Server is running on port ${process.env.PORT ?? "7002"}`);
});

cron.schedule("0 0 * * *", async () => {
  try {
    const userState = await UserState.findOne({});
    if (userState) {
      userState.newUsersIn24h = 0;
      userState.lastUpdated = new Date().getTime();
      await userState.save();
    } else {
      await UserState.create({ totalScore: 0, userCount: 0, newUsersIn24h: 0 });
    }
    console.log("User state reset successfully.");
  } catch (error) {
    console.error("Error resetting user state:", error);
  }
});
