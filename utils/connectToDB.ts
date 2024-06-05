import mongoose, { ConnectionStates } from "mongoose";
import dotenv from "dotenv";

export const connectToDb = async () => {
  console.log(mongoose.connection.readyState);

  if (
    mongoose.connection.readyState === 2 ||
    mongoose.connection.readyState === 1
  ) {
    console.log("mangoDB Before connected");
    return;
  } else {
    mongoose
      .connect(process.env["MONGODB_URL"] ?? "")
      .then(() => {
        console.log("mangoDB Now connected");
      })
      .catch((err) => {
        console.log("Mongo Err", err);
      });

    mongoose.connection.on("error", (err) => {
      console.log("Mongo Err", err);
    });
  }
};

//Real Time MongoDb Connection Monitoring
mongoose.connection.on("connected", () => {
  console.log("mangoDB Connection is Stablished!");
});

mongoose.connection.on("error", (err) => {
  console.log("mangoDB Faced Error: " + err);
});

//return if mongodb is connected or not
export const isMongoConnected = () => {
  return mongoose.connection.readyState == 1;
};

export const waitForConnection = () => {
  return new Promise<void>((resolve) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
    } else {
      mongoose.connection.once("connected", resolve);
    }
  });
};
