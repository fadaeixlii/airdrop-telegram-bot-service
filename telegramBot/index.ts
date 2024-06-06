import TelegramBot from "node-telegram-bot-api";
import { connectToDb } from "../utils/connectToDB";
import Users from "../Models/Users";
import {
  addUserIfExist, generateInviteMsg,
   sendMessageToUser,
} from "../utils/userUtils";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN ?? "", {
  polling: true,
});

bot.onText(/\/invite/, async (msg) => {
  const userId = msg?.from?.id;
  if (userId == null) return;
  const referralCode = `r_${userId}`;

  let user = await Users.findOne({ telegramId: userId });

  if (!user) {
    user = new Users({ telegramId: userId, referralCode });
    await user.save();
  } else if (user.referralCode == null) {
    user = await Users.findOneAndUpdate(
      { telegramId: userId },
      { referralCode }
    );
  }

    const a = [[
        {
            text: "Share",
            switch_inline_query: generateInviteMsg(user?.referralCode ?? ""),
        },
    ]]

  await sendMessageToUser(
      bot,
      msg.chat.id,
      generateInviteMsg(user?.referralCode ?? "", true),
      {
        parse_mode: "HTML",
        reply_markup: {
        inline_keyboard:
            [[
              {
                text: "Share",
                switch_inline_query: generateInviteMsg(user?.referralCode ?? ""),
              },
            ]]
      }
      }
      );

});

bot.onText(/\/start(?:\s(.*))?/, async (msg, match) => {
  await connectToDb();

  const referralLink = match ? match[1] : null; // Extract referral code from the command if provided

  const { id, username, first_name, last_name } = msg.chat;
  const user = await addUserIfExist(id,username, first_name, last_name, referralLink);

  await sendMessageToUser(
      bot,
      msg.chat.id,
      `Hello ${msg.from?.username}👋\n\n This is DEMO_WALLET\n\nTap And earn Coin.A little bit later you will be very surprised.\n\nGot friends? Invite them to the game. That’s the way you'll both earn even more coins together.\n\nThat’s all you need to know to get started.`,
      {
            reply_markup: {
        inline_keyboard:
            [[
                {
                    text: "Play",
                    url: "https://t.me/DemoAirDropMegaWallet1_bot/Opalifi"
                },
            ]]
    }
    }
  );

});

// Start the bot
bot.on("polling_error", (error) => console.error(error));

