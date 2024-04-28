import Socket from "socket.io";
import http from "http";
import Users from "../Models/Users";

export const RunSocket = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const io = new Socket.Server(server);
  io.on("connection", (socket) => {
    console.log("A client connected");

    const interval = setInterval(() => {
      Users.findOneAndUpdate(
        {
          /* Add your condition to select users */
        },
        { $inc: { score: 1 } },
        { new: true }
      )
        .then((user) => {
          if (user) {
            socket.emit("newScore", user.score);
          }
        })
        .catch((error) => {
          console.error("Error updating score:", error);
        });
    }, 5000);

    socket.on("disconnect", () => {
      console.log("A client disconnected");
      clearInterval(interval);
    });
  });
};
