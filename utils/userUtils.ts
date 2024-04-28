import Users from "../Models/Users";

// Function to generate a unique referral code
export const generateReferralCode = (): string => {
  // Generate a random alphanumeric string as the referral code
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const referralCodeLength = 6; // Length of the referral code
  let referralCode = "";
  for (let i = 0; i < referralCodeLength; i++) {
    referralCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return referralCode;
};

// Function to track a referral
export const trackReferral = async (
  referringUserId: string,
  referredUserId: string
): Promise<void> => {
  try {
    // Update the referring user document to track the referral
    await Users.findByIdAndUpdate(referringUserId, {
      $push: { referrals: referredUserId },
    });
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
