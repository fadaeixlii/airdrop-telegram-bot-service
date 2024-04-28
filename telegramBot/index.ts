import TelegramBot from "node-telegram-bot-api";
import { connectToDb } from "../utils/connectToDB";
import Users from "../Models/Users";
import { Ranks } from "../Models/Ranks";
import {
  generateReferralCode,
  provideReferralRewards,
  trackReferral,
} from "../utils/userUtils";
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN ?? "", {
  polling: true,
});

bot.onText(/\/invite/, async (msg) => {
  const referralCode = generateReferralCode(); // Implement this function to generate a unique code
  const userId = msg?.from?.id;

  // Save referral code in user document
  await Users.findOneAndUpdate({ telegramId: userId }, { referralCode });

  bot.sendMessage(msg.chat.id, `Your referral code: ${referralCode}`);
});

bot.onText(/\/start/, async (msg) => {});
bot.onText(/\/start(?:\s(.*))?/, async (msg, match) => {
  await connectToDb();

  const referralCode = match ? match[1] : null; // Extract referral code from the command if provided
  const newUserTelegramId = msg.chat?.id;

  try {
    if (referralCode) {
      // If a referral code is provided, find the referring user
      const referringUser = await Users.findOne({ referralCode });

      if (referringUser) {
        // If the referring user is found, track the referral and provide rewards
        await trackReferral(referringUser._id, String(newUserTelegramId));
        await provideReferralRewards(referringUser._id);
      } else {
        bot.sendMessage(msg.chat.id, "Invalid referral code.");
        return;
      }
    }

    // Create the new user in the database
    const { id, username, first_name, last_name } = msg.chat;
    console.log(id, username, first_name, last_name);
    // Check if the user already exists

    const ranks = await Ranks.find({});
    const rankBronze = ranks[0];

    let existingUser = await Users.findOne({ telegramId: id }).populate("rank");
    if (!existingUser) {
      // Create a new user if not exists
      existingUser = await Users.create({
        telegramId: id,
        username,
        firstName: first_name,
        lastName: last_name,
        rank: rankBronze,
      });
    }

    bot.sendMessage(msg.chat.id, "Welcome to the bot!");

    bot.sendMessage(msg.chat.id, "Welcome to the bot!");
  } catch (error) {
    console.error("Error processing start command:", error);
    bot.sendMessage(
      msg.chat.id,
      "An error occurred while processing your request. Please try again later."
    );
  }
});

// Start the bot
bot.on("polling_error", (error) => console.error(error));
