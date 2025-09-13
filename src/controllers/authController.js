// src/controllers/authController.js - Enhanced with admin support
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const secret = process.env.secret_key;
console.log("🔑 JWT Secret loaded:", secret ? "YES" : "NO");
console.log("🔑 Secret value:", secret);
// Existing mobile user signup
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        isSuccess: false,
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      isSuccess: true,
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false,
    });
  }
};

// Existing mobile user signin
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        isSuccess: false,
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
        isSuccess: false,
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        type: "user",
      },
      secret,
      { expiresIn: "30d" }
    );

    // Set cookie
    res.cookie("salon_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      message: "Login successful",
      isSuccess: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        type: "user",
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false,
    });
  }
};

// NEW: Admin signin for desktop app
export const adminSignIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    console.log(`🔐 Admin login attempt: ${username} from ${ipAddress}`);

    // Find admin by username or email
    const admin = await Admin.findActiveAdmin(username);
    if (!admin) {
      console.log(`❌ Admin not found: ${username}`);
      return res.status(401).json({
        message: "Invalid credentials",
        isSuccess: false,
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for admin: ${username}`);
      return res.status(401).json({
        message: "Invalid credentials",
        isSuccess: false,
      });
    }

    // Update last login
    await admin.updateLastLogin(ipAddress, userAgent);

    // Create JWT token (shorter expiry for admin)
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        type: "admin",
      },
      secret,
      { expiresIn: "8h" } // 8 hours for admin session
    );

    console.log(`✅ Admin login successful: ${username}`);

    res.status(200).json({
      message: "Admin login successful",
      isSuccess: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        type: "admin",
      },
    });
  } catch (error) {
    console.error("Admin signin error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false,
    });
  }
};

// Enhanced verify token (supports both user and admin)
export const verifyToken = async (req, res) => {
  try {
    const token = req.body.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
        isSuccess: false,
      });
    }

    const decoded = jwt.verify(token, secret);

    // Check if user/admin still exists and is active
    if (decoded.type === "admin") {
      const admin = await Admin.findById(decoded.id);
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          message: "Admin account not found or inactive",
          isSuccess: false,
        });
      }
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          message: "User not found",
          isSuccess: false,
        });
      }
    }

    res.status(200).json({
      message: "Token is valid",
      isSuccess: true,
      user: decoded,
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
        isSuccess: false,
      });
    }

    console.error("Token verification error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false,
    });
  }
};

// Logout (both user and admin)
export const logout = async (req, res) => {
  try {
    res.clearCookie("salon_token");
    res.status(200).json({
      message: "Logout successful",
      isSuccess: true,
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false,
    });
  }
};

// NEW: Create initial admin (run once)
export const createInitialAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if any admin exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin already exists",
        isSuccess: false,
      });
    }

    // Create admin
    const admin = await Admin.createAdmin({
      username,
      email,
      password,
      role: "super-admin",
    });

    console.log(`🔧 Initial admin created: ${username}`);

    res.status(201).json({
      message: "Initial admin created successfully",
      isSuccess: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false,
    });
  }
};
