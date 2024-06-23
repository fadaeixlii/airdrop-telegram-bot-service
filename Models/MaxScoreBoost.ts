import mongoose, { Schema, Document } from "mongoose";

export interface IMaxScoreBoost extends Document {
  title: string;
  effect: number; // Positive effect
  price: number;
  order: number; // To determine the sequence of boosts
}

const maxScoreBoostSchema = new Schema<IMaxScoreBoost>({
  title: { type: String, required: true },
  effect: { type: Number, required: true },
  price: { type: Number, required: true },
  order: { type: Number, required: true, unique: true }, // Ensure unique order for sequencing
});

const MaxScoreBoosts = mongoose.model<IMaxScoreBoost>(
  "MaxScoreBoosts",
  maxScoreBoostSchema
);
export default MaxScoreBoosts;
