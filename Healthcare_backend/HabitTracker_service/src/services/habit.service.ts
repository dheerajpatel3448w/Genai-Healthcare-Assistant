import mongoose from "mongoose";
import { HabitGoal } from "../model/HabitGoal.model.js";
import { DailyLog } from "../model/DailyLog.model.js";
import type { IHabitGoal } from "../model/HabitGoal.model.js";
import type { IDailyLog } from "../model/DailyLog.model.js";

// ─── Shared Types ────────────────────────────────────────────────────────────

export type HabitKey =
  | "hydration"
  | "sleep"
  | "physicalActivity"
  | "meals"
  | "screenBreaks"
  | "stressRelief";

export type HabitStatus = "complete" | "partial" | "missed";

export interface StreakDay {
  date: string;
  status: HabitStatus;
  score: number;
}

export interface TrendDay {
  date: string;
  score: number;
  hydration: number;
  sleep: number;
  physicalActivity: number;
  meals: number;
  screenBreaks: number;
}

export interface LogHabitBody {
  habit: HabitKey;
  value: number | boolean;
  action: "set" | "increment";
}

// ─── Tip Lookup Table ─────────────────────────────────────────────────────────

const TIP_LOOKUP: Record<HabitKey, string> = {
  hydration:
    "Your hydration averaged under target this week. Keep a water bottle on your desk as a visual reminder — aim for one glass every waking hour.",
  sleep:
    "Your sleep averaged under your goal this week. Try setting a digital curfew 30 minutes earlier tonight and keep your bedroom cool and dark.",
  physicalActivity:
    "Your activity level was low this week. Even a brisk 10-minute walk after each meal counts — start small and build momentum.",
  meals:
    "Your healthy meal count was below target this week. Try prepping one extra nutritious meal the night before to reduce friction.",
  screenBreaks:
    "You took fewer screen breaks than planned. Set a recurring phone alarm every 90 minutes as a reminder to stretch and rest your eyes.",
  stressRelief:
    "You skipped stress relief practice most days this week. Even 5 minutes of deep breathing or a short meditation can reset your nervous system.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns today's date as a "YYYY-MM-DD" string, timezone-safe. */
function getTodayStr(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/**
 * Returns an array of the last N date strings in "YYYY-MM-DD" format,
 * ordered from oldest to newest (index 0 = N-1 days ago, last index = today).
 */
function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0] as string);
  }
  return dates;
}

// ─── Wellness Score ───────────────────────────────────────────────────────────

/**
 * Calculates a wellness score from 0–100.
 * Each of the 6 habits contributes an equal 1/6 of the total.
 * Numeric habits are scored proportionally (capped at 1.0 ratio).
 * The boolean habit (stressRelief) is either full credit or zero.
 */
export function calculateWellnessScore(
  log: IDailyLog,
  goals: IHabitGoal
): number {
  const WEIGHT = 100 / 6;

  const numericScore = (actual: number, target: number): number => {
    if (target <= 0) return WEIGHT;
    return Math.min(actual / target, 1) * WEIGHT;
  };

  const total =
    numericScore(log.hydration, goals.hydrationTarget) +
    numericScore(log.sleep, goals.sleepTarget) +
    numericScore(log.physicalActivity, goals.physicalActivityTarget) +
    numericScore(log.meals, goals.mealsTarget) +
    numericScore(log.screenBreaks, goals.screenBreakTarget) +
    (log.stressRelief ? WEIGHT : 0);

  return Math.min(Math.round(total), 100);
}

// ─── Goals ────────────────────────────────────────────────────────────────────

/**
 * Fetches the user's habit goals, auto-creating with defaults if none exist.
 */
export async function getOrCreateGoals(userId: string): Promise<IHabitGoal> {
  const goals = await HabitGoal.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  // findOneAndUpdate with upsert always returns a document
  return goals!;
}

/**
 * Creates or updates the user's goal profile.
 * Only the supplied fields are updated; others remain unchanged.
 */
export async function upsertGoals(
  userId: string,
  body: Partial<IHabitGoal>
): Promise<IHabitGoal> {
  // Strip non-goal fields that should not be overwritten
  const { userId: _uid, _id, createdAt, updatedAt, ...safeBody } = body as any;

  const goals = await HabitGoal.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $set: safeBody },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return goals!;
}

// ─── Today's Log ──────────────────────────────────────────────────────────────

export interface TodayLogResult {
  log: IDailyLog | null;
  goals: IHabitGoal;
  wellnessScore: number;
}

/**
 * Returns today's log, the user's goals, and the current wellness score.
 * If no log exists for today, returns null for log and a score of 0.
 */
export async function getTodayLog(userId: string): Promise<TodayLogResult> {
  const today = getTodayStr();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [log, goals] = await Promise.all([
    DailyLog.findOne({ userId: userObjectId, date: today }),
    getOrCreateGoals(userId),
  ]);

  const wellnessScore = log ? calculateWellnessScore(log, goals) : 0;
  return { log, goals, wellnessScore };
}

// ─── Log Habit ────────────────────────────────────────────────────────────────

const NUMERIC_HABITS: HabitKey[] = [
  "hydration",
  "sleep",
  "physicalActivity",
  "meals",
  "screenBreaks",
];

/**
 * Logs or increments a single habit for today.
 * Recalculates and persists the updated wellness score.
 */
