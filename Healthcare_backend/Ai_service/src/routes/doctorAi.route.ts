import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { doctorAiController, getDoctorAiHistory } from "../controllers/doctorAi.controller.js";

const doctorAiRouter: Router = Router();

// POST /doctor-ai/chat  →  Doctor sends a natural language query to DoctorBrain
doctorAiRouter.post("/chat", isAuthenticated, doctorAiController);

// GET /doctor-ai/history → Doctor's past AI consultation history
doctorAiRouter.get("/history", isAuthenticated, getDoctorAiHistory);

export default doctorAiRouter;
