import mongoose, { Schema } from "mongoose";

interface User extends mongoose.Document {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  referrals: mongoose.Types.ObjectId[];
  rank: mongoose.Types.ObjectId;
  score: number;
  maxScore: number;
  storedScore: number;
  referralCode?: string;
}

const userSchema = new Schema<User>({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
  },
  username: String,
  firstName: String,
  referralCode: String,
  lastName: String,
  referrals: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 100, // Set the max score value as per your requirement
  },
  storedScore: {
    type: Number,
    default: 0,
  },
  rank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ranks",
  },
});

const Users = mongoose.model<User>("Users", userSchema);
export default Users;
