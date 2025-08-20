import User from "../models/User.js";
import "dotenv/config";

const home = async (req, res) => {
  res.status(200).json({ message: "Welcome to the salon booking app", isSuccess: true });
};

export { home };