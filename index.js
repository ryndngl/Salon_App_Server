// index.js - Complete version with testimonials and all routes
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

import "dotenv/config";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Get __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PORT
const PORT = process.env.PORT || 5000;

// database connection
import connect from "./src/config/connection.js";

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Serve static files (for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect to database
await connect();

const secret = process.env.secret_key;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Van's Glow Up Salon Server is running",
    timestamp: new Date().toISOString()
  });
});

// =========================
//  SETUP ROUTES (One-time use)
// =========================

// Setup default admin (call this once to create admin user)
app.post("/api/setup/admin", async (req, res) => {
  try {
    const { default: Admin } = await import("./src/models/Admin.js");
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin already exists",
        isSuccess: false,
        info: "Use username: admin, password: admin123"
      });
    }

    // Create default admin
    const defaultAdmin = new Admin({
      username: "admin",
      email: "admin@salon.com",
      password: "admin123", // This will be hashed by the pre-save hook
      role: "super-admin",
      isActive: true
    });

    await defaultAdmin.save();

    console.log("Default admin created successfully!");

    res.status(201).json({
      message: "Default admin created successfully",
      isSuccess: true,
      credentials: {
        username: "admin",
        password: "admin123",
        email: "admin@salon.com"
      },
      admin: {
        id: defaultAdmin._id,
        username: defaultAdmin.username,
        email: defaultAdmin.email,
        role: defaultAdmin.role
      }
    });
  } catch (error) {
    console.error("Setup admin error:", error);
    res.status(500).json({
      message: "Error creating admin",
      isSuccess: false,
      error: error.message
    });
  }
});

// Route to reset admin password
app.post("/api/setup/reset-admin", async (req, res) => {
  try {
    const { default: Admin } = await import("./src/models/Admin.js");
    
    // Find existing admin
    let admin = await Admin.findOne({ username: "admin" });
    
    if (!admin) {
      // Create new admin if doesn't exist
      admin = new Admin({
        username: "admin",
        email: "admin@salon.com",
        password: "admin123", // This will be hashed by pre-save hook
        role: "super-admin",
        isActive: true
      });
    } else {
      // Update existing admin password
      admin.password = "admin123"; // This will be hashed by pre-save hook
      admin.isActive = true;
    }

    await admin.save();

    console.log("Admin password reset/created successfully!");

    res.status(200).json({
      message: "Admin password reset successfully",
      isSuccess: true,
      credentials: {
        username: "admin",
        password: "admin123",
        email: admin.email
      },
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error("Reset admin error:", error);
    res.status(500).json({
      message: "Error resetting admin",
      isSuccess: false,
      error: error.message
    });
  }
});

// Debug route to check existing admins
app.get("/api/debug/admins", async (req, res) => {
  try {
    const { default: Admin } = await import("./src/models/Admin.js");
    
    const admins = await Admin.find({}, 'username email role isActive createdAt').sort({ createdAt: -1 });
    
    res.json({
      message: "Admin list retrieved",
      isSuccess: true,
      count: admins.length,
      admins: admins
    });
  } catch (error) {
    console.error("Debug admins error:", error);
    res.status(500).json({
      message: "Error fetching admins",
      isSuccess: false
    });
  }
});

// =========================
//  MOBILE APP ROUTES
// =========================

// Mobile user signup - with dynamic model import
app.post("/api/auth/sign-up", async (req, res) => {
  try {
    const { default: User } = await import("./src/models/User.js");
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        isSuccess: false
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      isSuccess: true,
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
});

// Mobile user signin - FIXED with correct import
app.post("/api/auth/sign-in", async (req, res) => {
  try {
    // FIXED: Use default import like in sign-up route
    const { default: User } = await import("./src/models/User.js");
    const { email, password } = req.body;

    console.log("Sign-in attempt for email:", email); // Debug log

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email); // Debug log
      return res.status(401).json({
        message: "Invalid email or password",
        isSuccess: false
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for email:", email); // Debug log
      return res.status(401).json({
        message: "Invalid email or password",
        isSuccess: false
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        type: 'user'
      },
      secret,
      { expiresIn: "30d" }
    );

    // Set cookie
    res.cookie("salon_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    console.log("User sign-in successful for email:", email); // Debug log

    res.status(200).json({
      message: "Login successful",
      isSuccess: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        type: 'user'
      }
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
});

// =========================
//  TESTIMONIALS ROUTES
// =========================

// GET all approved testimonials (public endpoint for mobile app)
app.get("/api/testimonials", async (req, res) => {
  try {
    const { default: Testimonial } = await import("./src/models/Testimonial.js");
    
    const testimonials = await Testimonial.find({ isApproved: true })
      .select("name feedback rating createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Fetched ${testimonials.length} testimonials`); // Debug log

    res.status(200).json({
      success: true,
      isSuccess: true, // For compatibility with mobile app
      message: "Testimonials fetched successfully",
      data: testimonials,
      testimonials: testimonials, // Alternative format
      count: testimonials.length
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({
      success: false,
      isSuccess: false,
      message: "Failed to fetch testimonials",
      error: error.message
    });
  }
});

// POST create new testimonial (for mobile app)
app.post("/api/testimonials", async (req, res) => {
  try {
    const { default: Testimonial } = await import("./src/models/Testimonial.js");
    const { name, feedback, rating, userId, userEmail } = req.body;

    // Validation
    if (!name || !feedback) {
      return res.status(400).json({
        success: false,
        isSuccess: false,
        message: "Name and feedback are required"
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        success: false,
        isSuccess: false,
        message: "Name cannot exceed 50 characters"
      });
    }

    if (feedback.length > 200) {
      return res.status(400).json({
        success: false,
        isSuccess: false,
        message: "Feedback cannot exceed 200 characters"
      });
    }

    const testimonial = new Testimonial({
      name: name.trim(),
      feedback: feedback.trim(),
      rating: rating || 5,
      userId: userId,
      userEmail: userEmail,
      isApproved: true // Auto-approve for now
    });

    const savedTestimonial = await testimonial.save();

    console.log("New testimonial created:", savedTestimonial.name); // Debug log

    res.status(201).json({
      success: true,
      isSuccess: true,
      message: "Testimonial created successfully",
      data: savedTestimonial
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({
      success: false,
      isSuccess: false,
      message: "Failed to create testimonial",
      error: error.message
    });
  }
});

// =========================
//  DESKTOP APP ROUTES
// =========================

// Legacy desktop login route (for backward compatibility with desktop app)
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔄 Legacy login route called (desktop app compatibility)");
    
    const { default: Admin } = await import("./src/models/Admin.js");
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    console.log(`Admin login attempt: ${username} from ${ipAddress}`);

    // Find admin by username
    const admin = await Admin.findOne({ username: username, isActive: true });
    if (!admin) {
      console.log(`Admin not found: ${username}`);
      return res.status(401).json({
        message: "Invalid credentials",
        isSuccess: false,
        success: false
      });
    }

    // Use the Admin model's comparePassword method
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`Invalid password for admin: ${username}`);
      return res.status(401).json({
        message: "Invalid credentials",
        isSuccess: false,
        success: false
      });
    }

    // Use the Admin model's updateLastLogin method
    await admin.updateLastLogin(ipAddress, req.headers['user-agent'] || 'unknown');

    // Create JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        type: 'admin'
      },
      secret,
      { expiresIn: "8h" }
    );

    console.log(`Admin login successful: ${username}`);

    res.status(200).json({
      message: "Admin login successful",
      isSuccess: true,
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        type: 'admin'
      }
    });
  } catch (error) {
    console.error("Legacy admin signin error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false,
      success: false
    });
  }
});

// Desktop admin signin - FIXED to use Admin model's comparePassword method
app.post("/api/auth/admin/sign-in", async (req, res) => {
  try {
    const { default: Admin } = await import("./src/models/Admin.js");
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    console.log(`Admin login attempt: ${username} from ${ipAddress}`);

    // Find admin by username
    const admin = await Admin.findOne({ username: username, isActive: true });
    if (!admin) {
      console.log(`Admin not found: ${username}`);
      return res.status(401).json({
        message: "Invalid credentials",
        isSuccess: false
      });
    }

    // Use the Admin model's comparePassword method instead of bcrypt.compare
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`Invalid password for admin: ${username}`);
      return res.status(401).json({
        message: "Invalid credentials",
        isSuccess: false
      });
    }

    // Use the Admin model's updateLastLogin method
    await admin.updateLastLogin(ipAddress, req.headers['user-agent'] || 'unknown');

    // Create JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        type: 'admin'
      },
      secret,
      { expiresIn: "8h" }
    );

    console.log(`Admin login successful: ${username}`);

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
        type: 'admin'
      }
    });
  } catch (error) {
    console.error("Admin signin error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
});

