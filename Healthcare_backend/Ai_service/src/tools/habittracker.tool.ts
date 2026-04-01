import { tool } from "@openai/agents";
import { z } from "zod";
import mongoose from "mongoose";
import { DailyLog } from "../models/DailyLog.model.js";
import { HabitGoal } from "../models/HabitGoal.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// Shared types & helpers
// ─────────────────────────────────────────────────────────────────────────────

type HabitKey = "hydration" | "sleep" | "physicalActivity" | "meals" | "screenBreaks" | "stressRelief";

const HABIT_KEYS: HabitKey[] = [
  "hydration",
  "sleep",
  "physicalActivity",
  "meals",
  "screenBreaks",
  "stressRelief",
];

const HABIT_LABELS: Record<HabitKey, string> = {
  hydration:        "Hydration",
  sleep:            "Sleep",
  physicalActivity: "Physical Activity",
  meals:            "Healthy Meals",
  screenBreaks:     "Screen Breaks",
  stressRelief:     "Stress Relief",
};

const HABIT_UNITS: Record<HabitKey, string> = {
  hydration:        "glasses of water",
  sleep:            "hours of sleep",
  physicalActivity: "minutes of activity",
  meals:            "healthy meals",
  screenBreaks:     "screen breaks",
  stressRelief:     "",
};

/** Returns today's date as a "YYYY-MM-DD" string */
function getTodayStr(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/** Returns the last N date strings oldest → newest */
function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0] as string);
  }
  return dates;
}

