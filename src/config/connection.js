import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

async function connect() {
  try {
    await mongoose.connect(uri); // wala nang options needed
    console.log(" Connected to MongoDB");
  } catch (error) {
    console.error(" Error connecting to MongoDB:", error);
    process.exit(1); // exit app if db fails
  }

  // Optional: listeners
  mongoose.connection.on("connected", () => {
    console.log(" Mongoose connection established");
  });

  mongoose.connection.on("error", (err) => {
    console.error(" Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log(" Mongoose disconnected");
  });
}

export default connect;
