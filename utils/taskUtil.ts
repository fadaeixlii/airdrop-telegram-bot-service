import axios from "axios";
import { bot } from "../telegramBot";

export const checkTelegramSubscription = async (
  userId: number,
  channelId: string
) => {
  console.log(channelId, userId);
  // try {
  //   const response = await bot.getChatMember(channelId, userId);
  //   console.log(response);
  //   // const { status } = response.data.result;
  //   return !!response;
  // } catch (error) {
  //   console.error("Error checking Telegram subscription:", error);
  //   return false;
  // }
  return true;
};
