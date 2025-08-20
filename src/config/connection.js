import mongoose from "mongoose";
import dotenv from "dotenv";
const uri = process.env.compass;
async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export default connect;
