import { Router } from "express";
import Users from "../Models/Users";

const router = Router();

export const claimRoute = router.post("/claim", (req, res) => {
  const userId = req.body.userId; // Assuming you're passing userId in the request body
  Users.findById(userId)
    .then((user) => {
      if (user) {
        const { score, storedScore, maxScore } = user;
        const newStoredScore = storedScore + score;
        user
          .updateOne({ score: 0, storedScore: newStoredScore })
          .then(() => {
            res.status(200).json({ success: true, newStoredScore });
          })
          .catch((error) => {
            console.error("Error updating user:", error);
            res
              .status(500)
              .json({ success: false, message: "Internal server error" });
          });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    });
});