// =========================
//  COMMON ROUTES
// =========================

// Token verification
app.post("/api/auth/verify-token", async (req, res) => {
  try {
    const token = req.body.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
        isSuccess: false
      });
    }

    const decoded = jwt.verify(token, secret);
    
    res.status(200).json({
      message: "Token is valid",
      isSuccess: true,
      user: decoded
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      isSuccess: false
    });
  }
});

// Logout
app.post("/api/auth/logout", async (req, res) => {
  try {
    res.clearCookie("salon_token");
    res.status(200).json({
      message: "Logout successful",
      isSuccess: true
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
});

// Basic services endpoint
app.get("/api/services", async (req, res) => {
  try {
    res.json({
      message: "Services endpoint working",
      isSuccess: true,
      services: []
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching services",
      isSuccess: false
    });
  }
});

// Users endpoint with dynamic import - FIXED
// Add this sa index.js mo, after yung existing /api/users route
app.get("/api/users/:id", async (req, res) => {
  try {
    const { default: User } = await import("./src/models/User.js");
    const { id } = req.params;
    
    const user = await User.findById(id, '-password');
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        isSuccess: false
      });
    }
    
    res.json({
      id: user._id,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      photo: user.photo || "",
      message: "User fetched successfully",
      isSuccess: true
    });
  } catch (error) {
    console.error("Individual user fetch error:", error);
    res.status(500).json({
      message: "Error fetching user",
      isSuccess: false
    });
  }
});

// Main endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Van's Glow Up Salon Server is running!",
    endpoints: {
      setup: ["/api/setup/admin", "/api/setup/reset-admin", "/api/debug/admins"],
      mobile: ["/api/auth/sign-up", "/api/auth/sign-in", "/api/testimonials"],
      desktop: ["/api/auth/login", "/api/auth/admin/sign-in", "/api/users"],
      common: ["/api/health", "/api/auth/verify-token", "/api/auth/logout"]
    },
    instructions: {
      setup: "Call POST /api/setup/reset-admin to create/reset admin",
      credentials: "Default admin: username=admin, password=admin123"
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`🔧 Setup: POST /api/setup/reset-admin (create/reset admin)`);
  console.log(`📱 Mobile: sign-up, sign-in, testimonials available`);
  console.log(`💻 Desktop: /api/auth/login (legacy) + admin/sign-in available`);
  console.log(`\n📝 To reset admin: POST http://localhost:${PORT}/api/setup/reset-admin`);
  console.log(`🔑 Admin credentials: username=admin, password=admin123`);
});