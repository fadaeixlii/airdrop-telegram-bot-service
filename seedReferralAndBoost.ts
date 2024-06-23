import mongoose from "mongoose";
import ReferralRewards, { IReferralReward } from "./Models/ReferralReward";
import TimeLimitBoosts, { ITimeLimitBoost } from "./Models/TimeLimitBoost";
import MaxScoreBoosts from "./Models/MaxScoreBoost";

// Connect to your MongoDB
mongoose.connect(
  process.env.MONGODB_URL_SERVER ??
    "mongodb://userMega:LPmCvJtcWmZo@89.106.206.59:27017/demo_airdrop"
  // "mongodb://userMega:USER)(Mega123!@107.189.16.134:27017/demo_airdrop"
);

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

const referralRewards = [
  { title: "Invite 1 friend", rewardValue: 100, referralsNeeded: 1 },
  { title: "Invite 3 friends", rewardValue: 500, referralsNeeded: 3 },
  { title: "Invite 10 friends", rewardValue: 2000, referralsNeeded: 10 },
  { title: "Invite 30 friends", rewardValue: 6000, referralsNeeded: 30 },
  { title: "Invite 100 friends", rewardValue: 200000, referralsNeeded: 100 },
  { title: "Invite 500 friends", rewardValue: 1000000, referralsNeeded: 500 },
  { title: "Invite 1000 friends", rewardValue: 2000000, referralsNeeded: 1000 },
  { title: "Invite 2000 friends", rewardValue: 4000000, referralsNeeded: 2000 },
];

const timeLimitBoosts = [
  { title: "Time Limit Boost 1", effect: 120, price: 1000, order: 1 },
  { title: "Time Limit Boost 2", effect: 120, price: 2000, order: 2 },
  { title: "Time Limit Boost 3", effect: 60, price: 4000, order: 3 },
  { title: "Time Limit Boost 4", effect: 60, price: 8000, order: 4 },
  { title: "Time Limit Boost 5", effect: 60, price: 15000, order: 5 },
];

const maxScoreBoosts = [
  { title: "Max Score Boost 1", effect: 20, price: 1200, order: 1 },
  { title: "Max Score Boost 2", effect: 20, price: 2500, order: 2 },
  { title: "Max Score Boost 3", effect: 40, price: 5000, order: 3 },
  { title: "Max Score Boost 4", effect: 80, price: 10000, order: 4 },
  { title: "Max Score Boost 5", effect: 50, price: 20000, order: 5 },
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await ReferralRewards.deleteMany({});
    await TimeLimitBoosts.deleteMany({});
    await MaxScoreBoosts.deleteMany({});

    // Insert seed data
    await ReferralRewards.insertMany(referralRewards);
    await TimeLimitBoosts.insertMany(timeLimitBoosts);
    await MaxScoreBoosts.insertMany(maxScoreBoosts);

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
