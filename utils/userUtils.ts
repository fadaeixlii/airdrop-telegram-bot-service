import Users, { IUser } from "../Models/Users";
import { Ranks } from "../Models/Ranks";
import UserState from "../Models/UserState";
import TelegramBot, { SendMessageOptions } from "node-telegram-bot-api";
export interface UserInfoAndScore {
  score: number;
  maxScore: number;
}

// Function to generate a unique referral code
/* export const generateReferralCode = async (telegramId: string): Promise<string> => {
  // Encode the message as a Uint8Array
  const msgUint8 = new TextEncoder().encode(telegramId);
  
  // Calculate the SHA-1 hash
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  
  // Convert the hash buffer to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}; */

export async function addUserIfExist(
  telId: number,
  userName: string | undefined,
  firstName: string | undefined,
  lastName: string | undefined,
  referralId: string | null
) {
  let user = await Users.findOne({ telegramId: telId });
  if (!user) {
    const ranks = await Ranks.find({});
    const rankBronze = ranks[0];
    let newRefCode = `r_${telId}`;
    user = await Users.create({
      telegramId: telId,
      username: userName,
      firstName: firstName,
      lastName: lastName,
      rank: rankBronze,
      referralCode: newRefCode,
    });

    if (referralId) {
      const referringUser = await Users.findOne({ referralCode: referralId });
      if (referringUser) {
        //todo add to parent
        //todo assing reward
        await trackReferral(referringUser._id, telId);
        await provideReferralRewards(referringUser._id);
        user.storedScore += 1000;
        await user.save();
      }
    }

    const userState = await UserState.findOne({});
    if (userState) {
      userState.userCount += 1;
      userState.newUsersIn24h += 1;
      await userState.save();
    } else {
      await UserState.create({ totalScore: 0, userCount: 1, newUsersIn24h: 1 });
    }
  }
  return user;
}

export async function generateReferralCode(message: string) {
  // Encode the message as a Uint8Array
  const msgUint8 = new TextEncoder().encode(message);

  // Calculate the SHA-1 hash
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);

  // Convert the hash buffer to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

export const isReferralCodeExist = async (code: string): Promise<boolean> => {
  let user = await Users.findOne({ referralCode: code });
  return user != null || user != undefined;
};

// Function to track a referral
export const trackReferral = async (
  referringUserId: string,
  referredUserId: number
): Promise<void> => {
  try {
    const parentUser = await Users.findById(referringUserId);
    const childUser = await Users.findOne({ telegramId: referredUserId });
    await Users.updateOne(
      { telegramId: referredUserId }, // Filter to find the childUser
      { $set: { parentReferral: parentUser?.id } } // Update parentReferral field
    );
    parentUser?.referrals.push(childUser?.id);
    parentUser?.save();
  } catch (error) {
    console.error("Error tracking referral:", error);
    throw error;
  }
};

// Function to provide referral rewards
export const provideReferralRewards = async (
  referringUserId: string
): Promise<void> => {
  try {
    // Implement your logic to provide rewards to the referring user here
    // For example, increase their score, unlock rewards, etc.
    // You can access the referring user document using the referringUserId
    const referringUser = await Users.findById(referringUserId);
    if (referringUser) {
      // Update the referring user's score or provide rewards as needed
      // Example: await Users.findByIdAndUpdate(referringUserId, { $inc: { score: 10 } });
      console.log(`Referral rewards provided to user: ${referringUserId}`);
      referringUser.storedScore += 1000;
      await referringUser.save();
    } else {
      console.error("Referring user not found.");
    }
  } catch (error) {
    console.error("Error providing referral rewards:", error);
    throw error;
  }
};

export async function giveRankReward(
  storedScore: number
): Promise<[number, number, number, number | null] | null> {
  const ranks = await Ranks.find({});
  let rewardFromRank = 0;
  for (const itRank of ranks) {
    console.log("rewardFromRank", rewardFromRank);
    if (storedScore > itRank.maxScore) {
      rewardFromRank += itRank.reward;
      return [
        storedScore + itRank.reward,
        itRank.maxScore,
        rewardFromRank,
        itRank.reward,
      ];
    } else rewardFromRank += itRank.reward;
  }

  // If no rank matches the storedScore, return null or handle it accordingly
  return [storedScore, ranks[ranks.length - 1].maxScore, rewardFromRank, null];
}

export async function sendMessageToUser(
  bot: TelegramBot,
  userId: number,
  msg: string,
  options?: SendMessageOptions
) {
  await bot.sendMessage(userId, msg, options);
}

export function generateInviteMsg(
  code: string,
  makeCopiable: boolean = false
): string {
  let link = `\nhttps://t.me/DemoAirDropMegaWallet1_bot?start=${code}`;
  if (makeCopiable) {
    link = `\n<code>${link}</code>`;
  }
  return `Invite your friends and get bonuses for each invited friend!🎁\nYour referral link: ${link}`;
}
