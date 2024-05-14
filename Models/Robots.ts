import mongoose, { Schema } from "mongoose";

export interface Robot extends mongoose.Document {
  name: string;
  claimCount: number;
  price: number;
}

const robotSchema = new Schema<Robot>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  claimCount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Robots = mongoose.model<Robot>("Robots", robotSchema);
export default Robots;
