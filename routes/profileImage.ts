import axios from "axios";
import express from "express";

const router = express.Router();

export const getProfileImage = router.get(
  "/telegram-profile-image/:telegramId",
  async (req, res) => {
    const { telegramId } = req.params;

    try {
      // Fetch user profile photos
      const response = await axios.get(
        `https://api.telegram.org/bot${
          process.env.TELEGRAM_BOT_TOKEN ?? ""
        }/getUserProfilePhotos`,
        {
          params: { user_id: telegramId },
        }
      );

      const photos = response.data.result.photos;
      if (photos.length > 0) {
        const profilePhoto = photos[0][0];
        const fileId = profilePhoto.file_id;

        // Get file path
        const fileResponse = await axios.get(
          `https://api.telegram.org/bot${
            process.env.TELEGRAM_BOT_TOKEN ?? ""
          }/getFile`,
          {
            params: { file_id: fileId },
          }
        );

        const filePath = fileResponse.data.result.file_path;
        const profileImageUrl = `https://api.telegram.org/file/bot${
          process.env.TELEGRAM_BOT_TOKEN ?? ""
        }/${filePath}`;

        res.json({ profileImageUrl });
      } else {
        res.status(404).json({ message: "No profile photos found" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  }
);
