import express from "express";
const router = express.Router();

// controllers
import { signUp, signIn, logout } from "../controllers/authController.js";

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/logout", logout);

export default router;
