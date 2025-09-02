// src/routes/testimonialRoutes.js
import express from "express";
import Testimonial from "../models/Testimonial.js";
import authentication from "../middlewares/authentication.js";
const router = express.Router();

// GET all approved testimonials (public)
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true })
      .select("name feedback rating createdAt")
      .sort({ createdAt: -1 })
      .limit(50); 

    res.status(200).json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
      error: error.message
    });
  }
});

// GET user's own testimonials (protected route)
router.get("/my-testimonials",authentication, async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ userId: req.user.id })
      .select("name feedback rating isApproved createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error("Error fetching user testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your testimonials",
      error: error.message
    });
  }
});

// POST create new testimonial (protected route)
router.post("/", authentication, async (req, res) => {
  try {
    const { name, feedback, rating } = req.body;

    // Validation
    if (!name || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Name and feedback are required"
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 50 characters"
      });
    }

    if (feedback.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Feedback cannot exceed 200 characters"
      });
    }

    // Check if user already has a testimonial (optional - remove if you want multiple testimonials per user)
    const existingTestimonial = await Testimonial.findOne({ userId: req.user.id });
    if (existingTestimonial) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a testimonial. You can edit your existing one instead."
      });
    }

    const testimonial = new Testimonial({
      name: name.trim(),
      feedback: feedback.trim(),
      rating: rating || 5,
      userId: req.user.id,
      userEmail: req.user.email
    });

    const savedTestimonial = await testimonial.save();

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: savedTestimonial
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create testimonial",
      error: error.message
    });
  }
});

// PUT update testimonial (protected route - user can only update their own)
router.put("/:id", authentication, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, feedback, rating } = req.body;

    // Validation
    if (!name || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Name and feedback are required"
      });
    }

    if (name.length > 50 || feedback.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Name or feedback exceeds maximum length"
      });
    }

    // Find testimonial and verify ownership
    const testimonial = await Testimonial.findOne({ _id: id, userId: req.user.id });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found or you don't have permission to edit it"
      });
    }

    // Update testimonial
    testimonial.name = name.trim();
    testimonial.feedback = feedback.trim();
    if (rating) testimonial.rating = rating;

    const updatedTestimonial = await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: updatedTestimonial
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

// DELETE testimonial (protected route - user can only delete their own)
router.delete("/:id", authentication, async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete testimonial, verify ownership
    const testimonial = await Testimonial.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found or you don't have permission to delete it"
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

// GET single testimonial by ID (optional)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id).select("name feedback rating createdAt");
    
    if (!testimonial || !testimonial.isApproved) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonial",
      error: error.message
    });
  }
});

export default router;