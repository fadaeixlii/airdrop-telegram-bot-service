import mongoose, { Schema, Document } from "mongoose";

export interface ITimeLimitBoost extends Document {
  title: string;
  effect: number; // Negative effect
  price: number;
  order: number; // To determine the sequence of boosts
}

const timeLimitBoostSchema = new Schema<ITimeLimitBoost>({
  title: { type: String, required: true },
  effect: { type: Number, required: true },
  price: { type: Number, required: true },
  order: { type: Number, required: true, unique: true }, // Ensure unique order for sequencing
});

const TimeLimitBoosts = mongoose.model<ITimeLimitBoost>(
  "TimeLimitBoosts",
  timeLimitBoostSchema
);
export default TimeLimitBoosts;
