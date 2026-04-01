# HabitTracker Service — Full Implementation Plan

A standalone Express/TypeScript microservice running on **port 5006** for the NovaCure Healthcare Platform. It tracks 6 daily wellness habits, calculates a dynamic wellness score, provides 7-day streak data, trend chart data, and a rule-based personalized weekly tip — all without requiring an LLM.

---

## Current State (Already Done ✅)

The following files have already been created and do **not** need to be modified:

| File | Status |
|---|---|
| `src/model/HabitGoal.model.ts` | ✅ Done |
| `src/model/DailyLog.model.ts` | ✅ Done |
| `src/model/user.model.ts` | ✅ Done (mirror of auth-service) |
| `src/middlewares/auth.middleware.ts` | ✅ Done |
| `src/utils/TryCatch.ts` | ✅ Done |
| `src/utils/errorHandler.ts` | ✅ Done |
| `src/config/db.ts` | ✅ Done |
| `package.json`, `tsconfig.json`, `.env` | ✅ Done |

---

## What Needs To Be Built 🔨

The following directories are **completely empty** and require implementation:

```
src/
├── services/     ← EMPTY — core business logic lives here
├── controller/   ← EMPTY — HTTP handlers live here
├── routes/       ← EMPTY — route registration lives here
```

Plus two **entry-point files** are missing:
- `src/app.ts`
- `src/index.ts`

---

## Proposed Changes

### Phase 1 — Core Business Logic

---

#### [NEW] `src/services/habit.service.ts`

This is the heart of the service. All DB queries and computation logic belong here. The controller will be a thin layer that just calls this service.

**Functions to implement:**

##### `getOrCreateGoals(userId: string): Promise<IHabitGoal>`
- Uses `HabitGoal.findOneAndUpdate({ userId }, {}, { upsert: true, new: true, setDefaultsOnInsert: true })`
- Returns the user's goal profile, creating one with defaults if it doesn't exist yet.

##### `upsertGoals(userId: string, body: Partial<IHabitGoal>): Promise<IHabitGoal>`
- Updates the user's goal profile using `findOneAndUpdate` with `upsert: true`.
- Validates that numeric values (e.g., hydrationTarget) are positive numbers using `zod`.

##### `calculateWellnessScore(log: IDailyLog, goals: IHabitGoal): number`
- Pure function. Takes a log and a goal document, returns a score `0–100`.
- **Logic:**
  ```
  Each habit has a weight of 100/6 ≈ 16.67 points.

  Numeric habits (hydration, sleep, physicalActivity, meals, screenBreaks):
    contribution = Math.min(actual / target, 1) * 16.67

  Boolean habit (stressRelief):
    contribution = stressRelief ? 16.67 : 0

  totalScore = sum of all 6 contributions → round to nearest integer
  ```
- Score is **capped at 100**. Over-achieving a numeric target does not give bonus points.

##### `getTodayLog(userId: string): Promise<{ log: IDailyLog | null; goals: IHabitGoal; wellnessScore: number }>`
- Gets today's date as `YYYY-MM-DD` string (use `new Date().toISOString().split('T')[0]`).
- Fetches the log for today with `DailyLog.findOne({ userId, date: todayStr })`.
- Fetches goals with `getOrCreateGoals`.
- Calculates the wellnessScore before returning.

##### `logHabit(userId: string, body: { habit: HabitKey; value: number | boolean; action: 'set' | 'increment' }): Promise<IDailyLog>`
- `HabitKey` is a TypeScript union type: `'hydration' | 'sleep' | 'physicalActivity' | 'meals' | 'screenBreaks' | 'stressRelief'`
- Gets today's date string.
- Uses `DailyLog.findOneAndUpdate({ userId, date }, update, { upsert: true, new: true, setDefaultsOnInsert: true })`.
- **`action: 'increment'`**: Uses `{ $inc: { [habit]: value } }` for numeric habits.
- **`action: 'set'`**: Uses `{ $set: { [habit]: value } }` for both boolean (`stressRelief`) and numeric habits.
- After saving, recalculates `wellnessScore` and saves it back.
- Validates that `stressRelief` only receives a boolean value.

##### `getStreakData(userId: string): Promise<StreakDay[]>`
- Fetches the last 7 days of logs, one per day.
- Generates an array of the last 7 date strings (today → 6 days ago).
- For each date, checks if a log exists and calculates score:
  - **`complete`** → wellnessScore ≥ 80
  - **`partial`** → wellnessScore > 0 and < 80
  - **`missed`** → no log exists or wellnessScore === 0
