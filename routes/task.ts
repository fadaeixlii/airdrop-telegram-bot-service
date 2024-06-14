import express from "express";
import Tasks from "../Models/Task";
import Users from "../Models/Users";
import { checkTelegramSubscription } from "../utils/taskUtil";

const router = express.Router();

// Fetch list of tasks with completion status
export const getUserTasks = router.get("/tasks/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const tasks = await Tasks.find({});
    const user = await Users.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const completedTaskIds = new Set(
      user.completedTasks.map((taskId) => taskId.toString())
    );

    const tasksWithCompletionStatus = tasks.map((task) => ({
      title: task.title,
      image: task.image,
      reward: task.reward,
      id: task._id,
      isCompleted: completedTaskIds.has(task._id.toString()),
      miniTasks: task.miniTasks.map((miniTask) => ({
        title: miniTask.title,
        image: miniTask.image,
        link: miniTask.link,
        channelId: miniTask.channelId,
        id: miniTask._id,
        type: miniTask.type,
        isCompleted: completedTaskIds.has(task._id.toString()),
      })),
    }));

    res.status(200).json({ success: true, tasks: tasksWithCompletionStatus });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Mark task as completed
export const completeTask = router.post(
  "/tasks/complete/:userId/:taskId",
  async (req, res) => {
    const userId = req.params.userId;
    const taskId = req.params.taskId;

    try {
      const user = await Users.findById(userId);
      const task = await Tasks.findById(taskId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      if (!task) {
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });
      }

      if (!user.completedTasks.includes(taskId as any) && task) {
        user.completedTasks.push(taskId as any);
        user.storedScore = user.storedScore + task?.reward;
        await user.save();
      }

      res
        .status(200)
        .json({ success: true, message: "Task marked as completed" });
    } catch (error) {
      console.error("Error marking task as completed:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

export const verifyTask = router.post("/verify-task", async (req, res) => {
  const { userId, taskId, miniTaskIndex } = req.body;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const task = await Tasks.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const miniTask = task.miniTasks[miniTaskIndex];
    if (!miniTask) {
      return res
        .status(404)
        .json({ success: false, message: "Mini-task not found" });
    }

    let isCompleted = false;

    if (miniTask.type === "telegram") {
      const channelId = miniTask.channelId; // Assuming link is the Telegram channel ID
      isCompleted = await checkTelegramSubscription(
        user.telegramId,
        channelId ?? ""
      );
    }

    if (isCompleted) {
      return res
        .status(200)
        .json({ success: true, message: "Mini-task completed" });
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Mini-task not completed" });
    }
  } catch (error) {
    console.error("Error verifying task:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
