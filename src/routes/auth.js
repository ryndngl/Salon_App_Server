
// Updated auth.js routes - Add verify-token route
import express from "express";
const router = express.Router();

// controllers
import { signUp, signIn, verifyToken, logout } from "../controllers/authController.js";

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/verify-token", verifyToken); // NEW: Token verification endpoint
router.post("/logout", logout);

export default router;