- Returns an array of `{ date: string; status: 'complete' | 'partial' | 'missed'; score: number }`.

##### `getTrendData(userId: string): Promise<TrendDay[]>`
- Fetches the last 7 days of logs (same query as streak).
- Returns `{ date: string; score: number; hydration: number; sleep: number; physicalActivity: number }[]` for Chart.js consumption.

##### `getWeeklyTip(userId: string): Promise<{ tip: string; weakestHabit: string }>`
- Fetches last 7 days of logs AND the user's goals.
- For each of the 6 habits, calculates the **average completion rate** over the past 7 days.
- Identifies the habit with the lowest average completion rate.
- Looks up a **static tip lookup table** (a plain object in the same file):

```typescript
const TIP_LOOKUP: Record<HabitKey, string> = {
  hydration:        "Your hydration averaged under target this week. Keep a water bottle on your desk as a visual reminder to drink more.",
  sleep:            "Your sleep averaged under target this week. Try setting a digital curfew 30 minutes earlier tonight.",
  physicalActivity: "Your activity was low this week. Even a 10-minute walk after meals counts — start small and build up.",
  meals:            "Your healthy meal count was low this week. Try prepping one extra healthy meal the night before.",
  screenBreaks:     "You took fewer screen breaks than planned. Set a recurring phone alarm every 90 minutes as a reminder.",
  stressRelief:     "You skipped stress relief practice most days. Even 5 minutes of deep breathing can reset your nervous system.",
};
```

---

### Phase 2 — HTTP Controllers

---

#### [NEW] `src/controller/habit.controller.ts`

A thin layer. All controllers use the `TryCatch` wrapper from `../utils/TryCatch.js`. All controllers extract `userId` from `req.user.id` (populated by the `isAuthenticated` middleware).

| Controller Function | Method & Path | Calls Service Function |
|---|---|---|
| `getGoals` | `GET /goals` | `getOrCreateGoals` |
| `upsertGoals` | `POST /goals` | `upsertGoals` |
| `logHabit` | `POST /log` | `logHabit` |
| `getTodayLog` | `GET /today` | `getTodayLog` |
| `getStreak` | `GET /streak` | `getStreakData` |
| `getTrends` | `GET /trends` | `getTrendData` |
| `getWeeklyTip` | `GET /tip` | `getWeeklyTip` |

**Standard response shape for all controllers:**
```json
{ "success": true, "data": { ... } }
```

**Error shape (handled by global error middleware):**
```json
{ "success": false, "message": "..." }
```

---

### Phase 3 — Routes

---

#### [NEW] `src/routes/habit.routes.ts`

```typescript
import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
  getGoals, upsertGoals, logHabit, getTodayLog, getStreak, getTrends, getWeeklyTip
} from '../controller/habit.controller.js';

const router = Router();

// All routes are protected
router.use(isAuthenticated);

router.get('/goals',  getGoals);
router.post('/goals', upsertGoals);
router.post('/log',   logHabit);
router.get('/today',  getTodayLog);
router.get('/streak', getStreak);
router.get('/trends', getTrends);
router.get('/tip',    getWeeklyTip);

export default router;
```

---

### Phase 4 — Application Entry Points

---

#### [NEW] `src/app.ts`

Following the exact same pattern as `Appoinment_service/src/app.ts`:

```typescript
import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import habitRoutes from './routes/habit.routes.js';
import ErrorHandler from './utils/errorHandler.js';

dotenv.config();

const app: Express = express();

// Request logger
app.use((req, _res, next) => { console.log(req.method, req.url); next(); });

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check — no auth required
app.get('/health', (_req, res) => res.status(200).json({ status: 'OK', service: 'HabitTracker' }));

// API Routes
app.use('/api/v1/habits', habitRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof ErrorHandler ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({ success: false, message });
});

export default app;
```

#### [NEW] `src/index.ts`

Following the exact same pattern as `Appoinment_service/src/index.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connectDb } from './config/db.js';

connectDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`HabitTracker service running on port ${process.env.PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});
```

---

## API Reference (Complete)

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/health` | ❌ | — | Service health check |
| `GET` | `/api/v1/habits/goals` | ✅ | — | Get or auto-create user's goal profile |
| `POST` | `/api/v1/habits/goals` | ✅ | `{ hydrationTarget?, sleepTarget?, ... }` | Create or update goals |
| `POST` | `/api/v1/habits/log` | ✅ | `{ habit, value, action }` | Log a habit for today |
| `GET` | `/api/v1/habits/today` | ✅ | — | Get today's full log + wellness score |
| `GET` | `/api/v1/habits/streak` | ✅ | — | Get last 7 days' status for streak calendar |
| `GET` | `/api/v1/habits/trends` | ✅ | — | Get last 7 days' chart data |
| `GET` | `/api/v1/habits/tip` | ✅ | — | Get rule-based weekly tip |

