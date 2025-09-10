// index.js - Fixed version with proper auth routes import
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

// IMPORT AUTH ROUTES
import authRoutes from "./src/routes/auth.js";
import testimonialRoutes from "./src/routes/testimonial.js";

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Serve static files (for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect to database
await connect();

const secret = process.env.secret_key;

// USE AUTH ROUTES
app.use("/api/auth", authRoutes);
// app.use("/api/testimonials", testimonialRoutes); 

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Van's Glow Up Salon Server is running",
    timestamp: new Date().toISOString()
  });
});

// =========================
//  SETUP ROUTES 
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
//  SERVICES ROUTES
// =========================

// GET all services with full data and images
app.get("/api/services", async (req, res) => {
  try {
    const { default: Service } = await import("./src/models/Service.js");
    
    const services = await Service.find({ isActive: true })
      .select('id name description styles isActive createdAt updatedAt')
      .lean();
    
    // Add style count and process images for each service
    const servicesWithDetails = await Promise.all(
      services.map(async (service) => {
        const fullService = await Service.findById(service._id);
        const activeStyles = fullService.styles.filter(style => style.isActive !== false);
        
        // Process styles to include full image URLs
        const stylesWithImages = activeStyles.map(style => ({
          ...style.toObject(),
          imageUrl: style.image ? `http://localhost:${PORT}${style.image}` : null,
          thumbnailUrl: style.thumbnail ? `http://localhost:${PORT}${style.thumbnail}` : null
        }));
        
        return {
          ...service,
          styles: stylesWithImages,
          totalStyles: activeStyles.length,
          hasStyles: activeStyles.length > 0,
          // Add service image if available
          imageUrl: service.image ? `http://localhost:${PORT}${service.image}` : null
        };
      })
    );

    res.json({
      message: "Services fetched successfully",
      isSuccess: true,
      success: true,
      services: servicesWithDetails,
      data: servicesWithDetails,
      count: servicesWithDetails.length
    });
  } catch (error) {
    console.error("Services fetch error:", error);
    res.status(500).json({
      message: "Error fetching services",
      isSuccess: false,
      error: error.message
    });
  }
});

// GET service by ID with full data
app.get("/api/services/id/:id", async (req, res) => {
  try {
    const { default: Service } = await import("./src/models/Service.js");
    
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        isSuccess: false,
        message: 'Service not found' 
      });
    }
    
    // Filter active styles and add image URLs
    const activeStyles = service.styles.filter(style => style.isActive !== false);
    const stylesWithImages = activeStyles.map(style => ({
      ...style.toObject(),
      imageUrl: style.image ? `http://localhost:${PORT}${style.image}` : null,
      thumbnailUrl: style.thumbnail ? `http://localhost:${PORT}${style.thumbnail}` : null
    }));
    
    res.json({
      success: true,
      isSuccess: true,
      message: "Service fetched successfully",
      data: {
        ...service.toObject(),
        styles: stylesWithImages,
        totalStyles: activeStyles.length,
        imageUrl: service.image ? `http://localhost:${PORT}${service.image}` : null
      }
    });
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    res.status(500).json({ 
      success: false,
      isSuccess: false,
      message: 'Failed to fetch service', 
      error: error.message 
    });
  }
});

// GET service by name
app.get("/api/services/name/:serviceName", async (req, res) => {
  try {
    const { default: Service } = await import("./src/models/Service.js");
    
    const serviceName = decodeURIComponent(req.params.serviceName);
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        isSuccess: false,
        message: `Service '${serviceName}' not found` 
      });
    }
    
    // Filter active styles and add image URLs
    const activeStyles = service.styles.filter(style => style.isActive !== false);
    const stylesWithImages = activeStyles.map(style => ({
      ...style.toObject(),
      imageUrl: style.image ? `http://localhost:${PORT}${style.image}` : null,
      thumbnailUrl: style.thumbnail ? `http://localhost:${PORT}${style.thumbnail}` : null
    }));
    
    res.json({
      success: true,
      isSuccess: true,
      message: "Service fetched successfully",
      data: {
        ...service.toObject(),
        styles: stylesWithImages,
        totalStyles: activeStyles.length,
        imageUrl: service.image ? `http://localhost:${PORT}${service.image}` : null
      }
    });
  } catch (error) {
    console.error('Error fetching service by name:', error);
    res.status(500).json({ 
      success: false,
      isSuccess: false,
      message: 'Failed to fetch service', 
      error: error.message 
    });
  }
});

