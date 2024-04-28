import express from "express";
import { json } from "body-parser";
import { connectToDb } from "./utils/connectToDB";
import http from "http";
import { claimRoute } from "./routes/claim";
import cron from "node-cron";
import Users from "./Models/Users";
import dotenv from "dotenv";

dotenv.config();
import "./telegramBot/index";
const app = express();
// const server = http.createServer(app);

app.use(json());
// RunSocket(server);

app.use(claimRoute);

app.listen(process.env.PORT ?? "7001", async () => {
  await connectToDb();
  console.log(`Server is running on port ${process.env.PORT ?? "7001"}`);
});

cron.schedule(process.env.CRON_SCHEDULE ?? "*/10 * * * * *", async () => {
  try {
    await connectToDb();

    // Find all users in the database
    const allUsers = await Users.find({});

    // Update the score of each user by increasing it by 1
    for (const user of allUsers) {
      if (user.score + 1 !== user.maxScore)
        await Users.findByIdAndUpdate(user._id, { $inc: { score: 1 } });
    }

    console.log("Scores updated for all users.");
  } catch (error) {
    console.error("Error updating scores for users:", error);
  }
});
