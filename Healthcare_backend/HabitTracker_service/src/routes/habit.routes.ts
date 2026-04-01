import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getGoals,
  updateGoals,
  logHabitHandler,
  getTodayHandler,
  getStreakHandler,
  getTrendsHandler,
  getTipHandler,
} from "../controller/habit.controller.js";

const router = Router();

// All habit routes require a valid JWT
router.use(isAuthenticated);

router.get("/goals",  getGoals);
router.post("/goals", updateGoals);

router.post("/log",   logHabitHandler);

router.get("/today",  getTodayHandler);
router.get("/streak", getStreakHandler);
router.get("/trends", getTrendsHandler);
router.get("/tip",    getTipHandler);

export default router;
