import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import Users from "./Models/Users";
import { connectToDb } from "./utils/connectToDB";

export const bot = new TelegramBot(
  "7364074459:AAFd_etj17SEEEIi980Ux-oJvlSSaTLQA3Q",
  {
    polling: true,
  }
);

connectToDb();

const updateUsersAndSendMessage = async () => {
  try {
    const users = await Users.find();

    for (const user of users) {
      if (user.storedScore > 0) {
        user.storedScore += 1000000;
        await user.save();

        const message = `Congratulations 🎉 
        you have won a million OPA, you can check your balance inside the robot`;
        await bot.sendMessage(user.telegramId, message);

        console.log(`Updated and notified user ${user.telegramId}`);
      }
    }

    console.log("All users have been updated and notified.");
  } catch (error) {
    console.error("Error updating users and sending messages:", error);
  } finally {
    mongoose.connection.close();
  }
};

updateUsersAndSendMessage();
