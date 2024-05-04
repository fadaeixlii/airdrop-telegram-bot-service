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
  const userId = msg?.from?.id;
  if(userId == null) return;
  const referralCode = `r_${userId}`;
  //generateReferralCode(String(userId)); // Implement this function to generate a unique code
  
  let user = await Users.findOne({ telegramId: userId });

  if (!user) {
    user = new Users({ telegramId: userId, referralCode });
    await user.save();
  } else if (user.referralCode == null || user.referralCode == undefined) {
    user = await Users.findOneAndUpdate({ telegramId: userId }, { referralCode });
  }

  var iKeys = [];
  iKeys.push([{
    text: "Share",
    switch_inline_query: `Invite your friends and get bonuses for each invited friend!🎁\nYour referral link: https://t.me/DemoAirDropMegaWallet1_bot?start=${user?.referralCode}`
  }]);
  bot.sendMessage(msg.chat.id, `\nInvite your friends and get bonuses for each invited friend!🎁\n\nYour referral link: <code>https://t.me/DemoAirDropMegaWallet1_bot?start=${user?.referralCode}</code>`, {parse_mode: 'HTML', reply_markup: {inline_keyboard: iKeys}});
});

bot.onText(/\/start/, async (msg) => { });
bot.onText(/\/start(?:\s(.*))?/, async (msg, match) => {
  await connectToDb();


  const referralLink = match ? match[1] : null; // Extract referral code from the command if provided
  const newUserTelegramId = msg.chat?.id;

  const userId = msg?.from?.id;
  let user = await Users.findOne({ telegramId: userId });

  const pa = user?.parentReferral;
  if (!user) {
    let newRefCode = `r_${userId}`;
    // generateReferralCode(String(userId));

    const { id, username, first_name, last_name } = msg.chat;
    console.log(id, username, first_name, last_name);
    // Check if the user already exists

    const ranks = await Ranks.find({});
    const rankBronze = ranks[0];
    Users.create({
      telegramId: id,
      username,
      firstName: first_name,
      lastName: last_name,
      rank: rankBronze,
      referralCode: newRefCode,
    });


    if (referralLink) {
      const referringUser = await Users.findOne({ referralCode: referralLink });
      if (referringUser) {
        //todo add to parent
        //todo assing reward
        await trackReferral(referringUser._id, newUserTelegramId);
        await provideReferralRewards(referringUser._id);
      }
    }
  }

  bot.sendMessage(msg.chat.id, `Hello ${msg.from?.username}👋\n\n This is DEMO_WALLET\n\nTap And earn Coin.A little bit later you will be very surprised.\n\nGot friends? Invite them to the game. That’s the way you'll both earn even more coins together.\n\nThat’s all you need to know to get started.`);


});

// Start the bot
bot.on("polling_error", (error) => console.error(error));
