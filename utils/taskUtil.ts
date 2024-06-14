import axios from "axios";
import { bot } from "../telegramBot";

import express from "express";

export const checkTelegramSubscription = async (
  userId: number,
  channelId: string
) => {
  console.log(channelId, userId);

  if (!userId || !channelId) {
    return false;
  }

  try {
    const response = await bot.getChatMember(channelId, userId);

    const isMember = response.status !== "left" && response.status !== "kicked";
    return isMember;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", error.response.data);
        if (error.response.data.description === "Bad Request: user not found") {
          return false;
        } else {
          return false;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        return false;
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        return false;
      }
    } else {
      console.error("Unexpected error:", error);
      return false;
    }
  }
};

const router = express.Router();

export const check = router.get("/check-subscription", async (req, res) => {
  const channelId = req.query.channelId as string;

  if (!channelId) {
    return res.status(400).send("User ID and Channel ID are required.");
  }

  const response = await bot.getChat(channelId);
  console.log(response);
  res.status(200).send(response);
});
