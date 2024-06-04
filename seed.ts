import mongoose from "mongoose";
import Ranks, { IRanks } from "./Models/Ranks";
import Robots, { IRobot } from "./Models/Robots";
import { connectToDb } from "./utils/connectToDB";
import Tasks from "./Models/Task";

const seedDatabase = async () => {
  await connectToDb();

  // Clear existing data
  await Ranks.deleteMany({});
  await Robots.deleteMany({});
  await Tasks.deleteMany({});

  // Seed Ranks
  const ranksData = [
    { name: "Rank 1", minScore: 0, maxScore: 100, reward: 10 },
    { name: "Rank 2", minScore: 100, maxScore: 500, reward: 20 },
    { name: "Rank 3", minScore: 500, maxScore: 1000, reward: 30 },
    { name: "Rank 4", minScore: 1000, maxScore: 2000, reward: 40 },
    { name: "Rank 5", minScore: 2000, maxScore: 5000, reward: 50 },
    { name: "Rank 6", minScore: 5000, maxScore: 10000, reward: 60 },
    { name: "Rank 7", minScore: 10000, maxScore: 15000, reward: 70 },
    { name: "Rank 8", minScore: 15000, maxScore: 30000, reward: 80 },
    { name: "Rank 9", minScore: 30000, maxScore: 70000, reward: 90 },
    { name: "Rank 10", minScore: 70000, maxScore: 100000, reward: 100 },
  ];

  await Ranks.insertMany(ranksData);

  // Seed Robots
  const robotsData = [
    { name: "Robot 1", claimCount: 10, price: 2000 },
    { name: "Robot 2", claimCount: 15, price: 3000 },
    { name: "Robot 3", claimCount: 20, price: 4000 },
    { name: "Robot 4", claimCount: 30, price: 5500 },
    { name: "Robot 5", claimCount: 50, price: 9000 },
  ];

  await Robots.insertMany(robotsData);

  // Seed Tasks
  const tasksData = [
    {
      title: "Join Telegram Channel",
      image: "https://example.com/telegram-image.jpg",
      reward: 1000,
      miniTasks: [
        {
          title: "Join Channel 1",
          link: "https://t.me/channel1",
          image: "https://example.com/channel1-image.jpg",
        },
        {
          title: "Join Channel 2",
          link: "https://t.me/channel2",
          image: "https://example.com/channel2-image.jpg",
        },
      ],
    },
    {
      title: "Twitter Activities",
      image: "https://example.com/twitter-image.jpg",
      reward: 1000,
      miniTasks: [
        {
          title: "Retweet Post",
          link: "https://twitter.com/post",
          image: "https://example.com/post-image.jpg",
        },
        {
          title: "Follow Account",
          link: "https://twitter.com/account",
          image: "https://example.com/account-image.jpg",
        },
        {
          title: "Like Post",
          link: "https://twitter.com/post",
          image: "https://example.com/like-image.jpg",
        },
      ],
    },
  ];

  await Tasks.insertMany(tasksData);

  console.log("Database seeded successfully!");
  mongoose.disconnect();
};

seedDatabase().catch((error) => {
  console.error("Error seeding database:", error);
  mongoose.disconnect();
});
