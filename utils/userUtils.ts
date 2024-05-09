import Users, { User } from "../Models/Users";

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
    } else {
      console.error("Referring user not found.");
    }
  } catch (error) {
    console.error("Error providing referral rewards:", error);
    throw error;
  }
};

export function getUserInfoAndScore(user: User): UserInfoAndScore {
  const now = new Date();
  const lastClaimTime = user.lastClaimTimestamp || now;
  const timeDifference =
    (now.getTime() - lastClaimTime.getTime()) / (1000 * 60); // Difference in minutes

  let currentScore = user.score;
  if (timeDifference <= user.timeLimit) {
    // Calculate score based on time difference and max score
    currentScore = Math.floor(
      (timeDifference / user.timeLimit) * user.maxScore
    );
  } else {
    // If time limit exceeded, set current score to max score
    currentScore = user.maxScore;
  }

  return { score: currentScore, maxScore: user.maxScore };
}
