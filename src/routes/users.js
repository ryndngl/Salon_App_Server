import express from "express";
const router = express.Router();

// controllers
import { getUserProfile } from "../controllers/userController.js";

// middlewares
import authentication from "../middlewares/authentication.js";

// Protected route: get user profile by ID
router.get("/:id", authentication, getUserProfile);

export default router;
