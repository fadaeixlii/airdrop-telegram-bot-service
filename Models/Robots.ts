import mongoose, { Schema } from "mongoose";

export interface IRobot extends mongoose.Document {
  name: string;
  claimCount: number;
  price: number;
}

const robotSchema = new Schema<IRobot>({
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

const Robots = mongoose.model<IRobot>("Robots", robotSchema);
export default Robots;
