// src/models/Admin.js - Admin user model
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    default: "admin",
    enum: ["admin", "super-admin"]
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date, 
    default: null 
  },
  loginHistory: [{
    loginAt: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true,
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12; // Higher security for admin
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login
adminSchema.methods.updateLastLogin = async function(ipAddress, userAgent) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    loginAt: new Date(),
    ipAddress,
    userAgent
  });
  
  // Keep only last 10 login records
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  
  return this.save();
};

// Static method to create admin
adminSchema.statics.createAdmin = async function(adminData) {
  const admin = new this(adminData);
  return admin.save();
};

// Find active admin
adminSchema.statics.findActiveAdmin = async function(identifier) {
  return this.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ],
    isActive: true
  });
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;