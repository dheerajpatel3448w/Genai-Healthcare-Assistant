# NovaCure Healthcare Platform — Full System Workflow

> **Author:** Dheeraj Patel  
> **Platform:** NovaCure — AI-Powered Digital Healthcare Ecosystem  
> **Stack:** Node.js · Express · TypeScript · Next.js · MongoDB · Redis · Socket.io · OpenAI Agents · Mem0AI

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Microservices Map](#2-microservices-map)
3. [Authentication Workflow](#3-authentication-workflow)
4. [Patient Journey Workflow](#4-patient-journey-workflow)
5. [Doctor Journey Workflow](#5-doctor-journey-workflow)
6. [AI Query Pipeline (HealthBrain)](#6-ai-query-pipeline-healthbrain)
7. [AI Query Pipeline (DoctorBrain)](#7-ai-query-pipeline-doctorbrain)
8. [Query Improviser — How Queries Are Structured](#8-query-improviser--how-queries-are-structured)
9. [Memory System Workflow](#9-memory-system-workflow)
10. [Report Upload & Analysis Workflow](#10-report-upload--analysis-workflow)
11. [Appointment Booking Workflow](#11-appointment-booking-workflow)
12. [Habit Tracker Workflow](#12-habit-tracker-workflow)
13. [Socket.io Real-Time Communication](#13-socketio-real-time-communication)
14. [Background Job Processing (BullMQ)](#14-background-job-processing-bullmq)
15. [Frontend Routing & Page Structure](#15-frontend-routing--page-structure)
16. [Complete Data Flow Diagram](#16-complete-data-flow-diagram)
17. [API Endpoint Reference](#17-api-endpoint-reference)
18. [Environment & Infrastructure](#18-environment--infrastructure)

---

## 1. System Architecture Overview

NovaCure is a **microservices-based healthcare platform** where every major domain is handled by a dedicated independent service. All services share a common JWT authentication strategy and communicate independently with MongoDB.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CLIENT — Next.js (smart_healthcare)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌─────────────┐ │
│  │  (auth)  │ │(patient) │ │ (doctor) │ │  Context  │ │  Socket.io  │ │
│  │  Pages   │ │  Pages   │ │  Pages   │ │ Providers │ │   Client    │ │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘ └─────────────┘ │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ REST + WebSocket (JWT in cookies)
         ┌──────────────────────┼──────────────────────────────────────────┐
         │                      │                                           │
   ┌─────▼─────┐        ┌───────▼──────┐      ┌────────────┐  ┌──────────┐
   │   Auth    │        │  AI Service  │      │Appointment │  │ Doctor   │
   │ Service   │        │  (Main Hub)  │      │  Service   │  │ Service  │
   │ /auth     │        │ Socket+REST  │      │ /appt      │  │ /doctor  │
   └─────┬─────┘        └───────┬──────┘      └─────┬──────┘  └────┬─────┘
         │                      │                   │               │
   ┌─────▼──────────────────────▼───────────────────▼───────────────▼─────┐
   │                         MongoDB  (Per-Service DBs)                    │
   │  users │ chathistory │ appointments │ doctors │ reports │ habits      │
   └────────────────────────────────────────────────────────────────────────┘
                      │                    │
              ┌───────▼────┐      ┌────────▼─────────────────────┐
              │   Redis    │      │  Mem0AI (Qdrant + Neo4j)     │
              │  (24h TTL) │      │  Long-term semantic memory   │
              └────────────┘      └──────────────────────────────┘
```

---

## 2. Microservices Map

| Service | Folder | Port | Purpose |
|---|---|---|---|
| **Auth Service** | `auth-service/` | ~5000 | Registration, Login, JWT issuance |
| **AI Service** | `Ai_service/` | ~5001 | HealthBrain + DoctorBrain orchestration, Socket.io, image analysis |
| **Doctor Service** | `Docter_service/` | ~5002 | Doctor profiles, search, availability |
| **Appointment Service** | `Appoinment_service/` | ~5003 | Booking, rescheduling, slot checking |
| **User Service** | `user_service/` | ~5004 | Patient profiles, onboarding |
| **HabitTracker Service** | `HabitTracker_service/` | 5006 | Daily habit logging, wellness scoring |
| **Frontend** | `Healthcare_Frontend/smart_healthcare/` | 3000 | Next.js 16 App Router UI |

---

## 3. Authentication Workflow

```
User (Browser)
     │
     │  POST /auth/register  { name, email, password, role }
     ▼
Auth Service (auth-service/src/controllers/auth.controller.ts)
     │
     ├─► Validate fields (Zod)
     ├─► Hash password with bcrypt
     ├─► Create User in MongoDB
     ├─► Sign JWT  { id, role }  → set as httpOnly cookie "token"
     │
     └──► Response: { success: true, user }

     │  POST /auth/login
     ▼
     ├─► Find user by email
     ├─► bcrypt.compare(password, hash)
     ├─► Sign JWT  → httpOnly cookie "token"
     └──► Response: { success: true, user }

Role-Based Routing (Next.js middleware.ts):
     ├─► role === "patient"  →  /patient/dashboard
     └─► role === "doctor"   →  /doctor/dashboard
```

**JWT Cookie Flow (All Services):**
- Each backend service reads the `token` cookie from the request.
- Middleware verifies the JWT using `JWT_SECRET`, attaches `req.user.id` and `req.user.role`.
- Protected routes reject requests with invalid/expired tokens (401).

---

## 4. Patient Journey Workflow

```
1. REGISTER / LOGIN
   ──────────────────
   Patient → Auth Service → JWT Cookie set → redirect to /patient/dashboard

2. ONBOARDING (UserProfile)
   ─────────────────────────
   Patient fills health profile:
   │  allergies, chronic diseases, medications, lifestyle
   └─► User Service stores UserProfile in MongoDB

3. PATIENT DASHBOARD  (/patient/dashboard)
   ─────────────────────────────────────────
   ├─► Wellness Score Card   ← HabitTracker Service GET /api/v1/habits/today
   ├─► Upcoming Appointments ← Appointment Service GET /appointments/mine
   ├─► Recent Reports        ← AI Service GET /analysis/reports
   └─► Quick Chat (Nova AI)  ← Socket.io  ai:query

4. NOVA AI CHAT  (/patient/dashboard/nova)
   ─────────────────────────────────────────
   Patient sends query → Socket.io "ai:query"
   └─► See Section 6 (AI Query Pipeline)

5. REPORTS  (/patient/dashboard/reports)
   ──────────────────────────────────────
   ├─► Upload medical file  → POST /images/upload → Cloudinary + BullMQ
   └─► View analyzed report ← GET /analysis/report/:id

6. WELLNESS  (/patient/dashboard/wellness)
   ─────────────────────────────────────────
   ├─► Log daily habits     → POST /api/v1/habits/log
   ├─► View today's score   → GET  /api/v1/habits/today
   ├─► View 7-day streaks   → GET  /api/v1/habits/streak
   └─► View trend charts    → GET  /api/v1/habits/trends

7. FIND & BOOK A DOCTOR  (/patient/doctors)
   ──────────────────────────────────────────
   ├─► Search doctors        → GET  /doctor/all?search=cardio
   ├─► View doctor profile   → GET  /doctor/:id
   └─► Book appointment      → POST /appointments/create
```

---

## 5. Doctor Journey Workflow

```
1. REGISTER / LOGIN
   ──────────────────
   Doctor → Auth Service → JWT Cookie (role=doctor) → /doctor/dashboard

2. CREATE DOCTOR PROFILE
   ─────────────────────
   Doctor → POST /doctor/create
   {
     specialization, experience, qualification, licenseNumber,
     hospitalName, clinicAddress, consultationFee,
     consultationType: ["online" | "clinic" | "hospital"],
     availability, bio, languages, services, education
   }
   └─► DoctorProfile stored in MongoDB (Doctor Service)

3. DOCTOR DASHBOARD  (/doctor/dashboard)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ├─► Today's Appointments  ← Appointment Service GET /appointments/doctor/:id
   ├─► Patient Queue Status  ← Real-time via Socket.io
   ├─► Practice Analytics    ← doctorAnalytics.agent.ts
   └─► AI Copilot Chat       ← Socket.io  doctor:query

4. DOCTOR AI COPILOT
   ─────────────────
   Doctor sends query → Socket.io "doctor:query"
   └─► See Section 7 (DoctorBrain Pipeline)

5. APPOINTMENT MANAGEMENT
   ────────────────────────
   ├─► View appointments (today/upcoming/past)
   ├─► Mark as completed / no_show / cancelled
   ├─► Add clinical notes  → PUT /appointments/:id/status { notes }
   └─► DoctorBrain can do this via chat: "mark completed for patient X"

6. PROFILE MANAGEMENT
   ─────────────────────
   ├─► GET  /doctor/getprofile   → view their profile
   ├─► PUT  /doctor/updateprofile → edit availability, fees, bio
   └─► DELETE /doctor/deleteprofile
```

---

## 6. AI Query Pipeline (HealthBrain)

This is the most critical flow in the entire platform. Every patient chat message passes through this 7-step pipeline.

```
Patient Types a Query in Nova Chat
          │
          │  socket.emit("ai:query", { query: "I have chest pain for 2 days" })
          ▼
┌────────────────────────────────────────────────────────────────────┐
│  STEP 1 — Query Improviser  (queryimprowizer.agent.ts)             │
│                                                                    │
│  Input: raw query + UserProfile + last 7-day ReportAnalysis        │
│  Output: {                                                         │
│    intent: "symptom_check",                                        │
│    clean_query: "Chest pain for 2 days",                          │
│    entities: {                                                     │
│      symptoms: ["chest pain"],                                     │
│      duration: "2 days",                                           │
│      disease: "",                                                  │
│      specialization: ""                                            │
│    }                                                               │
│  }                                                                 │
│                                                                    │
│  emit("ai:status", { step: "improving_query" })                    │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  STEP 2 — Fetch User Profile  (MongoDB UserProfile lookup)         │
│  UserProfile.findOne({ userId })                                   │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  STEP 3 — Retrieve Long-Term Memory  (Mem0AI)                      │
│  memory.search(clean_query, { userId })                            │
│  → Returns semantically relevant past memories                     │
│  Example: past mention of "angina" or prior chest pain episodes    │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  STEP 4 — Retrieve Short-Term Context  (Redis)                     │
│  redisMemoryService.getRecentContext(userId)                        │
│  → Last 5 conversation turns (24-hour TTL)                        │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               │  Combined Package:
                               │  { improvedQuery, userprofile, pastMemories, recentHistory }
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  STEP 5 — HealthBrain Agent Execution  (Healthbrain.agent.ts)      │
│                                                                    │
│  Routes by intent:                                                 │
│                                                                    │
│  "symptom_check"       → analyze_symptoms + get_health_history     │
│                          (runs PARALLEL for speed)                 │
│                          If urgent → initiate_emergency_protocol   │
│                          If severity high → suggest_doctors        │
│                                                                    │
│  "report_analysis"     → get_health_history (metricsToTrack)       │
│                                                                    │
│  "doctor_search"       → suggest_doctors (specialization)          │
│                                                                    │
│  "appointment_booking" → manage_appointment (book/cancel/view)     │
│                                                                    │
│  "wellness"            → get_wellness_coaching (via HabitTracker)  │
│                                                                    │
│  "general_query"       → Direct response, NO tool calls            │
│                                                                    │
│  emit("ai:status", { step: "generating" })                        │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  STEP 6 — Streaming Response  (token-by-token via Socket.io)       │
│  Every token emitted as:  socket.emit("ai:chunk", { token })       │
│  Frontend renders markdown in real-time                            │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  STEP 7 — Store to All Memory Layers  (background, non-blocking)   │
│                                                                    │
│  ├─► Redis:   redisMemoryService.saveInteraction(userId, q, a)     │
│  ├─► Mem0:    memory.add([{user}, {assistant}], { userId })        │
│  └─► MongoDB: ChatHistory.create({ userId, userQuery, aiResponse}) │
│                                                                    │
│  emit("ai:done", { intent, finalResponse })                       │
└────────────────────────────────────────────────────────────────────┘
```

### HealthBrain Sub-Agents (Tools)

| Tool Name | Agent File | Purpose |
|---|---|---|
| `analyze_symptoms` | `symtom.agent.ts` | Checks symptoms, detects severity, urgency |
| `suggest_doctors` | `docter.agent.ts` | Finds doctors by specialization/availability |
| `manage_appointment` | `appointment.agent.ts` | Books, cancels, reschedules appointments |
| `get_health_history` | `healthhistory.agent.ts` | Timeline of reports, trends, risk patterns |
| `get_lifestyle_advice` | `dietary.agent.ts` | Nutrition & diet coaching |
| `initiate_emergency_protocol` | `emergency.agent.ts` | Alerts emergency contacts on critical events |
| `get_wellness_coaching` | `habittracker.agent.ts` | Fetches habit scores, streak, tips |

---

## 7. AI Query Pipeline (DoctorBrain)

Doctors use a separate, simpler pipeline. No query improviser is needed.

```
Doctor Types in AI Copilot Chat
          │
          │  socket.emit("doctor:query", { query: "Show patient profile for XYZ" })
          ▼
┌────────────────────────────────────────────────────────────────────┐
│  STEP 1 — Verify Doctor Account                                    │
│  DoctorProfile.findOne({ userId })                                 │
│  → NOT found: emit("doctor:error") and STOP                       │
│  → Found: extract doctorId (ObjectId)                             │
│  emit("doctor:status", { step: "verifying_doctor" })              │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  STEP 2 — DoctorBrain Agent Execution  (DoctorBrain.agent.ts)      │
│                                                                    │
│  Routes by query context:                                          │
│                                                                    │
│  "my schedule / today / upcoming"                                  │
│     → manage_appointments { action: "view", filter: "today" }      │
│                                                                    │
│  "mark completed / no_show / add notes"                            │
│     → manage_appointments { action: "update_status" / "add_notes" }│
│                                                                    │
│  "patient profile / pre-consultation brief"                        │
│     → get_patient_insight { patientId }                           │
│       Calls ALL 3 sub-tools in parallel:                          │
│       ├─► get_patient_profile                                     │
│       ├─► get_patient_reports                                     │
│       └─► get_patient_appointment_history                         │
│                                                                    │
│  "update availability / fees / hours"                              │
│     → manage_schedule { action: "update_availability" }            │
│                                                                    │
│  "my stats / performance / completion rate"                        │
│     → get_analytics { doctorId }                                   │
│                                                                    │
│  emit("doctor:status", { step: "generating" })                    │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  STEP 3 — Stream response token-by-token                           │
│  emit("doctor:done", { finalResponse })                            │
└────────────────────────────────────────────────────────────────────┘
```

### DoctorBrain Sub-Agents (Tools)

| Tool Name | Agent File | Purpose |
|---|---|---|
| `manage_appointments` | `appointmentManager.agent.ts` | View schedule, update status, add notes |
| `get_patient_insight` | `patientInsight.agent.ts` | Full pre-consultation patient brief |
| `manage_schedule` | `scheduleManager.agent.ts` | Update availability, check open slots |
| `get_analytics` | `doctorAnalytics.agent.ts` | Practice stats, completion rates, top patients |

---

## 8. Query Improviser — How Queries Are Structured

The `queryimprowizer.agent.ts` is a **gate-keeper agent** that runs before HealthBrain. It enforces clarity and structure, ensuring the main AI never receives noisy or ambiguous inputs.

```
Raw Input (possibly Hinglish, informal, vague):
  "mujhe 2 din se chest mein dard ho raha hai"

┌─────────────────────────────────────────────┐
│        queryImproviser Agent                │
│                                             │
│  Context passed:                            │
│  ├─► UserProfile (chronic diseases)         │
│  └─► Last 7-day ReportAnalysis summary      │
│                                             │
│  Processing:                                │
│  ├─► Translates Hinglish → English          │
│  ├─► Classifies intent                      │
│  ├─► Extracts ONLY explicitly stated info   │
│  └─► Does NOT add medical reasoning         │
└─────────────────────────────────────────────┘

Structured Output:
{
  intent: "symptom_check",
  clean_query: "Chest pain for 2 days",
  entities: {
    symptoms: ["chest pain"],
    duration: "2 days",
    disease: "",
    specialization: ""
  }
}
```

**Intent Categories:**
| Intent | Triggered When |
|---|---|
| `symptom_check` | User describes physical symptoms |
| `report_analysis` | User references reports or lab results |
| `doctor_search` | User wants to find a doctor |
| `appointment_booking` | User wants to book/cancel/reschedule |
| `wellness` | Habits, streaks, wellness score, hydration |
| `general_query` | Greetings, general questions, chitchat |

---

## 9. Memory System Workflow

Three independent layers work together to give the AI contextual awareness across sessions:

```
LAYER 1: Short-Term Memory (Redis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key Format: chat_history:{userId}
Stores:     Last 5 interactions (10 messages)
TTL:        24 hours
On Read:    getRecentContext(userId) → array of {user, assistant, timestamp}
On Write:   saveInteraction(userId, query, response)
            → RPUSH + LTRIM(-5) + EXPIRE(86400)
Fallback:   If Redis empty → hydrate from MongoDB

LAYER 2: Long-Term Semantic Memory (Mem0AI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Storage:    Qdrant (vector embeddings, port 6333)
Graphs:     Neo4j (entity relationships)
History:    Supabase (memory_history table)
LLM:        GPT-4o-mini for memory extraction

On Read:    memory.search(clean_query, { userId })
            → Finds semantically related past events
            E.g., user mentions "sugar" → retrieves past diabetes discussion

On Write:   memory.add([
              { role: "user", content: clean_query },
              { role: "assistant", content: finalOutput }
            ], { userId })

LAYER 3: Persistent Storage (MongoDB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Schema:     ChatHistory { userId, userQuery, aiResponse, timestamp }
Purpose:    Complete audit trail, history pagination, Redis fallback source
On Write:   ChatHistory.create({ userId, userQuery, aiResponse })
```

```
Comparison Table:
┌──────────────┬───────────────┬──────────────┬──────────────────────────┐
│ Layer        │ Speed         │ Retention    │ Use Case                 │
├──────────────┼───────────────┼──────────────┼──────────────────────────┤
│ Redis        │ ⚡ Fastest    │ 24 hours     │ Conversation continuity  │
│ Mem0 / Qdrant│ 🔍 Semantic   │ Permanent    │ User preferences, history│
│ MongoDB      │ 📦 Persistent │ Permanent    │ Audit trail, pagination  │
└──────────────┴───────────────┴──────────────┴──────────────────────────┘
```

---

## 10. Report Upload & Analysis Workflow

```
Patient Selects Medical File (blood report, MRI, etc.)
          │
          │  POST /images/upload  (multipart/form-data)
          ▼
Image Controller (image.controller.ts)
  ├─► multer buffers the file in memory
  ├─► Uploads to Cloudinary → gets public URL
  └─► Pushes job to BullMQ queue (textExtractionQueue)
      Payload: { userId, imageUrl, reportType }

          │
          │  (background — non-blocking)
          ▼
textExtractionWorker.ts  (BullMQ Worker)
  ├─► If IMAGE:  Google Cloud Vision API → extracts raw text from image
  ├─► If PDF:    Text extraction from buffer
  ├─► Passes extracted text to:
  │     ├─► clinicalreportspecialist.agent.ts  (clinical reports)
  │     ├─► labreportspecialist.agent.ts       (lab reports: CBC, LFT, etc.)
  │     ├─► Imagingreportspecialist.agent.ts   (radiology, MRI, X-ray)
  │     └─► MedicalSynthesizer.agent.ts        (combines all findings)
  │
  ├─► Saves structured analysis to:
  │     Report.create({ userId, reportType, rawText, finalAnalysis })
  │     ReportAnalysis.create({ userId, finalAnalysis })
  │
  └─► Notifies frontend via Socket.io:
      sendMessageToUser(userId, { event: "report:ready", data: analysis })

          │
          ▼
Patient Dashboard refreshes automatically
/patient/dashboard/reports shows the analyzed report
```

---

## 11. Appointment Booking Workflow

```
BOOKING FLOW:
━━━━━━━━━━━━
Patient searches doctor  →  GET /doctor/all?search=cardiology
Patient views profile    →  GET /doctor/:id
Patient checks slots     →  GET /appointments/slots/:doctorId?date=2026-04-10
Patient books            →  POST /appointments/create
{
  doctorId, appointmentDate, startTime, endTime,
  consultationType: "online" | "clinic" | "hospital",
  reason
}
Appointment Service:
  ├─► Creates Appointment { userId, doctorId, status: "scheduled" }
  └─► Response: { success: true, appointment }

CANCELLATION FLOW:
━━━━━━━━━━━━━━━━
Patient → DELETE-like → PUT /appointments/:id/cancel
  └─► status set to "cancelled"

RESCHEDULE FLOW:
━━━━━━━━━━━━━━━
PUT /appointments/:id/reschedule { appointmentDate, startTime, endTime }
  ├─► Original appointment → status: "rescheduled"
  ├─► New appointment created with rescheduledFrom: original._id
  └─► Cannot reschedule a "completed" or "cancelled" appointment (400)

STATUS LIFECYCLE:
━━━━━━━━━━━━━━━━
scheduled → completed
scheduled → cancelled
scheduled → no_show
scheduled → rescheduled → (new appointment: scheduled)

SLOT AVAILABILITY CHECK:
━━━━━━━━━━━━━━━━━━━━━━━
GET /appointments/slots/:doctorId?date=YYYY-MM-DD
  └─► Returns all non-cancelled/non-rescheduled appointments for that day
      Frontend cross-references with doctor availability to show open slots
```

---

## 12. Habit Tracker Workflow

The HabitTracker Service (port 5006) is independently deployed and tracks 6 daily wellness habits.

```
TRACKED HABITS (6 total, each worth ~16.67 points):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 💧 Hydration       — glasses of water per day
2. 🌙 Sleep           — hours of sleep
3. 🏃 Physical Activity — minutes of exercise
4. 🥗 Meals           — healthy meals count
5. 📱 Screen Breaks   — number of breaks taken
6. 🧘 Stress Relief   — boolean (did they meditate/relax today?)

WELLNESS SCORE FORMULA:
━━━━━━━━━━━━━━━━━━━━━━
For numeric habits: score = min(actual / goal, 1.0) × 16.67
For boolean habits: score = 16.67 if true, else 0
Total score = sum of all 6 (capped at 100)

API FLOW:
━━━━━━━━
Step 1 — Set Goals:
  POST /api/v1/habits/goals
  { hydration: 8, sleep: 8, exercise: 30, meals: 3, screenBreaks: 5 }

Step 2 — Log Daily Activity:
  POST /api/v1/habits/log
  { hydration: 6, sleep: 7, exercise: 20, meals: 2, stressRelief: true }
  └─► Upserts DailyLog for today, recalculates wellness score

Step 3 — View Today's Dashboard:
  GET /api/v1/habits/today
  └─► Returns { habits, wellnessScore, goals, date }

Step 4 — View Streak (7 days):
  GET /api/v1/habits/streak
  └─► Returns array of last 7 DailyLogs with scores

Step 5 — View Trend Charts:
  GET /api/v1/habits/trends
  └─► Returns data formatted for chart rendering

Step 6 — Get Personalized Tip:
  GET /api/v1/habits/tip
  └─► Rule-based tip based on lowest-scoring habit of the week

AI INTEGRATION:
━━━━━━━━━━━━━━
When patient asks HealthBrain about wellness/habits:
  → habittracker.agent.ts (intent: "wellness")
  → Calls habittracker.tool.ts which queries HabitTracker Service internally
  → Returns snapshot, weekly summary, streak, 3-step action plan
  → If score critically low: adds ⚠️ doctor recommendation
```

---

## 13. Socket.io Real-Time Communication

All real-time features route through the AI Service's Socket.io server (`socket.ts`).

```
CONNECTION & AUTHENTICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client connects → Socket.io handshake
  ├─► Check handshake.auth.token  (explicit)
  └─► Check cookie header for "token=..." (fallback)

JWT.verify(token) → { id, role }
socket.userId = user.id
socket.join(socket.userId)  ← rooms for targeted push events

PATIENT EVENTS:
━━━━━━━━━━━━━━
socket.emit("ai:query", { query })
  └─► Server runs HealthBrain pipeline
  ← socket.emit("ai:status", { step })       ← progress updates
  ← socket.emit("ai:chunk", { token })       ← streaming tokens
  ← socket.emit("ai:done", { finalResponse })← completion
  ← socket.emit("ai:error", { message })     ← on failure

DOCTOR EVENTS:
━━━━━━━━━━━━━
socket.emit("doctor:query", { query })
  └─► Validates doctor profile
  └─► Server runs DoctorBrain pipeline
  ← socket.emit("doctor:status", { step })
  ← socket.emit("doctor:chunk", { token })
  ← socket.emit("doctor:done", { finalResponse })
  ← socket.emit("doctor:error", { message })

SERVER-SIDE PUSH (sendMessageToUser):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Used by BullMQ workers to notify frontend of async job completion:
  sendMessageToUser(userId, { event: "report:ready", data })
  → io.to(userId).emit("report:ready", data)
```

---

## 14. Background Job Processing (BullMQ)

```
QUEUE:   textExtractionQueue  (Redis-backed)
WORKER:  textExtractionWorker.ts

Job Lifecycle:
━━━━━━━━━━━━━
[Enqueue]  image.controller.ts adds job:
           { userId, imageUrl, reportType: "lab"|"imaging"|"clinical" }

[Process]  textExtractionWorker picks up job:
           ├─► Extract text (Vision API / direct text)
           ├─► Run specialist AI agent
           ├─► Save analysis to MongoDB
           └─► Notify user via Socket.io sendMessageToUser()

[Frontend] Socket event "report:ready" → auto-refresh reports page

Benefits:
  ✅ Upload endpoint returns immediately (doesn't block user)
  ✅ Heavy OCR and AI work processed in background
  ✅ User gets real-time notification when done
```

---

## 15. Frontend Routing & Page Structure

```
smart_healthcare/app/
│
├── page.tsx                    ← Landing Page (home)
├── layout.tsx                  ← Root layout (fonts, context providers)
│
├── (auth)/
│   ├── login/page.tsx          ← Login form
│   └── register/page.tsx       ← Registration form
│
├── (patient)/
│   ├── layout.tsx              ← Patient sidebar + socket init
│   ├── dashboard/
│   │   ├── page.tsx            ← Main dashboard (stats, cards, quick actions)
│   │   ├── nova/               ← NovaChat AI interface (HealthBrain)
│   │   ├── reports/            ← Upload + view analyzed medical reports
│   │   └── wellness/           ← Habit tracker UI + charts
│   └── doctors/                ← Doctor search & booking
│
└── (doctor)/
    ├── layout.tsx              ← Doctor sidebar + socket init
    └── dashboard/
        ├── page.tsx            ← Schedule, analytics overview
        └── [sub-pages]         ← Patient briefs, schedule management
```

**Context Providers (wrapping relevant layouts):**
| Context | Purpose |
|---|---|
| `user.context.tsx` | Global auth state, user data |
| `patient-dashboard.context.tsx` | Patient dashboard data, appointments |
| `doctor-dashboard.context.tsx` | Doctor schedule, analytics |
| `habit-tracker.context.tsx` | Today's log, wellness score |
| `docter.context.tsx` | Doctor search/listing state |

**Custom Hooks:**
| Hook | Used For |
|---|---|
| `useNovaChat.ts` | Patient socket chat with HealthBrain |
| `useDoctorChat.ts` | Doctor socket chat with DoctorBrain |
| `useHistoricalAnalysis.ts` | Fetching & processing past report data |
| `useMultiSectionUpload.ts` | Drag-and-drop multi-file report upload |

---

## 16. Complete Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PATIENT FLOW                                  │
│                                                                        │
│  Browser → Auth → JWT → Patient Dashboard                             │
│                              │                                         │
│              ┌───────────────┼───────────────┐                        │
│              │               │               │                         │
│         Nova Chat      Reports Tab      Wellness Tab                   │
│              │               │               │                         │
│         Socket.io       POST /images    POST /habits/log               │
│         ai:query         multipart       { habits data }               │
│              │               │               │                         │
│         AI Service      AI Service      HabitTracker                   │
│         (socket.ts)   (image.ctrl)      Service                        │
│              │               │               │                         │
│    7-step pipeline    BullMQ Queue     Calc wellness                   │
│    (see sect 6)       → Worker         score → save                    │
│              │               │               │                         │
│      Stream tokens    textExtraction   GET /habits/today               │
│      back to client   Worker runs      returns score                   │
│              │               │               │                         │
│      ai:done event    Save to MongoDB  UI updates                      │
│      + save to        sendMessageToUser dashboard card                 │
│      Redis/Mem0/Mongo (socket push)                                    │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                          DOCTOR FLOW                                   │
│                                                                        │
│  Browser → Auth (role=doctor) → Doctor Dashboard                      │
│                              │                                         │
│              ┌───────────────┼───────────────┐                        │
│              │               │               │                         │
│       Today's Schedule  Patient Brief   Analytics                      │
│              │               │               │                         │
│        GET /appt/        Socket.io       Socket.io                    │
│        doctor/:id        doctor:query    doctor:query                  │
│              │               │               │                         │
│        Appointment       DoctorBrain     DoctorBrain                  │
│        Service           patientInsight  doctorAnalytics               │
│              │               │               │                         │
│        list of appts     Calls 3 tools   Practice stats                │
│        for today         in parallel     → formatted table             │
│                          Profile+Reports                               │
│                          +History                                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 17. API Endpoint Reference

### Auth Service
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register patient or doctor |
| POST | `/auth/login` | ❌ | Login, receive JWT cookie |
| POST | `/auth/logout` | ✅ | Clear session cookie |

### Doctor Service
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/doctor/create` | ✅ | Create doctor profile |
| GET | `/doctor/getprofile` | ✅ | Get own profile |
| PUT | `/doctor/updateprofile` | ✅ | Update profile fields |
| DELETE | `/doctor/deleteprofile` | ✅ | Delete profile |
| GET | `/doctor/all` | ❌ | Search all doctors (query: search, consultationType) |
| GET | `/doctor/:id` | ❌ | Get doctor by DoctorProfile ID |

### Appointment Service
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/appointments/create` | ✅ | Book a new appointment |
| GET | `/appointments/mine` | ✅ | Get my appointments |
| GET | `/appointments/doctor/:doctorId` | ✅ | Doctor: view all appointments |
| PUT | `/appointments/:id/status` | ✅ | Update status / add notes |
| PUT | `/appointments/:id/cancel` | ✅ | Cancel appointment |
| PUT | `/appointments/:id/reschedule` | ✅ | Reschedule (creates new) |
| GET | `/appointments/slots/:doctorId` | ✅ | Get booked slots for a date |
| GET | `/appointments/:id` | ✅ | Get single appointment |

### AI Service
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/images/upload` | ✅ | Upload medical image/PDF |
| POST | `/analysis/report` | ✅ | Trigger analysis manually |
| GET | `/analysis/report/:id` | ✅ | Get analyzed report |
| POST | `/ai/chat` | ✅ | REST fallback for patient AI (non-streaming) |
| POST | `/doctor-ai/chat` | ✅ | REST fallback for doctor AI (non-streaming) |
| WS | `socket.io: ai:query` | ✅ JWT in cookie | Patient streaming chat |
| WS | `socket.io: doctor:query` | ✅ JWT in cookie | Doctor streaming chat |

### HabitTracker Service
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Health check |
| GET | `/api/v1/habits/goals` | ✅ | Get user's habit goals |
| POST | `/api/v1/habits/goals` | ✅ | Set/update habit goals |
| POST | `/api/v1/habits/log` | ✅ | Log today's habits |
| GET | `/api/v1/habits/today` | ✅ | Today's log + wellness score |
| GET | `/api/v1/habits/streak` | ✅ | 7-day streak data |
| GET | `/api/v1/habits/trends` | ✅ | Trend chart data |
| GET | `/api/v1/habits/tip` | ✅ | Personalized weekly tip |

---

## 18. Environment & Infrastructure

### Docker Services (AI Service docker-compose.yml)
| Service | Port | Purpose |
|---|---|---|
| **Redis Stack** | 6379 | Short-term memory + BullMQ queues |
| **Qdrant** | 6333 | Vector embeddings for Mem0AI |
| **Neo4j** | 7474/7687 | Entity relationship graphs for Mem0AI |

### Environment Variables (per service `.env`)

**All Services (common):**
```
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:3000
PORT=
```

**AI Service (additional):**
```
OPENAI_API_KEY=
GOOGLE_API_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
MEM0_API_KEY=
NEO4J_URL=
NEO4J_USERNAME=
NEO4J_PASSWORD=
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

### Development Commands (all services use pnpm)
```bash
# Start any backend service
cd Healthcare_backend/<service_name>
pnpm install
pnpm dev          # tsx watch mode

# Start frontend
cd Healthcare_Frontend/smart_healthcare
pnpm install
pnpm dev          # Next.js dev server on port 3000

# Start Docker services (from Ai_service directory)
cd Healthcare_backend/Ai_service
docker-compose up -d

# Order to start services:
# 1. docker-compose up -d    (Redis, Qdrant, Neo4j)
# 2. auth-service
# 3. user_service + Docter_service + Appoinment_service + HabitTracker_service
# 4. Ai_service  (depends on Redis & Mongo)
# 5. Frontend
```

---

## Known Naming Inconsistencies

> These are typos baked into the current codebase — keep consistent with them during development to avoid import errors.

| Current Name | Correct Spelling |
|---|---|
| `Appoinment_service/` | `Appointment_service/` |
| `Docter_service/` | `Doctor_service/` |
| `docter.agent.ts` | `doctor.agent.ts` |
| `symtom.agent.ts` | `symptom.agent.ts` |
| `queryimprowizer.agent.ts` | `queryimproviser.agent.ts` |
| `docteragent.tool.ts` | `doctoragent.tool.ts` |
| `symtomagent.tool.ts` | `symptomagent.tool.ts` |
| `anaylisis.controller.ts` | `analysis.controller.ts` |
| `overallreprot.model.ts` | `overallreport.model.ts` |
| `docter.context.tsx` | `doctor.context.tsx` |

---

*This workflow document reflects the actual source code analysis of the NovaCure Healthcare Platform as of April 2026.*
