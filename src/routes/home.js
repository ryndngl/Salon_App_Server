import express from "express";
const router = express.Router();
// controllers
import { home } from "../controllers/homeControllers.js";

// middlewares
import authentication from "../middlewares/authentication.js";
router.use(authentication);

router.get("/", home);

export default router;
