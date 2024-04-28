import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  name: String,
  amount: Number,
});

export const Rewards = mongoose.model("Rewards", rewardSchema);
