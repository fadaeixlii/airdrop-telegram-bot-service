import TelegramBot from "node-telegram-bot-api";
import { connectToDb } from "../utils/connectToDB";
import Users from "../Models/Users";
import {
  addUserIfExist,
  generateInviteMsg,
  sendMessageToUser,
} from "../utils/userUtils";

export const bot = new TelegramBot(
  "7364074459:AAFd_etj17SEEEIi980Ux-oJvlSSaTLQA3Q",
  {
    polling: true,
  }
);

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

  const a = [
    [
      {
        text: "Share",
        switch_inline_query: generateInviteMsg(user?.referralCode ?? ""),
      },
    ],
  ];

  await sendMessageToUser(
    bot,
    msg.chat.id,
    generateInviteMsg(user?.referralCode ?? "", true),
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Share",
              switch_inline_query: generateInviteMsg(user?.referralCode ?? ""),
            },
          ],
        ],
      },
    }
  );
});

bot.onText(/\/start(?:\s(.*))?/, async (msg, match) => {
  await connectToDb();

  const referralLink = match ? match[1] : null; // Extract referral code from the command if provided

  const { id, username, first_name, last_name } = msg.chat;
  const user = await addUserIfExist(
    id,
    username,
    first_name,
    last_name,
    referralLink
  );

  await sendMessageToUser(
    bot,
    msg.chat.id,
    `Hey ${msg.from?.username}! 🌟 Discover OpaliFi – your ultimate hub for seamless digital asset management! 🚀

    With OpaliFi's Mega Wallet, you can trade, invest, and grow without the hassle of moving your assets around. Whether it's DeFi, CeFi, or the latest investment opportunities, it's all right at your fingertips. 📱
    
    Exciting news! 🎉 Start earning points by participating and be ready to unlock amazing rewards. Who knows what treasures await you with your points! 💰
    
    Got friends? Bring them along! The more, the merrier! 🌱 Let’s grow together and make the most out of every opportunity with OpaliFi.
    
    Join us and experience where seamless finance meets endless possibilities! 🌟`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Play",
              url: "https://t.me/OpaliFibot/OpaliFiApp",
            },
          ],
          [
            {
              text: "Join community",
              url: "t.me/OpaliFi",
            },
          ],
        ],
      },
    }
  );
});

// Start the bot
bot.on("polling_error", (error) => console.error(error));
