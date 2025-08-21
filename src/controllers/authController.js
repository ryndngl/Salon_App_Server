
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

    // valid user data
    const validUser = {
      id: user._id,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      photo: user.photo || "",
    };

    // generate JWT token with longer expiry for persistent login
    const token = jwt.sign(validUser, process.env.secret_key, {
      expiresIn: "7d", // Extended to 7 days para sa persistent login
    });

    // send back token + user
    res.status(200).json({
      message: "Login successful",
      isSuccess: true,
      token,              
      user: validUser,    
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message,
      isSuccess: false,
    });
  }
};

// NEW: Verify token endpoint para sa persistent login
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: "No token provided", 
        isSuccess: false 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.secret_key);
    
    // Optional: Check if user still exists sa database
    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found", 
        isSuccess: false 
      });
    }

    // Return success with fresh user data
    const validUser = {
      id: user._id,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      photo: user.photo || "",
    };

    res.status(200).json({
      message: "Token is valid",
      isSuccess: true,
      user: validUser,
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token", 
        isSuccess: false 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expired", 
        isSuccess: false 
      });
    }

    res.status(500).json({ 
      message: "Token verification failed", 
      isSuccess: false 
    });
  }
};

const logout = (req, res) => {
  try {
    // Kung JWT ang gamit, logout ay i-clear lang sa frontend
    return res.status(200).json({ 
      message: "Logged out successfully", 
      isSuccess: true 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Server error", 
      isSuccess: false 
    });
  }
};

export { signUp, signIn, verifyToken, logout };