// Search styles across all services
app.get("/api/services/search/styles", async (req, res) => {
  try {
    const { default: Service } = await import("./src/models/Service.js");
    const { query, limit = 50 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        isSuccess: false,
        message: 'Search query must be at least 2 characters long' 
      });
    }

    const services = await Service.find({ isActive: true });
    
    const results = [];
    
    for (const service of services) {
      const matchingStyles = service.styles
        .filter(style => 
          style.isActive !== false &&
          style.name && 
          style.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(style => ({
          ...style.toObject(),
          serviceName: service.name,
          serviceId: service._id,
          imageUrl: style.image ? `http://localhost:${PORT}${style.image}` : null,
          thumbnailUrl: style.thumbnail ? `http://localhost:${PORT}${style.thumbnail}` : null
        }));
      
      results.push(...matchingStyles);
    }

    const limitedResults = results.slice(0, parseInt(limit));

    console.log(`Search query: "${query}" found ${results.length} results`);

    res.json({
      success: true,
      isSuccess: true,
      message: "Search completed successfully",
      data: {
        query: query.trim(),
        results: limitedResults,
        totalFound: results.length,
        showing: limitedResults.length
      }
    });
  } catch (error) {
    console.error('Error searching styles:', error);
    res.status(500).json({ 
      success: false,
      isSuccess: false,
      message: 'Search failed', 
      error: error.message 
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
      .select("name feedback rating userId createdAt")  // Added userId here
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      isSuccess: true,
      message: "Testimonials fetched successfully",
      data: testimonials,
      testimonials: testimonials,
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

// POST create new testimonial (with auto-detect authentication)
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
      console.log('❌ Name too long:', name.length);
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

    // Create testimonial object with automatic authentication detection
    const testimonialData = {
      name: name.trim(),
      feedback: feedback.trim(),
      rating: rating || 5,
      isApproved: true
    };

    // Add userId and userEmail if they exist, then set isAuthenticated
    if (userId && userEmail) {
      testimonialData.userId = userId;
      testimonialData.userEmail = userEmail;
      testimonialData.isAuthenticated = true;
    } else {
      testimonialData.isAuthenticated = false;
    }
    
    const testimonial = new Testimonial(testimonialData);
    const savedTestimonial = await testimonial.save();

    res.status(201).json({
      success: true,
      isSuccess: true,
      message: "Testimonial created successfully",
      data: {
        id: savedTestimonial._id,
        _id: savedTestimonial._id,  
        name: savedTestimonial.name,
        feedback: savedTestimonial.feedback,
        rating: savedTestimonial.rating,
        userId: savedTestimonial.userId,  
        isAuthenticated: savedTestimonial.isAuthenticated,
        createdAt: savedTestimonial.createdAt
      }
    });
  } catch (error) {
    // If it's a validation error, send specific message
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => 
        `${field}: ${error.errors[field].message}`
      ).join(', ');
      
      return res.status(400).json({
        success: false,
        isSuccess: false,
        message: "Validation failed",
        errors: validationErrors,
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      isSuccess: false,
      message: "Failed to create testimonial",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT update testimonial
app.put("/api/testimonials/:id", async (req, res) => {
  try {
    const { default: Testimonial } = await import("./src/models/Testimonial.js");
    const { id } = req.params;
    const { name, feedback, rating } = req.body;

    // Validation
    if (!name || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Name and feedback are required"
      });
    }

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    // Update fields
    testimonial.name = name.trim();
    testimonial.feedback = feedback.trim();
    testimonial.rating = rating || 5;

    const updated = await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: {
        _id: updated._id,
        name: updated.name,
        feedback: updated.feedback,
        rating: updated.rating,
        userId: updated.userId,
        createdAt: updated.createdAt
      }
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update testimonial",
      error: error.message
    });
  }
});

// DELETE testimonial
app.delete("/api/testimonials/:id", async (req, res) => {
  try {
    const { default: Testimonial } = await import("./src/models/Testimonial.js");
    const { id } = req.params;

    const result = await Testimonial.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
      error: error.message
    });
  }
});

// =========================
//  USERS ROUTES
// =========================

// Users endpoint with dynamic import
app.get("/api/users", async (req, res) => {
  try {
    const { default: User } = await import("./src/models/User.js");
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({
      message: "Users fetched successfully",
      isSuccess: true,
      users
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({
      message: "Error fetching users",
      isSuccess: false
    });
  }
});

// Individual user endpoint
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
      auth: ["/api/auth/sign-up", "/api/auth/sign-in", "/api/auth/forgot-password", "/api/auth/reset-password"],
      services: ["/api/services", "/api/services/id/:id", "/api/services/name/:name"],
      testimonials: ["/api/testimonials"],
      setup: ["/api/setup/admin", "/api/setup/reset-admin", "/api/debug/admins"],
      users: ["/api/users", "/api/users/:id"]
    },
    instructions: {
      setup: "Call POST /api/setup/reset-admin to create/reset admin",
      credentials: "Default admin: username=admin, password=admin123"
    }
  });
});

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Network access: http://192.168.100.67:${PORT}`);
  console.log(`🔧 Setup: POST /api/setup/reset-admin (create/reset admin)`);
  console.log(`📱 Mobile: sign-up, sign-in, forgot-password, reset-password available`);
  console.log(`💻 Services: GET /api/services available`);
  console.log(`📝 Testimonials: GET/POST /api/testimonials available`);
  console.log(`\n📝 To reset admin: POST http://localhost:${PORT}/api/setup/reset-admin`);
  console.log(`🔑 Admin credentials: username=admin, password=admin123`);
  console.log(`\n🔄 Auth routes loaded from: ./src/routes/auth.js`);
});