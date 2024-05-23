import mongoose from "mongoose";

export interface IRanks extends mongoose.Document {
  name: string;
  minScore: number;
  maxScore: number;
  reward: number;
}
export const ranksSchema = new mongoose.Schema<IRanks>({
  name: {
    type: String, // Explicitly define as string
    required: true,
    unique: true,
  },
  minScore: {
    type: Number, // Enforce number type
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
    validate: {
      validator: function (this: IRanks, value: number) {
        // `this` refers to the document being validated
        return value > this.minScore;
      },
      message: (props) => `maxScore (${props.value}) should be greater than minScore.`,
    },
  },
  reward: {
    type: Number, // Enforce number type
    required: true,
  },
});

export const Ranks = mongoose.model<IRanks>("Ranks", ranksSchema);
export default Ranks;
