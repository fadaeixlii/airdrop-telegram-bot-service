import mongoose from "mongoose";

let isConnected = false;

export const connectToDb = async () => {
  if (isConnected) {
    console.log("mangoDB connected");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL ?? "", {
      dbName: "demo_airdrop",
    });
    isConnected = true;
    console.log("mangoDB connected");
  } catch (error) {
    console.log(error);
  }
};
