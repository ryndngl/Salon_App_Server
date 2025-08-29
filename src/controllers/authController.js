import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";

const secret = process.env.secret_key;

// === SIGNUP ===
const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists", isSuccess: false });
    }

    const hashedPassword = await bcrypt.hash(password, 13);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully", isSuccess: true });
  } catch (error) {
    res.status(500).json({ message: error.message, isSuccess: false });
  }
};

// === SIGNIN ===
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found", isSuccess: false });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials", isSuccess: false });

    const validUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      photo: user.photo || "",
    };

    const token = jwt.sign(validUser, secret, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      isSuccess: true,
      token,
      user: validUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, isSuccess: false });
  }
};

// === VERIFY TOKEN ===
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided", isSuccess: false });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id || decoded._id);
    if (!user) return res.status(404).json({ message: "User not found", isSuccess: false });

    const validUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      photo: user.photo || "",
    };

    res.status(200).json({ message: "Token is valid", isSuccess: true, user: validUser });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", isSuccess: false });
  }
};

// === LOGOUT ===
const logout = (req, res) => {
  return res.status(200).json({ message: "Logged out successfully", isSuccess: true });
};

// REMOVED: Duplicate forgot/reset password functions
// Use forgotPasswordController.js instead for better organization

export { signUp, signIn, verifyToken, logout };