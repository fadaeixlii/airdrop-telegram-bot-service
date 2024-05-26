import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import { connectToDb } from "./utils/connectToDB";
import { claimRoute } from "./routes/claim";
import ResponseHandler from "./routes/ResponseHandler";

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

const app = express();
// const server = http.createServer(app);

app.use(json());
// RunSocket(server);

app.use(ResponseHandler);
app.use(claimRoute);
app.use(rankRoute);
app.use(userInfoRoute);
app.use(getUserId);
app.use(purchaseRobotRoute);
app.use(purchaseBoostRoute);

app.listen(process.env.PORT ?? "7002", async () => {
  await connectToDb();
  console.log(`Server is running on port ${process.env.PORT ?? "7002"}`);
});

cron.schedule("0 0 * * *", async () => {
  try {
    const userState = await UserState.findOne({});
    if (userState) {
      userState.newUsersIn24h = 0;
      userState.lastUpdated = new Date();
      await userState.save();
    } else {
      await UserState.create({ totalScore: 0, userCount: 0, newUsersIn24h: 0 });
    }
    console.log("User state reset successfully.");
  } catch (error) {
    console.error("Error resetting user state:", error);
  }
});
