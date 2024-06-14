import mongoose, { Schema, Document } from "mongoose";

interface MiniTask {
  _id: any;
  title: string;
  link: string;
  image: string;
  type?: "telegram";
  channelId?: string;
}

interface Task extends Document {
  title: string;
  image: string;
  reward: number;
  miniTasks: MiniTask[];
}

const miniTaskSchema = new Schema<MiniTask>({
  title: { type: String, required: true },
  link: { type: String, required: true },
  image: { type: String, required: true },
  type: { type: String, required: false },
  channelId: { type: String, required: false },
});

const taskSchema = new Schema<Task>({
  title: { type: String, required: true },
  image: { type: String, required: true },
  reward: { type: Number, required: true },
  miniTasks: [miniTaskSchema],
});

const Tasks = mongoose.model<Task>("Tasks", taskSchema);
export default Tasks;
