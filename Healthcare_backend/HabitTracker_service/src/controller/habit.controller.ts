import type { Request, RequestHandler, Response } from "express";
import { TryCatch } from "../utils/TryCatch.js";
import {
  getOrCreateGoals,
  upsertGoals,
  getTodayLog,
  logHabit,
  getStreakData,
  getTrendData,
  getWeeklyTip,
} from "../services/habit.service.js";
import type { LogHabitBody } from "../services/habit.service.js";
import ErrorHandler from "../utils/errorHandler.js";

// ─── GET /goals ───────────────────────────────────────────────────────────────

export const getGoals:RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) throw new ErrorHandler(401, "Unauthorized");

  const goals = await getOrCreateGoals(userId);
  return res.status(200).json({ success: true, data: { goals } });
});

// ─── POST /goals ──────────────────────────────────────────────────────────────

export const updateGoals:RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) throw new ErrorHandler(401, "Unauthorized");

  const goals = await upsertGoals(userId, req.body);
  return res.status(200).json({ success: true, data: { goals } });
});

// ─── POST /log ────────────────────────────────────────────────────────────────

export const logHabitHandler:RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) throw new ErrorHandler(401, "Unauthorized");

  const { habit, value, action } = req.body as Partial<LogHabitBody>;

  if (!habit || value === undefined || !action) {
    throw new ErrorHandler(400, "Missing required fields: habit, value, action");
  }

  if (!["set", "increment"].includes(action)) {
    throw new ErrorHandler(400, "Invalid action. Must be 'set' or 'increment'");
  }

  const validHabits = [
    "hydration",
    "sleep",
    "physicalActivity",
    "meals",
    "screenBreaks",
    "stressRelief",
  ];
  if (!validHabits.includes(habit)) {
    throw new ErrorHandler(400, `Invalid habit key: '${habit}'`);
  }

  try {
    const result = await logHabit(userId, { habit, value, action });
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    // Service throws plain objects for validation errors
    if (err?.statusCode) {
      throw new ErrorHandler(err.statusCode, err.message);
    }
    throw err;
  }
});

// ─── GET /today ───────────────────────────────────────────────────────────────

export const getTodayHandler:RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) throw new ErrorHandler(401, "Unauthorized");

  const result = await getTodayLog(userId);
  return res.status(200).json({ success: true, data: result });
});

// ─── GET /streak ──────────────────────────────────────────────────────────────

export const getStreakHandler:RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) throw new ErrorHandler(401, "Unauthorized");

  const streak = await getStreakData(userId);
  return res.status(200).json({ success: true, data: { streak } });
});

// ─── GET /trends ──────────────────────────────────────────────────────────────

export const getTrendsHandler:RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) throw new ErrorHandler(401, "Unauthorized");

  const trends = await getTrendData(userId);
  return res.status(200).json({ success: true, data: { trends } });
});

// ─── GET /tip ─────────────────────────────────────────────────────────────────

export const getTipHandler:RequestHandler = TryCatch(async (req: Request, res: Response) => {
  const userId = req.user?.id as string | undefined;
  if (!userId) throw new ErrorHandler(401, "Unauthorized");

  const tipResult = await getWeeklyTip(userId);
  return res.status(200).json({ success: true, data: tipResult });
});
