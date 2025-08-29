// src/routes/auth.js
import express from "express";
const router = express.Router();

// controllers - ONLY use one implementation
import { signUp, signIn, verifyToken, logout } from "../controllers/authController.js";

// Use the dedicated controller for password reset
import { forgotPassword, resetPassword } from "../controllers/forgotPasswordController.js";

// =========================
//  Auth Routes
// =========================
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/verify-token", verifyToken);
router.post("/logout", logout);

// =========================
//  Forgot/Reset Password Routes (using dedicated controller)
// =========================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;