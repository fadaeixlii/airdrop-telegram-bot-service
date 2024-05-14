import mongoose from "mongoose";

export interface IRanks extends mongoose.Document {
  name: string;
  minScore: number;
  maxScore: number;
  reward: mongoose.Types.ObjectId;
}
export const ranksSchema = new mongoose.Schema<IRanks>({
  name: String,
  minScore: Number,
  maxScore: Number,
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rewards",
  },
});

export const Ranks = mongoose.model<IRanks>("Ranks", ranksSchema);
