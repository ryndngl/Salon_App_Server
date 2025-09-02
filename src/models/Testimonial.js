// src/models/Testimonial.js
import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  feedback: {
    type: String,
    required: [true, "Feedback is required"],
    trim: true,
    maxlength: [200, "Feedback cannot exceed 200 characters"]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now, pwede mo i-change to false if gusto mo mag-moderate
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5 // Optional rating system
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for better performance
testimonialSchema.index({ userId: 1, createdAt: -1 });
testimonialSchema.index({ isApproved: 1, createdAt: -1 });

export default mongoose.model("Testimonial", testimonialSchema);