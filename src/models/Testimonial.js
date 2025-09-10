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
  required: false  // Change this from true to false
},
userEmail: {
  type: String,
  required: false  // Change this from true to false
},
  isApproved: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

testimonialSchema.index({ userId: 1, createdAt: -1 });
testimonialSchema.index({ isApproved: 1, createdAt: -1 });

export default mongoose.model("Testimonial", testimonialSchema);