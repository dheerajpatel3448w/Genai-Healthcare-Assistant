import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { mainAiController, getAiHistory } from "../controllers/mainAi.controller.js";

const router3: Router = Router();

// POST /ai/chat  →  Patient sends a natural language query to HealthBrain
router3.post("/chat", isAuthenticated, mainAiController);

// GET /ai/history → Patient's past AI consultation history
router3.get("/history", isAuthenticated, getAiHistory);

export default router3;