/** Calculates wellness score 0-100 from a log + goal document */
function calcWellnessScore(log: any, goals: any): number {
  const WEIGHT = 100 / 6;
  const numericScore = (actual: number, target: number) =>
    target <= 0 ? WEIGHT : Math.min(actual / target, 1) * WEIGHT;

  const total =
    numericScore(log.hydration ?? 0, goals.hydrationTarget ?? 8) +
    numericScore(log.sleep ?? 0, goals.sleepTarget ?? 7) +
    numericScore(log.physicalActivity ?? 0, goals.physicalActivityTarget ?? 30) +
    numericScore(log.meals ?? 0, goals.mealsTarget ?? 3) +
    numericScore(log.screenBreaks ?? 0, goals.screenBreakTarget ?? 5) +
    (log.stressRelief ? WEIGHT : 0);

  return Math.min(Math.round(total), 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ TOOL 1: get_today_wellness_snapshot
// Fetches today's DailyLog + HabitGoal, computes completion rates & score.
// ─────────────────────────────────────────────────────────────────────────────
export const getTodayWellnessSnapshotTool = tool({
  name: "get_today_wellness_snapshot",
  description:
    "Fetch the user's habit log for today and their goal targets. Returns the wellness score, per-habit completion rates, and a plain-language snapshot summary. Call this FIRST to get today's real data.",
  parameters: z.object({
    userId: z.string().describe("The user's MongoDB ObjectId."),
  }),
  execute: async ({ userId }) => {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, snapshot: "Invalid userId.", wellnessScore: 0, completionRates: {}, log: null, goals: null };
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const today = getTodayStr();

      const [log, goals] = await Promise.all([
        DailyLog.findOne({ userId: userObjectId, date: today }).lean(),
        HabitGoal.findOne({ userId: userObjectId }).lean(),
      ]);

      // Fall back to defaults if no goal profile
      const effectiveGoals = goals ?? {
        hydrationTarget: 8, sleepTarget: 7, physicalActivityTarget: 30,
        mealsTarget: 3, screenBreakTarget: 5, stressReliefTarget: true,
      };

      const wellnessScore = log ? calcWellnessScore(log, effectiveGoals) : 0;

      // Build completion rates
      const completionRates: Record<string, number> = {};
      if (log) {
        completionRates.hydration        = Math.min((log.hydration ?? 0)        / (effectiveGoals.hydrationTarget ?? 8), 1);
        completionRates.sleep            = Math.min((log.sleep ?? 0)            / (effectiveGoals.sleepTarget ?? 7), 1);
        completionRates.physicalActivity = Math.min((log.physicalActivity ?? 0) / (effectiveGoals.physicalActivityTarget ?? 30), 1);
        completionRates.meals            = Math.min((log.meals ?? 0)            / (effectiveGoals.mealsTarget ?? 3), 1);
        completionRates.screenBreaks     = Math.min((log.screenBreaks ?? 0)     / (effectiveGoals.screenBreakTarget ?? 5), 1);
        completionRates.stressRelief     = log.stressRelief ? 1 : 0;
      } else {
        for (const key of HABIT_KEYS) completionRates[key] = 0;
      }

      // Build plain-language snapshot
      let snapshot: string;
      if (!log) {
        snapshot = `No habits logged today (${today}). Wellness score: 0/100. Goals: ${effectiveGoals.hydrationTarget} glasses water, ${effectiveGoals.sleepTarget}h sleep, ${effectiveGoals.physicalActivityTarget}min activity.`;
      } else {
        const lines = [
          `Today (${today}) — Wellness Score: ${wellnessScore}/100`,
          `• Hydration: ${log.hydration ?? 0}/${effectiveGoals.hydrationTarget} ${HABIT_UNITS.hydration}`,
          `• Sleep: ${log.sleep ?? 0}/${effectiveGoals.sleepTarget} ${HABIT_UNITS.sleep}`,
          `• Physical Activity: ${log.physicalActivity ?? 0}/${effectiveGoals.physicalActivityTarget} ${HABIT_UNITS.physicalActivity}`,
          `• Meals: ${log.meals ?? 0}/${effectiveGoals.mealsTarget} ${HABIT_UNITS.meals}`,
          `• Screen Breaks: ${log.screenBreaks ?? 0}/${effectiveGoals.screenBreakTarget} ${HABIT_UNITS.screenBreaks}`,
          `• Stress Relief: ${log.stressRelief ? "✅ Done" : "❌ Not done"}`,
        ];
        snapshot = lines.join("\n");
      }

      return { success: true, snapshot, wellnessScore, completionRates, log, goals: effectiveGoals };
    } catch (error: any) {
      console.error("getTodayWellnessSnapshotTool error:", error);
      return { success: false, snapshot: "Failed to fetch today's wellness data.", wellnessScore: 0, completionRates: {}, log: null, goals: null };
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ TOOL 2: get_weekly_habit_analysis
// Fetches last 7 DailyLogs and computes weekly stats, streak, weakest/strongest habit.
// ─────────────────────────────────────────────────────────────────────────────
export const getWeeklyHabitAnalysisTool = tool({
  name: "get_weekly_habit_analysis",
  description:
    "Analyse the user's last 7 days of habit logs. Returns weekly averages per habit, streak count, weakest and strongest habits, and trend direction (improving/declining/stable). Call this for any weekly or trend question.",
  parameters: z.object({
    userId: z.string().describe("The user's MongoDB ObjectId."),
  }),
  execute: async ({ userId }) => {
    try {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, weekSummary: "Invalid userId.", streakCount: 0, logsFound: 0, weakestHabit: "hydration", strongestHabit: "hydration", trendSummary: [] };
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const dates = getLastNDates(7);

      const [logs, goals] = await Promise.all([
        DailyLog.find({ userId: userObjectId, date: { $in: dates } }).lean(),
        HabitGoal.findOne({ userId: userObjectId }).lean(),
      ]);

      const effectiveGoals = goals ?? {
        hydrationTarget: 8, sleepTarget: 7, physicalActivityTarget: 30,
        mealsTarget: 3, screenBreakTarget: 5, stressReliefTarget: true,
      };

      if (!logs || logs.length === 0) {
        return {
          success: true,
          weekSummary: "No habit logs found for the past 7 days. Start logging today to track your wellness journey!",
          streakCount: 0,
          logsFound: 0,
          weakestHabit: "hydration" as HabitKey,
          strongestHabit: "hydration" as HabitKey,
          trendSummary: HABIT_KEYS.map(h => ({ habit: h, avgCompletion: 0, trend: "no_data" })),
        };
      }

      // Build a date → log map
      const logByDate = new Map(logs.map(l => [l.date, l]));

      // Compute per-habit averages across available logs
      const habitAvg: Record<HabitKey, number> = {} as any;
      for (const key of HABIT_KEYS) {
        if (key === "stressRelief") {
          const achieved = logs.filter(l => l.stressRelief).length;
          habitAvg[key] = achieved / logs.length;
        } else {
          const targetKey = `${key}Target` as keyof typeof effectiveGoals;
          const target = (effectiveGoals[targetKey] as number) || 1;
          const total = logs.reduce((sum, l) => sum + Math.min(((l as any)[key] as number) / target, 1), 0);
          habitAvg[key] = total / logs.length;
        }
      }

      // Find weakest and strongest
      let weakestHabit: HabitKey = "hydration";
      let strongestHabit: HabitKey = "hydration";
      let lowestRate = Infinity;
      let highestRate = -Infinity;
      for (const key of HABIT_KEYS) {
        const rate = habitAvg[key] ?? 0;
        if (rate < lowestRate) { lowestRate = rate; weakestHabit = key; }
        if (rate > highestRate) { highestRate = rate; strongestHabit = key; }
      }

      // Compute streak (consecutive complete days from most recent backwards)
      let streakCount = 0;
      const sortedDates = [...dates].reverse(); // newest first
      for (const date of sortedDates) {
        const log = logByDate.get(date);
        if (!log) break;
        const score = calcWellnessScore(log, effectiveGoals);
        if (score >= 80) { streakCount++; } else { break; }
      }

      // Trend summary — compare first 3 days avg vs last 3 days avg per habit
      const firstHalf = dates.slice(0, 3).map(d => logByDate.get(d)).filter(Boolean);
      const secondHalf = dates.slice(4, 7).map(d => logByDate.get(d)).filter(Boolean);

      const trendSummary = HABIT_KEYS.map(key => {
        const getVal = (log: any) =>
          key === "stressRelief" ? (log.stressRelief ? 1 : 0) : ((log as any)[key] ?? 0);

        const avgFirst  = firstHalf.length  > 0 ? firstHalf.reduce((s, l) => s + getVal(l), 0)  / firstHalf.length  : 0;
        const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((s, l) => s + getVal(l), 0) / secondHalf.length : 0;

        let trend = "stable";
        const diff = avgSecond - avgFirst;
        if (diff > 0.1) trend = "improving";
        else if (diff < -0.1) trend = "declining";

        return { habit: key as HabitKey, avgCompletion: parseFloat((habitAvg[key] * 100).toFixed(1)), trend };
      });

      // Build plain-language week summary
      const avgScore = logs.reduce((s, l) => s + l.wellnessScore, 0) / logs.length;
      const weekSummary = [
        `Last 7 days: ${logs.length} days logged, average wellness score ${Math.round(avgScore)}/100.`,
        `Current streak: ${streakCount} consecutive ${streakCount === 1 ? "day" : "days"} with score ≥ 80.`,
        `Strongest habit: ${HABIT_LABELS[strongestHabit]} (${Math.round(highestRate * 100)}% avg completion).`,
        `Weakest habit: ${HABIT_LABELS[weakestHabit]} (${Math.round(lowestRate * 100)}% avg completion) — needs the most attention this week.`,
      ].join(" ");

      return { success: true, weekSummary, streakCount, logsFound: logs.length, weakestHabit, strongestHabit, trendSummary };
    } catch (error: any) {
      console.error("getWeeklyHabitAnalysisTool error:", error);
      return { success: false, weekSummary: "Failed to fetch weekly analysis.", streakCount: 0, logsFound: 0, weakestHabit: "hydration" as HabitKey, strongestHabit: "hydration" as HabitKey, trendSummary: [] };
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ TOOL 3: get_personalized_wellness_coaching
// Pure rule engine — produces a focused action plan based on weakest habit + score.
// Does NOT query the DB directly. Agent passes context from Tools 1 & 2.
// ─────────────────────────────────────────────────────────────────────────────

const COACHING_TIPS: Record<HabitKey, { focus: string; steps: string[]; motivation: string }> = {
  hydration: {
    focus: "Hydration — Drinking more water throughout the day",
    steps: [
      "Keep a full water bottle visible on your desk right now — if you can see it, you will drink it.",
      "Set a phone alarm every 90 minutes as a gentle reminder to take at least 2–3 sips.",
      "Drink one full glass of water before each meal — this alone adds 3 glasses to your daily total.",
    ],
    motivation: "Even a 1% improvement in hydration can meaningfully improve your focus, energy, and kidney health.",
  },
  sleep: {
    focus: "Sleep Quality & Duration — Getting consistent, restorative rest",
    steps: [
      "Set a fixed bedtime alarm for tonight — consistency in sleep timing matters more than duration.",
      "Create a 15-minute digital curfew: no screens 15 minutes before bed, starting tonight.",
      "Keep your bedroom 1–2 degrees cooler than your normal comfort zone — cooler temperatures trigger sleep faster.",
    ],
    motivation: "One extra hour of quality sleep tonight will noticeably improve your mood, focus, and immune response tomorrow.",
  },
  physicalActivity: {
    focus: "Physical Activity — Building consistent movement into your day",
    steps: [
      "Start with just a 10-minute brisk walk after your next meal — this counts as activity and aids digestion.",
      "Take the stairs instead of the elevator for every floor change today.",
      "Set a standing/stretching reminder for every hour you spend sitting — even 2 minutes of movement helps.",
    ],
    motivation: "Just 10 minutes of movement releases endorphins that improve your mood and energy for the next 2–3 hours.",
  },
  meals: {
    focus: "Nutrition — Eating more balanced, healthy meals",
    steps: [
      "Ensure your next meal includes one serving of a vegetable or fruit — even if small.",
      "Swap one processed snack today with a handful of nuts, fruit, or yogurt.",
      "Prepare or plan your next healthy meal now — reducing decision fatigue at meal time leads to better choices.",
    ],
    motivation: "Each nutritious meal you eat is a building block for better long-term health — one good choice leads to the next.",
  },
  screenBreaks: {
    focus: "Screen Breaks — Protecting your eyes and mental clarity",
    steps: [
      "Use the 20-20-20 rule right now: look at something 20 feet away for 20 seconds.",
      "Set a recurring 90-minute alarm on your phone labeled 'Stand & Stretch' — commit to it today.",
      "During your next break, step outside or look out a window for at least 2 minutes.",
    ],
    motivation: "Regular screen breaks reduce eye strain by up to 40% and measurably improve your productivity and concentration.",
  },
  stressRelief: {
    focus: "Stress Management — Building a daily mental reset habit",
    steps: [
      "Take 5 deep breaths right now: inhale for 4 seconds, hold for 4, exhale for 6 — this activates your parasympathetic system.",
      "Schedule a 5-minute mindfulness or breathing session on your calendar for today.",
      "Write down 3 things you are grateful for before you sleep tonight — this shifts focus from stress to positivity.",
    ],
    motivation: "Even 5 minutes of intentional stress relief daily lowers cortisol, improves sleep quality, and strengthens your immune system.",
  },
};

export const getPersonalizedWellnessCoachingTool = tool({
  name: "get_personalized_wellness_coaching",
  description:
    "Generate a personalised 3-step wellness action plan based on the user's weakest habit and current wellness score. This is a pure rule engine — pass the weakestHabit from `get_weekly_habit_analysis` and wellnessScore from `get_today_wellness_snapshot`. No DB call is made.",
  parameters: z.object({
    userId:          z.string().describe("The user's MongoDB ObjectId (for logging context only)."),
    weakestHabit:    z.string().describe("The habit with the lowest average completion rate. From get_weekly_habit_analysis."),
    wellnessScore:   z.number().describe("The user's current today wellness score (0-100). From get_today_wellness_snapshot."),
    specificConcern: z.string().optional().nullable().describe("The user's exact concern or query for extra personalisation."),
  }),
  execute: async ({ weakestHabit, wellnessScore, specificConcern }) => {
    try {
      const habitKey = (HABIT_KEYS.includes(weakestHabit as HabitKey) ? weakestHabit : "hydration") as HabitKey;
      const coaching = COACHING_TIPS[habitKey];

      // Personalise motivation based on score
      let urgencyNote = "";
      if (wellnessScore < 30) {
        urgencyNote = "⚠️ Your wellness score is critically low. Small, consistent steps matter most right now — don't try to fix everything at once.";
      } else if (wellnessScore < 60) {
        urgencyNote = "You are making progress. Focusing on your weakest habit will create the biggest jump in your overall score.";
      } else {
        urgencyNote = "You are doing well overall! Fine-tuning your weakest habit will push you into peak performance territory.";
      }

      // Build coaching message
      const coachingMessage = [
        specificConcern
          ? `Based on your question: "${specificConcern}" — here is your personalised wellness coaching:\n`
          : "",
        `**Focus area:** ${coaching.focus}`,
        `\n${urgencyNote}`,
      ].filter(Boolean).join("\n");

      return {
        success:          true,
        focus_area:       coaching.focus,
        coaching_message: coachingMessage,
        action_plan:      coaching.steps,
        motivation_note:  coaching.motivation,
        urgent_flag:      wellnessScore < 30,
      };
    } catch (error: any) {
      console.error("getPersonalizedWellnessCoachingTool error:", error);
      return {
        success:          false,
        focus_area:       "General Wellness",
        coaching_message: "Stay consistent with your habits daily.",
        action_plan:      ["Drink more water", "Get 7-8 hours of sleep", "Exercise for 30 minutes"],
        motivation_note:  "Every small step forward counts.",
        urgent_flag:      false,
      };
    }
  },
});
