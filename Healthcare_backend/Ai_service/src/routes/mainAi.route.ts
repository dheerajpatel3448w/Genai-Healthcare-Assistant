import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { mainAiController } from "../controllers/mainAi.controller.js";

const router3: Router = Router();

// POST /ai/chat  →  Patient sends a natural language query to HealthBrain
router3.post("/chat", isAuthenticated, mainAiController);

export default router3;