export async function logHabit(
  userId: string,
  body: LogHabitBody
): Promise<{ log: IDailyLog; wellnessScore: number }> {
  const { habit, value, action } = body;

  // Validate: stressRelief must be a boolean
  if (habit === "stressRelief" && typeof value !== "boolean") {
    throw { statusCode: 400, message: "stressRelief value must be a boolean (true or false)" };
  }

  // Validate: numeric habits must receive a number
  if (NUMERIC_HABITS.includes(habit) && typeof value !== "number") {
    throw { statusCode: 400, message: `${habit} value must be a number` };
  }

  // Validate: increment only works on numeric habits
  if (action === "increment" && habit === "stressRelief") {
    throw { statusCode: 400, message: "Cannot use 'increment' action on a boolean habit. Use 'set' instead." };
  }

  const today = getTodayStr();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  let update: object;
  if (action === "increment") {
    update = { $inc: { [habit]: value } };
  } else {
    update = { $set: { [habit]: value } };
  }

  const log = await DailyLog.findOneAndUpdate(
    { userId: userObjectId, date: today },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Recalculate and persist wellness score
  const goals = await getOrCreateGoals(userId);
  const wellnessScore = calculateWellnessScore(log!, goals);

  const log2 = await DailyLog.findByIdAndUpdate(
    log!._id,
    { $set: { wellnessScore } },
    { new: true }
  );

  return { log: log2!, wellnessScore };
}

// ─── Streak Data ─────────────────────────────────────────────────────────────

/**
 * Returns the last 7 days as a streak calendar array.
 * Status: complete (score ≥ 80), partial (score 1–79), missed (no log or score 0).
 */
export async function getStreakData(userId: string): Promise<StreakDay[]> {
  const dates = getLastNDates(7);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const logs = await DailyLog.find({
    userId: userObjectId,
    date: { $in: dates },
  });

  const logMap = new Map<string, IDailyLog>();
  for (const log of logs) {
    logMap.set(log.date, log);
  }

  return dates.map((date) => {
    const log = logMap.get(date);
    const score = log?.wellnessScore ?? 0;

    let status: HabitStatus;
    if (!log || score === 0) {
      status = "missed";
    } else if (score >= 80) {
      status = "complete";
    } else {
      status = "partial";
    }

    return { date, status, score };
  });
}

// ─── Trend Data ───────────────────────────────────────────────────────────────

/**
 * Returns the last 7 days of habit data for Chart.js trend charts.
 * Days with no log are returned with all values as 0.
 */
export async function getTrendData(userId: string): Promise<TrendDay[]> {
  const dates = getLastNDates(7);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const logs = await DailyLog.find({
    userId: userObjectId,
    date: { $in: dates },
  });

  const logMap = new Map<string, IDailyLog>();
  for (const log of logs) {
    logMap.set(log.date, log);
  }

  return dates.map((date) => {
    const log = logMap.get(date);
    return {
      date,
      score: log?.wellnessScore ?? 0,
      hydration: log?.hydration ?? 0,
      sleep: log?.sleep ?? 0,
      physicalActivity: log?.physicalActivity ?? 0,
      meals: log?.meals ?? 0,
      screenBreaks: log?.screenBreaks ?? 0,
    };
  });
}

// ─── Weekly Tip ───────────────────────────────────────────────────────────────

export interface WeeklyTipResult {
  tip: string;
  weakestHabit: HabitKey;
  completionRates: Record<HabitKey, number>;
}

/**
 * Analyses the last 7 days to find the weakest habit and returns a rule-based tip.
 * Completion rate for each habit = average(actual / target) over available logs.
 * stressRelief is scored as 1 (achieved) or 0 (not achieved) per day.
 */
export async function getWeeklyTip(userId: string): Promise<WeeklyTipResult> {
  const dates = getLastNDates(7);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [logs, goals] = await Promise.all([
    DailyLog.find({ userId: userObjectId, date: { $in: dates } }),
    getOrCreateGoals(userId),
  ]);

  const habitKeys: HabitKey[] = [
    "hydration",
    "sleep",
    "physicalActivity",
    "meals",
    "screenBreaks",
    "stressRelief",
  ];

  // Calculate per-habit average completion rates over the 7 days.
  // If no logs exist at all, default everything to 0 so stressRelief is picked.
  const completionRates = {} as Record<HabitKey, number>;

  for (const key of habitKeys) {
    if (logs.length === 0) {
      completionRates[key] = 0;
      continue;
    }

    if (key === "stressRelief") {
      const achieved = logs.filter((l) => l.stressRelief).length;
      completionRates[key] = achieved / logs.length;
    } else {
      const target = goals[`${key}Target` as keyof IHabitGoal] as number;
      if (target <= 0) {
        completionRates[key] = 1;
        continue;
      }
      const totalRate = logs.reduce((sum, log) => {
        return sum + Math.min((log[key] as number) / target, 1);
      }, 0);
      completionRates[key] = totalRate / logs.length;
    }
  }

  // Find the habit with the lowest completion rate
  let weakestHabit: HabitKey = "hydration";
  let lowestRate = Infinity;

  for (const key of habitKeys) {
    const rate = completionRates[key] ?? 0;
    if (rate < lowestRate) {
      lowestRate = rate;
      weakestHabit = key;
    }
  }

  return {
    tip: TIP_LOOKUP[weakestHabit],
    weakestHabit,
    completionRates,
  };
}
