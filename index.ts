import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import { connectToDb } from "./utils/connectToDB";
import { claimRoute } from "./routes/claim";
import ResponseHandler from "./routes/ResponseHandler";

import {
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

const app = express();
// const server = http.createServer(app);

app.use(json());
// RunSocket(server);


app.use(ResponseHandler);
app.use(claimRoute);
app.use(rankRoute);
app.use(userInfoRoute);
app.use(purchaseRobotRoute);
app.use(purchaseBoostRoute);

app.listen(process.env.PORT ?? "7002", async () => {
  await connectToDb();
  console.log(`Server is running on port ${process.env.PORT ?? "7002"}`);
});