### `POST /api/v1/habits/log` — Body Schema

```json
// Increment a numeric habit (e.g., user taps "+1 glass")
{ "habit": "hydration", "value": 1, "action": "increment" }

// Set a value directly (e.g., "I slept 7.5 hours")
{ "habit": "sleep", "value": 7.5, "action": "set" }

// Toggle the boolean habit
{ "habit": "stressRelief", "value": true, "action": "set" }
```

---

## Key TypeScript Types

```typescript
// Used across service and controller
export type HabitKey =
  | 'hydration'
  | 'sleep'
  | 'physicalActivity'
  | 'meals'
  | 'screenBreaks'
  | 'stressRelief';

export type HabitStatus = 'complete' | 'partial' | 'missed';

export interface StreakDay {
  date: string;         // "YYYY-MM-DD"
  status: HabitStatus;
  score: number;        // 0-100
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
```

These types should live either in `src/services/habit.service.ts` or a dedicated `src/types/habit.types.ts`.

---

## Wellness Score — Worked Example

> **User Goals:** hydration=8, sleep=7, physicalActivity=30, meals=3, screenBreaks=5, stressRelief=true  
> **Today's Log:** hydration=6, sleep=8, physicalActivity=20, meals=3, screenBreaks=5, stressRelief=false

| Habit | Actual | Target | Ratio | Weight | Points |
|---|---|---|---|---|---|
| Hydration | 6 | 8 | 0.75 | 16.67 | 12.5 |
| Sleep | 8 | 7 | 1.0 (capped) | 16.67 | 16.67 |
| Physical Activity | 20 | 30 | 0.67 | 16.67 | 11.11 |
| Meals | 3 | 3 | 1.0 | 16.67 | 16.67 |
| Screen Breaks | 5 | 5 | 1.0 | 16.67 | 16.67 |
| Stress Relief | false | true | 0 | 16.67 | 0 |
| **Total** | | | | | **≈ 73 / 100** |

---

## Implementation Order (Recommended)

1. `src/services/habit.service.ts` — start here, everything else depends on it
2. `src/controller/habit.controller.ts`
3. `src/routes/habit.routes.ts`
4. `src/app.ts`
5. `src/index.ts`

---

## Verification Plan

### Step 1 — Start the Server
```bash
# From HabitTracker_service/
pnpm dev
```
- Expect: `MongoDB connected` then `HabitTracker service running on port 5006`

### Step 2 — Health Check
```
GET http://localhost:5006/health
→ { "status": "OK", "service": "HabitTracker" }
```

### Step 3 — Postman Flow (Full Happy Path)
Run these in order with a valid JWT from the auth-service in the `Authorization: Bearer <token>` header:

1. `POST /api/v1/habits/goals` → `{ "hydrationTarget": 10, "sleepTarget": 8 }`
2. `GET  /api/v1/habits/goals` → verify custom targets returned
3. `POST /api/v1/habits/log`   → `{ "habit": "hydration", "value": 3, "action": "increment" }`
4. `POST /api/v1/habits/log`   → `{ "habit": "sleep", "value": 7.5, "action": "set" }`
5. `POST /api/v1/habits/log`   → `{ "habit": "stressRelief", "value": true, "action": "set" }`
6. `GET  /api/v1/habits/today` → verify `wellnessScore` updates correctly
7. `GET  /api/v1/habits/streak` → see today as `complete` or `partial`
8. `GET  /api/v1/habits/trends` → see chart-ready data
9. `GET  /api/v1/habits/tip`   → see the tip for the weakest habit

### Step 4 — Edge Cases to Test
- Log `hydration` twice with `action: increment` → value should accumulate, not reset
- Request `/api/v1/habits/today` with no logs yet → should return `wellnessScore: 0` gracefully, not crash
- Use an invalid JWT → should receive `401 Unauthorized`
- `POST /api/v1/habits/log` with `{ "habit": "stressRelief", "value": 5, "action": "set" }` → should return `400 Bad Request` (stressRelief must be boolean)
