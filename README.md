# 🏥 NovaCure — AI-Powered Digital Healthcare Platform

<div align="center">

![NovaCure Banner](https://img.shields.io/badge/NovaCure-Healthcare%20Platform-0ea5e9?style=for-the-badge&logo=heart&logoColor=white)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)

**A comprehensive, microservices-based digital healthcare ecosystem connecting patients and doctors through AI-powered interactions, real-time consultations, and intelligent wellness tracking.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Microservices](#-microservices)
- [AI System](#-ai-system)
- [Frontend Application](#-frontend-application)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Future Enhancements](#-future-enhancements)

---

## 🌟 Overview

**NovaCure** is a modern, AI-powered healthcare platform designed to bridge the gap between patients and healthcare providers through a seamless, secure digital ecosystem. It leverages a multi-agent AI architecture, microservices backend, and a rich Next.js frontend to deliver:

- **Personalized AI consultations** powered by OpenAI Agents & Google Gemini
- **Intelligent medical report analysis** using Google Cloud Vision & specialized AI agents
- **Automated appointment management** with real-time status updates
- **Wellness habit tracking** with dynamic scoring and personalized tips
- **Role-based dashboards** for both patients and doctors

> **Author:** Dheeraj Patel
> **Status:** Active Development — Core features implemented, integration testing in progress

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Auth & Role Management** | Secure JWT-based login/register for patients and doctors |
| 🤖 **Nova AI (HealthBrain)** | Patient-facing AI copilot for symptom checks, doctor search, and wellness |
| 🧠 **Doctor AI (DoctorBrain)** | Doctor-facing copilot for schedule management, patient briefs, and analytics |
| 📋 **Medical Report Analysis** | Upload lab/imaging/clinical reports — AI extracts and synthesizes findings |
| 📅 **Appointment System** | Book, cancel, reschedule consultations (online, clinic, hospital) |
| 💪 **Habit Tracker** | Track 6 daily wellness habits with dynamic wellness scores and streaks |
| 💬 **Real-time Chat** | Socket.io-powered AI streaming responses with token-by-token delivery |
| 🗣️ **Query Improviser** | Translates informal/Hinglish queries into structured medical intents |
| 🧬 **Multi-layer AI Memory** | Redis (24h) + Mem0AI Qdrant (semantic) + MongoDB (persistent) |
| 🌩️ **Background Jobs** | BullMQ + Redis for async report processing without blocking the user |

---

## 🏗️ System Architecture

NovaCure follows a **microservices architecture** where each domain is handled by an independent service, all sharing a common JWT authentication strategy.

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
   │ ~port 5000│        │ Socket+REST  │      │ ~port 5003 │  │ ~port 5002│
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

## 🛠️ Tech Stack

### Backend
| Category | Technologies |
|---|---|
| **Runtime** | Node.js, TypeScript |
| **Framework** | Express.js |
| **Package Manager** | pnpm |
| **Database** | MongoDB + Mongoose |
| **Cache / Queue** | Redis (ioredis), BullMQ |
| **Auth** | JWT, bcrypt, httpOnly cookies |
| **Validation** | Zod |
| **Real-time** | Socket.io |

### AI & ML
| Category | Technologies |
|---|---|
| **Agent Framework** | OpenAI Agents (`@openai/agents`) |
| **LLMs** | OpenAI GPT-4o-mini, Google Gemini |
| **Long-term Memory** | Mem0AI (Qdrant vector store + Neo4j graph) |
| **Image Analysis** | Google Cloud Vision API |
| **Semantic Search** | Qdrant (port 6333) |
| **Graph Relationships** | Neo4j |
| **History Store** | Supabase |

### Frontend
| Category | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router), React |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion, Lottie |
| **3D Graphics** | Three.js, React Three Fiber |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Real-time** | Socket.io Client |

### DevOps & Cloud
| Category | Technologies |
|---|---|
| **Containerization** | Docker, Docker Compose |
| **Media Storage** | Cloudinary |
| **Notifications** | Twilio (SMS), Nodemailer (email) |

---

## 📁 Project Structure

```
minor project/
├── Healthcare_backend/
│   ├── Ai_service/              # AI agents, Socket.io, report analysis
│   ├── Appoinment_service/      # Appointment booking & management
│   ├── auth-service/            # JWT authentication & registration
│   ├── Docter_service/          # Doctor profiles & availability
│   ├── HabitTracker_service/    # Wellness habit logging & scoring
│   └── user_service/            # Patient profiles & onboarding
│
├── Healthcare_Frontend/
│   └── smart_healthcare/        # Next.js 16 App Router application
│
├── Project_Details.md           # Detailed project documentation
├── WORKFLOW.md                  # Full system workflow reference
└── README.md                    # This file
```

Each backend service follows the same internal structure:
```
<service>/
├── src/
│   ├── app.ts          # Express app setup
│   ├── index.ts        # Server entry point
│   ├── configs/        # Database & config
│   ├── controllers/    # HTTP request handlers
│   ├── middlewares/    # Auth, CORS, logging
│   ├── model/          # MongoDB Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

## ⚙️ Microservices

### 1. 🔐 Auth Service (`auth-service/` · ~port 5000)
Handles user registration, login, and JWT session management.
- Validates with Zod, hashes passwords with bcrypt
- Issues `httpOnly` JWT cookies on successful auth
- Role-based routing: `patient` → `/patient/dashboard`, `doctor` → `/doctor/dashboard`

### 2. 🤖 AI Service (`Ai_service/` · ~port 5001)
The core hub of the platform. Hosts **19 specialized AI agents**, Socket.io server, background workers, and REST APIs for reports and image analysis.

**Key sub-systems:**
- `HealthBrain` — Patient AI copilot (7-step query pipeline)
- `DoctorBrain` — Doctor AI copilot (schedule, analytics, patient briefs)
- `QueryImproviser` — Structures raw/Hinglish queries into intents
- `BullMQ Worker` — Async report extraction & AI analysis
- `Socket.io` — Real-time token streaming to clients

### 3. 👨‍⚕️ Doctor Service (`Docter_service/` · ~port 5002)
Manages doctor profiles, search, and availability.
- Full CRUD for doctor profiles (specialization, fees, consultation types)
- Public search endpoint with filters

### 4. 📅 Appointment Service (`Appoinment_service/` · ~port 5003)
Handles the complete appointment lifecycle.
- Booking, cancellation, rescheduling
- Slot availability checking
- Status transitions: `scheduled → completed | cancelled | no_show | rescheduled`

### 5. 👤 User Service (`user_service/` · ~port 5004)
Manages patient profiles and onboarding data.
- Stores `UserProfile` (allergies, chronic diseases, medications, lifestyle)
- Referenced by AI agents for personalized context

### 6. 💪 HabitTracker Service (`HabitTracker_service/` · port 5006)
Tracks 6 daily wellness habits and calculates dynamic wellness scores.

**Tracked Habits:**
| # | Habit | Type | Max Points |
|---|---|---|---|
| 1 | 💧 Hydration | Numeric (glasses/day) | ~16.67 |
| 2 | 🌙 Sleep | Numeric (hours) | ~16.67 |
| 3 | 🏃 Physical Activity | Numeric (minutes) | ~16.67 |
| 4 | 🥗 Meals | Numeric (healthy meals) | ~16.67 |
| 5 | 📱 Screen Breaks | Numeric (breaks taken) | ~16.67 |
| 6 | 🧘 Stress Relief | Boolean (meditated?) | ~16.67 |

**Wellness Score Formula:**
```
Numeric: score = min(actual / goal, 1.0) × 16.67
Boolean: score = 16.67 if true, else 0
Total = sum of all 6 (capped at 100)
```

---

## 🧠 AI System

### Agent Architecture — 19 Specialized Agents

```
Healthcare_backend/Ai_service/src/Agents/
├── Healthbrain.agent.ts          ← Patient AI orchestrator
├── DoctorBrain.agent.ts          ← Doctor AI orchestrator
├── queryimprowizer.agent.ts      ← Query structuring gate-keeper
├── symtom.agent.ts               ← Symptom analysis & urgency detection
├── docter.agent.ts               ← Doctor search by specialization
├── appointment.agent.ts          ← Appointment booking/cancellation
├── appointmentManager.agent.ts   ← Doctor appointment management
├── healthhistory.agent.ts        ← Timeline of reports & trends
├── dietary.agent.ts              ← Nutrition & diet coaching
├── emergency.agent.ts            ← Critical event alerting
├── habittracker.agent.ts         ← Wellness data retrieval
├── patientInsight.agent.ts       ← Pre-consultation patient brief
├── scheduleManager.agent.ts      ← Doctor availability management
├── doctorAnalytics.agent.ts      ← Practice stats & performance
├── clinicalreportspecialist.agent.ts  ← Clinical report analysis
├── labreportspecialist.agent.ts       ← Lab report (CBC, LFT, etc.)
├── Imagingreportspecialist.agent.ts   ← Radiology, MRI, X-ray
├── MedicalSynthesizer.agent.ts        ← Combines all findings
└── reportselector.agent.ts            ← Routes to correct specialist
```

### HealthBrain 7-Step Query Pipeline

```
Patient Query (raw/Hinglish)
    │
    ▼ Step 1 — QueryImproviser
        Translates, classifies intent, extracts entities
    │
    ▼ Step 2 — Fetch UserProfile (MongoDB)
    │
    ▼ Step 3 — Long-term Memory (Mem0AI / Qdrant)
        Semantic search for relevant past memories
    │
    ▼ Step 4 — Short-term Context (Redis)
        Last 5 conversation turns (24h TTL)
    │
    ▼ Step 5 — HealthBrain Agent Execution
        Routes by intent → calls specialized sub-agents
    │
    ▼ Step 6 — Stream Response (Socket.io token-by-token)
    │
    ▼ Step 7 — Save to all 3 memory layers (background)
        Redis + Mem0AI + MongoDB
```

**Intent Categories:**
| Intent | Triggers |
|---|---|
| `symptom_check` | User describes physical symptoms |
| `report_analysis` | User references reports or lab results |
| `doctor_search` | User wants to find a doctor |
| `appointment_booking` | User wants to book/cancel/reschedule |
| `wellness` | Habits, streaks, wellness score |
| `general_query` | Greetings, general questions |

### Multi-Layer Memory System

| Layer | Technology | Retention | Purpose |
|---|---|---|---|
| **Short-term** | Redis (`chat_history:{userId}`) | 24 hours | Conversation continuity |
| **Long-term** | Mem0AI (Qdrant + Neo4j) | Permanent | Semantic user preferences & medical history |
| **Persistent** | MongoDB `ChatHistory` | Permanent | Audit trail & Redis fallback |

### Report Analysis Pipeline

```
Patient uploads file (PDF / image)
    │
    ▼ POST /images/upload
        Cloudinary upload → BullMQ enqueue (non-blocking)
    │
    ▼ textExtractionWorker (background)
        ├── Image → Google Cloud Vision OCR
        ├── PDF   → Buffer text extraction
        └── Routes to specialist agent:
            ├── clinicalreportspecialist.agent.ts
            ├── labreportspecialist.agent.ts
            └── Imagingreportspecialist.agent.ts
                │
                ▼ MedicalSynthesizer → Save to MongoDB
                       │
                       ▼ Socket.io push → "report:ready"
                              │
                              ▼ Frontend auto-refresh
```

---

## 🖥️ Frontend Application

**Location:** `Healthcare_Frontend/smart_healthcare/`  
**Framework:** Next.js 16 with App Router  
**Styling:** Tailwind CSS v4 + Framer Motion

### App Router Structure

```
smart_healthcare/app/
├── page.tsx                        ← Landing Page
├── layout.tsx                      ← Root layout + context providers
├── (auth)/
│   ├── login/page.tsx              ← Login form
│   └── register/page.tsx           ← Registration
├── (patient)/
│   ├── layout.tsx                  ← Patient sidebar + socket init
│   └── dashboard/
│       ├── page.tsx                ← Stats, cards, quick actions
│       ├── nova/                   ← Nova AI chat (HealthBrain)
│       ├── reports/                ← Upload + view analyzed reports
│       └── wellness/               ← Habit tracker UI + charts
└── (doctor)/
    ├── layout.tsx                  ← Doctor sidebar + socket init
    └── dashboard/
        └── page.tsx                ← Schedule, analytics, AI copilot
```

### Context Providers
| Context | Purpose |
|---|---|
| `user.context.tsx` | Global auth state, user data |
| `patient-dashboard.context.tsx` | Patient dashboard data, appointments |
| `doctor-dashboard.context.tsx` | Doctor schedule, analytics |
| `habit-tracker.context.tsx` | Today's log, wellness score |
| `docter.context.tsx` | Doctor search/listing state |

### Custom Hooks
| Hook | Purpose |
|---|---|
| `useNovaChat.ts` | Patient Socket.io chat with HealthBrain |
| `useDoctorChat.ts` | Doctor Socket.io chat with DoctorBrain |
| `useHistoricalAnalysis.ts` | Fetching & processing past report data |
| `useMultiSectionUpload.ts` | Drag-and-drop multi-file report upload |

---

## 📡 API Reference

### Auth Service
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register patient or doctor |
| `POST` | `/auth/login` | ❌ | Login, receive JWT cookie |
| `POST` | `/auth/logout` | ✅ | Clear session cookie |

### Doctor Service
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| `POST` | `/doctor/create` | ✅ | Create doctor profile |
| `GET` | `/doctor/getprofile` | ✅ | Get own profile |
| `PUT` | `/doctor/updateprofile` | ✅ | Update profile fields |
| `DELETE` | `/doctor/deleteprofile` | ✅ | Delete profile |
| `GET` | `/doctor/all` | ❌ | Search all doctors |
| `GET` | `/doctor/:id` | ❌ | Get doctor by ID |

### Appointment Service
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| `POST` | `/appointments/create` | ✅ | Book an appointment |
| `GET` | `/appointments/mine` | ✅ | Get patient's appointments |
| `GET` | `/appointments/doctor/:id` | ✅ | Get doctor's appointments |
| `GET` | `/appointments/slots/:doctorId` | ✅ | Check available slots |
| `PUT` | `/appointments/:id/status` | ✅ | Update status / add notes |
| `PUT` | `/appointments/:id/cancel` | ✅ | Cancel appointment |
| `PUT` | `/appointments/:id/reschedule` | ✅ | Reschedule appointment |

### AI Service (REST)
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| `POST` | `/images/upload` | ✅ | Upload medical image/PDF |
| `GET` | `/analysis/reports` | ✅ | Get all analyzed reports |
| `GET` | `/analysis/report/:id` | ✅ | Get single report |

### HabitTracker Service
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| `GET` | `/api/v1/habits/goals` | ✅ | Get user's habit goals |
| `POST` | `/api/v1/habits/goals` | ✅ | Set/update habit goals |
| `POST` | `/api/v1/habits/log` | ✅ | Log daily habit activity |
| `GET` | `/api/v1/habits/today` | ✅ | Get today's log + score |
| `GET` | `/api/v1/habits/streak` | ✅ | Get 7-day streak data |
| `GET` | `/api/v1/habits/trends` | ✅ | Get trend chart data |
| `GET` | `/api/v1/habits/tip` | ✅ | Get personalized weekly tip |

### Socket.io Events (AI Service)

**Patient Events:**
```
Emit:   ai:query         { query: string }
Listen: ai:status        { step: string }      ← progress update
Listen: ai:chunk         { token: string }     ← streaming token
Listen: ai:done          { finalResponse }     ← completion
Listen: ai:error         { message }           ← on failure
Listen: report:ready     { analysis }          ← async report done
```

**Doctor Events:**
```
Emit:   doctor:query     { query: string }
Listen: doctor:status    { step: string }
Listen: doctor:chunk     { token: string }
Listen: doctor:done      { finalResponse }
Listen: doctor:error     { message }
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **pnpm** (`npm install -g pnpm`)
- **MongoDB** (local or Atlas)
- **Redis** (local or Redis Cloud)
- **Docker** (for Qdrant, Neo4j, Redis Stack via compose)

### Running the AI Service (with Docker dependencies)

```bash
# Start Qdrant, Neo4j, Redis Stack via Docker
cd Healthcare_backend/Ai_service
docker-compose up -d

# Install dependencies
pnpm install

# Start in development mode
pnpm dev
```

### Running Any Backend Service

```bash
cd Healthcare_backend/<service_name>
pnpm install
pnpm dev
```

### Running the Frontend

```bash
cd Healthcare_Frontend/smart_healthcare
pnpm install
pnpm dev
# Runs on http://localhost:3000
```

---

## 🔐 Environment Variables

Each service requires a `.env` file. Below is a consolidated reference:

### Backend Services (Common)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/<service_db>
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### AI Service (Additional)
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Google
GOOGLE_GENAI_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Redis
REDIS_URL=redis://localhost:6379

# Mem0AI / Qdrant
QDRANT_URL=http://localhost:6333

# Neo4j
NEO4J_URL=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Communication
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
EMAIL_USER=...
EMAIL_PASS=...
```

### Frontend
```env
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:5001
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_DOCTOR_SERVICE_URL=http://localhost:5002
NEXT_PUBLIC_APPOINTMENT_SERVICE_URL=http://localhost:5003
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:5004
NEXT_PUBLIC_HABIT_SERVICE_URL=http://localhost:5006
```

---

## 🔮 Future Enhancements

- [ ] **Complete HabitTracker Service** — Implement services, controllers, routes
- [ ] **Real-time Video Consultations** — WebRTC integration
- [ ] **Mobile App** — React Native companion app
- [ ] **Wearable Integration** — Sync health data from smartwatches/fitness trackers
- [ ] **Advanced AI Diagnostics** — Deeper multi-modal health analysis
- [ ] **Multi-language Support** — Expanded language coverage beyond Hinglish
- [ ] **EHR Integration** — Electronic Health Records connectivity
- [ ] **Analytics Dashboard** — Provider-level population health analytics
- [ ] **Enhanced Security** — HIPAA compliance, audit logging

---

## 📄 License

This project is a **minor project** developed for academic purposes.  
© 2026 Dheeraj Patel. All rights reserved.

---

<div align="center">

**Built with ❤️ by Dheeraj Patel**

*NovaCure — Revolutionizing Healthcare Through AI*

</div>
