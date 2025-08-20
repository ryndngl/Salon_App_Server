import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";
const secret = process.env.secret_key;

// signup
const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const error = new Error("User already exists");
      error.status = 400;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 13);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", isSuccess: true });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message, isSuccess: false });
  }
};

const body = {
  email: "johnirvingeanga@gmail.com",
  password: "111111",
};

// sign in
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const validUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    };

    const userData = jwt.sign(validUser, secret, {
      expiresIn: "1h",
    });

    res.cookie("salon_token", userData);

    res.status(200).json({ message: "Login successful", isSuccess: true });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message, isSuccess: false });
  }
};

export { signUp, signIn };

