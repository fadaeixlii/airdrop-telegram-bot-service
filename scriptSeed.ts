import mongoose from "mongoose";
import { connectToDb } from "./utils/connectToDB";
import { Rewards } from "./Models/Rewards";
import { Ranks } from "./Models/Ranks";

// Define rewards data
const rewardsData = [
  { name: "Bronze Reward", amount: 10 },
  { name: "Silver Reward", amount: 20 },
  { name: "Gold Reward", amount: 30 },
];

// Define ranks data
const ranksData = [
  { name: "Bronze", minScore: 0, maxScore: 100 },
  { name: "Silver", minScore: 101, maxScore: 200 },
  { name: "Gold", minScore: 201, maxScore: Infinity }, // Adjust maxScore as needed
];

// Connect to MongoDB

const main = async () => {
  await connectToDb();
  console.log("Connected to MongoDB");

  // Create rewards
  await Rewards.insertMany(rewardsData);
  console.log("Rewards seeded successfully");

  // Retrieve reward IDs
  const rewards = await Rewards.find();
  const rewardIds = rewards.map((reward) => reward._id);

  // Assign rewards to ranks
  ranksData.forEach(async (rankData, index) => {
    const rank = await Ranks.create({
      ...rankData,
      reward: rewardIds[index], // Assign reward to each rank
    });
    console.log(`Rank ${rank.name} seeded successfully`);
  });

  console.log("All data seeded successfully");
};
main();
