import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { doctorAiController } from "../controllers/doctorAi.controller.js";

const doctorAiRouter: Router = Router();

// POST /doctor-ai/chat  →  Doctor sends a natural language query to DoctorBrain
doctorAiRouter.post("/chat", isAuthenticated, doctorAiController);

export default doctorAiRouter;
