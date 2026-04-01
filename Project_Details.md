# NovaCure Healthcare Platform - Detailed Project Documentation

## Project Overview: NovaCure Healthcare Platform

#### **Project Title**
NovaCure Healthcare Platform  
*A Comprehensive Digital Healthcare Solution*

#### **Introduction**
NovaCure is a modern, AI-powered healthcare platform designed to connect patients and doctors through a seamless, secure digital ecosystem. It enables personalized health tracking, AI-assisted consultations, appointment management, and wellness monitoring. The platform supports both patients and healthcare providers with intuitive dashboards, real-time interactions, and data-driven insights to improve healthcare outcomes.

#### **Architecture**
- **Microservices Backend**: Modular, scalable architecture with independent services for different functionalities, ensuring high availability and easy maintenance.
- **Frontend**: Single-page application built with Next.js for responsive, dynamic user interfaces.
- **Database**: MongoDB (inferred from service models) for flexible data storage.
- **Deployment**: Containerized services (e.g., Docker in AI service) for portability and scalability.

#### **Key Features**
- **User Authentication & Profiles**: Secure login/registration for patients and doctors with role-based access.
- **AI-Powered Interactions**: Chat-based consultations with AI agents for patients and doctors, including image analysis and medical advice.
- **Appointment Management**: Scheduling, booking, and managing consultations (online, clinic, or hospital).
- **Habit Tracking & Wellness**: Daily habit monitoring (hydration, sleep, exercise, etc.) with wellness scores, streaks, trends, and personalized tips.
- **Doctor Profiles & Services**: Detailed doctor profiles with specializations, availability, fees, and consultation types.
- **Patient Dashboards**: Onboarding, health tracking, and access to medical services.
- **Real-Time Communication**: Socket-based interactions for live chats and updates.

#### **Technologies Used**
- **Backend**: Node.js, Express.js, TypeScript, pnpm (package manager).
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion (animations).
- **AI/ML**: Custom AI agents for medical analysis and chat (no external LLMs mentioned).
- **Database**: MongoDB with Mongoose for data modeling.
- **Other Tools**: Docker, Socket.io (for real-time features), Zod (validation), JWT (authentication).

#### **Services Breakdown**
1. **AI Service (Port: Likely 5001)**: Handles AI chat, image analysis, and doctor-patient interactions. Includes agents for medical queries and diagnostics.
2. **Appointment Service**: Manages booking, scheduling, and consultation logistics.
3. **Auth Service**: User authentication, registration, and session management.
4. **Doctor Service**: Doctor profiles, availability, and service listings.
5. **HabitTracker Service (Port: 5006)**: Tracks 6 wellness habits, calculates scores, provides streaks/trends, and offers rule-based tips.
6. **User Service**: Patient profiles, onboarding, and general user management.
7. **Frontend (smart_healthcare)**: Unified UI for patients and doctors, with components for auth, dashboards, onboarding, and layouts.

#### **Current Status**
- Backend services are in development with core models, middlewares, and utilities implemented.
- HabitTracker service has a detailed implementation plan (core logic, controllers, routes pending).
- Frontend has landing pages, auth flows, and dashboard skeletons ready.
- Ready for integration testing and deployment.

#### **Future Enhancements**
- Full AI integration for advanced diagnostics.
- Mobile app development.
- Integration with external health devices (wearables).
- Analytics dashboard for healthcare providers.

---

## PPT Content

### Slide 1: Title Slide
- **Title:** NovaCure Healthcare Platform
- **Subtitle:** A Comprehensive Digital Healthcare Solution
- **Presenter:** [Your Name]
- **Date:** [Current Date]
- **Visual:** Healthcare-themed background with platform logo

### Slide 2: Introduction
- **Title:** What is NovaCure?
- **Content:**
  - Modern, AI-powered healthcare platform
  - Connects patients and doctors digitally
  - Enables personalized health tracking and AI-assisted consultations
  - Supports appointment management and wellness monitoring
  - Improves healthcare outcomes through data-driven insights
- **Visual:** Platform overview diagram

### Slide 3: Architecture Overview
- **Title:** System Architecture
- **Content:**
  - **Backend:** Microservices architecture (6 independent services)
  - **Frontend:** Next.js single-page application
  - **Database:** MongoDB for flexible data storage
  - **Deployment:** Containerized services (Docker)
  - **Communication:** REST APIs, WebSockets for real-time features
- **Visual:** High-level architecture diagram

### Slide 4: Key Features
- **Title:** Core Features
- **Content:**
  - User Authentication & Role-based Profiles (Patients & Doctors)
  - AI-Powered Chat Consultations & Image Analysis
  - Appointment Scheduling & Management
  - Habit Tracking & Wellness Scoring (6 habits)
  - Doctor Profiles & Service Listings
  - Patient Dashboards & Onboarding
  - Real-time Communication via Sockets
- **Visual:** Feature icons or screenshots

### Slide 5: Technology Stack
- **Title:** Technologies Used
- **Content:**
  - **Backend:** Node.js, Express.js, TypeScript, pnpm
  - **Frontend:** Next.js, React, TypeScript, Tailwind CSS
  - **AI/ML:** Custom agents (OpenAI, Google Gemini), Mem0AI
  - **Database:** MongoDB with Mongoose
  - **Tools:** Docker, Socket.io, JWT, Zod validation
- **Visual:** Tech stack logos

### Slide 6: Services Breakdown
- **Title:** Backend Microservices
- **Content:**
  - **AI Service:** Chat, image analysis, medical agents
  - **Appointment Service:** Booking & scheduling
  - **Auth Service:** User authentication
  - **Doctor Service:** Profiles & availability
  - **HabitTracker Service:** Wellness monitoring
  - **User Service:** Patient management
  - **Frontend:** Unified UI for all users
- **Visual:** Service diagram

### Slide 7: AI Agents Structure
- **Title:** AI Agents Overview
- **Content:**
  - 19 Specialized Agents for medical functions
  - Categories: Medical Analysis, Administrative, Communication
  - Examples: Symptom Analyzer, Prescription Advisor, Health Coach
  - Memory: Redis + Mem0AI for conversation persistence
  - Tools: Image analysis, database queries, external APIs
- **Visual:** Agent flowchart or list

### Slide 8: Habit Tracking System
- **Title:** Wellness & Habit Tracking
- **Content:**
  - Tracks 6 daily habits: Hydration, Sleep, Exercise, etc.
  - Calculates wellness scores and streaks
  - Provides trends and personalized tips
  - Rule-based recommendations
  - Integration with patient dashboards
- **Visual:** Habit tracking interface mockup

### Slide 9: Current Status
- **Title:** Development Status
- **Content:**
  - Backend services: Core models & middlewares implemented
  - HabitTracker: Detailed plan, partial implementation
  - Frontend: Landing pages, auth, dashboards ready
  - Ready for integration testing & deployment
  - Known issues: Naming inconsistencies (Appointment, Doctor services)
- **Visual:** Progress bars or checklist

### Slide 10: Future Enhancements
- **Title:** Roadmap & Future Plans
- **Content:**
  - Advanced AI diagnostics integration
  - Mobile app development
  - Wearable device integration
  - Analytics dashboard for providers
  - Enhanced security & compliance features
- **Visual:** Timeline or roadmap diagram

### Slide 11: Conclusion
- **Title:** Summary & Impact
- **Content:**
  - NovaCure revolutionizes healthcare delivery
  - Combines AI, microservices, and user-centric design
  - Addresses key challenges in digital health
  - Scalable, secure, and future-ready platform
  - Ready for real-world deployment and expansion
- **Visual:** Call-to-action or final logo

### Slide 12: Q&A
- **Title:** Questions & Discussion
- **Content:**
  - Open floor for questions
  - Contact information
  - Demo availability
- **Visual:** Contact details and QR code

---

## Project Structure

### Root Directory Structure
```
Healthcare_backend/
├── Ai_service/
├── Appoinment_service/  (Note: Typo - should be Appointment_service)
├── auth-service/
├── Docter_service/      (Note: Typo - should be Doctor_service)
├── HabitTracker_service/
└── user_service/

Healthcare_Frontend/
└── smart_healthcare/
```

---

## Backend Services

### 1. AI Service
**Location:** `Healthcare_backend/Ai_service/`  
**Port:** Not specified in files (likely 5001 or similar)  
**Purpose:** Handles AI-powered interactions, chat, image analysis, and doctor-patient consultations.

#### Dependencies (package.json)
- **AI/ML:** @google/genai, @openai/agents, mem0ai, @google-cloud/vision
- **Database:** mongoose (MongoDB)
- **Queue:** bullmq, ioredis
- **Cloud:** cloudinary, next-cloudinary
- **Communication:** socket.io, twilio, nodemailer
- **Auth:** bcrypt, jsonwebtoken
- **Utilities:** axios, zod, multer, cookie-parser, cors, dotenv

#### Folder Structure
```
Ai_service/
├── src/
│   ├── Agents/          # AI Agent definitions
│   ├── app.ts           # Express app setup
│   ├── configs/         # Database config
│   ├── controllers/     # HTTP request handlers
│   ├── index.ts         # Server entry point
│   ├── middlewares/     # Express middlewares
│   ├── models/          # MongoDB schemas
│   ├── queue/           # Background job queues
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── socket.ts        # WebSocket setup
│   ├── tools/           # AI agent tools
│   ├── utils/           # Utility functions
│   └── workers/         # Background job workers
├── docker-compose.yml   # Container orchestration
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── .env
```

#### AI Agents Structure
Located in `src/Agents/` - 19 agent files:
- appointment.agent.ts
- appointmentManager.agent.ts
- clinicalreportspecialist.agent.ts
- dietary.agent.ts
- docter.agent.ts (typo: doctor)
- doctorAnalytics.agent.ts
- DoctorBrain.agent.ts
- emergency.agent.ts
- habittracker.agent.ts
- Healthbrain.agent.ts
- healthhistory.agent.ts
- Imagingreportspecialist.agent.ts
- labreportspecialist.agent.ts
- MedicalSynthesizer.agent.ts
- patientInsight.agent.ts
- queryimprowizer.agent.ts
- reportselector.agent.ts
- scheduleManager.agent.ts
- symtom.agent.ts (typo: symptom)

#### Key Agents Description
- **DoctorBrain.agent.ts:** Main orchestrator for doctor-facing AI, manages appointments, patient insights, schedule, and analytics
- **Healthbrain.agent.ts:** Likely handles patient health queries and general medical advice
- **MedicalSynthesizer.agent.ts:** Probably synthesizes medical information from various sources
- **appointmentManager.agent.ts:** Manages appointment scheduling and status updates
- **patientInsight.agent.ts:** Provides patient profile and history summaries
- **doctorAnalytics.agent.ts:** Generates practice statistics and performance metrics

#### Memory Structure of Agents

Your AI agents use a **multi-layered memory system** with three distinct storage mechanisms for different types of memory retention and retrieval:

### **1. Short-Term Memory (Redis)**
**Purpose**: Stores recent conversation context for immediate continuity
**Technology**: Redis (via `ioredis` library)
**Configuration**:
- **Storage**: Redis Lists (LPUSH/RPUSH operations)
- **Key Format**: `chat_history:{userId}`
- **Retention**: Last 5 interactions (10 messages total)
- **TTL**: 24 hours (`SESSION_TTL = 60 * 60 * 24` seconds)
- **Fallback**: MongoDB hydration when Redis is empty

**Implementation Details**:
```typescript
// From redisMemory.service.ts
const MAX_TURNS = 5; // Keep only last 5 interactions
const SESSION_TTL = 60 * 60 * 24; // 24 hours

saveInteraction: async (userId: string, userQuery: string, aiResponse: string) => {
    const interaction = JSON.stringify({
        user: userQuery,
        assistant: aiResponse,
        timestamp: new Date().toISOString()
    });
    await redisClient.rpush(redisKey, interaction);
    await redisClient.ltrim(redisKey, -MAX_TURNS, -1); // Trim to last 5
    await redisClient.expire(redisKey, SESSION_TTL);
}
```

### **2. Long-Term Memory (Mem0AI)**
**Purpose**: Semantic memory for user preferences, medical history, and personalized context
**Technology**: Mem0AI framework with multiple storage backends
**Configuration**:
- **LLM Provider**: OpenAI GPT-4o-mini
- **Vector Store**: Qdrant (localhost:6333)
- **Graph Store**: Neo4j (for relationship mapping)
- **History Store**: Supabase (table: `memory_history`)
- **Features**: Graph relationships, semantic search, conversation continuity

**Mem0 Configuration** (from `src/services/mem0.service.ts`):
```typescript
const config = {
  llm: { provider: "openai", config: { model: "gpt-4o-mini" } },
  vectorStore: {
    provider: 'qdrant',
    config: {
      collectionName: 'memories',
      embeddingModelDims: 1536,
      host: 'localhost',
      port: 6333,
    },
  },
  graphStore: {
    provider: "neo4j",
    config: {
      url: process.env.NEO4J_URL!,
      username: process.env.NEO4J_USERNAME!,
      password: process.env.NEO4J_PASSWORD!,
    },
  },
  historyStore: {
    provider: "supabase",
    config: {
      tableName: "memory_history"
    }
  }
};
```

### **3. Persistent Storage (MongoDB)**
**Purpose**: Complete conversation history and audit trail
**Technology**: MongoDB with Mongoose ODM
**Schema** (from `src/models/chathistory.model.ts`):
```typescript
interface IChatHistory {
  userId: mongoose.Types.ObjectId; // Reference to User
  userQuery: string;
  aiResponse: string;
  timestamp: Date;
}
```

### **Memory Integration in Agent Workflow**

#### **Query Processing Pipeline**:
1. **Query Improvement**: `queryImproviserService` analyzes and structures the user query
2. **Context Building**: Fetches user profile and recent health reports
3. **Memory Retrieval**:
   - **Mem0 Search**: Semantic search for relevant past memories
   - **Redis Context**: Recent conversation history
4. **Agent Execution**: HealthBrain agent processes with full context
5. **Memory Storage**: Saves interaction to all three memory layers

#### **Memory Retrieval in Action** (from `src/controllers/mainAi.controller.ts`):
```typescript
// 🧠 1. Fetch Past Memories for Context
const memResults = await memory.search(improvedQuery.clean_query, { userId });
const pastMemories = memResults.results.map(m => m.memory).join(" | ");

// 🕒 Fetch Recent Conversation History
const recentHistory = await redisMemoryService.getRecentContext(userId);

const improvedQueryWithProfile = { 
  improvedQuery, 
  userprofile, 
  pastMemories, 
  recentHistory 
};
```

#### **Memory Storage Process**:
```typescript
const saveMemoryBackground = (userId: string, cleanQuery: string, rawOutput: any) => {
  // 1. Save to Redis (short-term)
  await redisMemoryService.saveInteraction(userId, cleanQuery, finalOutput);
  
  // 2. Save to Mem0 (long-term semantic)
  await memory.add([
    { role: "user", content: cleanQuery },
    { role: "assistant", content: finalOutput }
  ], { userId });
  
  // 3. Save to MongoDB (persistent)
  await ChatHistory.create({
    userId,
    userQuery: cleanQuery,
    aiResponse: finalOutput
  });
};
```

### **Docker Services for Memory**

Your `docker-compose.yml` includes dedicated services:
- **Qdrant**: Vector database for semantic embeddings
- **Neo4j**: Graph database for relationship mapping  
- **Redis Stack**: In-memory data structure store with UI

### **Memory Types by Use Case**

| Memory Type | Purpose | Retention | Technology | Access Pattern |
|-------------|---------|-----------|------------|----------------|
| **Short-term** | Conversation continuity | 24 hours | Redis | Fast lookup, recent context |
| **Long-term** | User preferences, medical history | Permanent | Mem0AI (Qdrant + Neo4j) | Semantic search, relationships |
| **Persistent** | Audit trail, history | Permanent | MongoDB | Query by date, user |

### **Key Benefits**

1. **Multi-layered Context**: Combines immediate conversation flow with long-term personalization
2. **Performance Optimized**: Redis for speed, Mem0 for intelligence, MongoDB for persistence
3. **Fallback Resilience**: Redis failures hydrate from MongoDB
4. **Semantic Understanding**: Mem0 provides contextual memory beyond keyword matching
5. **Scalable Architecture**: Each memory layer can be scaled independently

This memory architecture enables your AI agents to maintain sophisticated conversation continuity while providing personalized healthcare interactions based on users' medical history and preferences.

#### Models (MongoDB Schemas)
Located in `src/models/`:
- Appointment.model.ts
- chathistory.model.ts
- DailyLog.model.ts
- Docter.model.ts (typo: Doctor)
- HabitGoal.model.ts
- overallreprot.model.ts (typo: overallreport)
- report.model.ts
- user.model.ts
- userprofile.model.ts

#### Services
Located in `src/services/`:
- Agent.service.ts
- cloudinary.service.ts
- DoctorBrain.service.ts
- gemini.service.ts
- HealthBrain.service.ts
- mem0.service.ts
- queryimprowiser.service.ts
- redisMemory.service.ts
- report.service.ts

#### Controllers
Located in `src/controllers/`:
- anaylisis.controller.ts (typo: analysis)
- doctorAi.controller.ts
- image.controller.ts
- mainAi.controller.ts

#### Routes
Located in `src/routes/`:
- analysis.route.ts
- doctorAi.route.ts
- image.routes.ts
- mainAi.route.ts

#### Tools
Located in `src/tools/`:
- appointmentagent.tool.ts
- dietary.tool.ts
- docteragent.tool.ts (typo: doctoragent)
- doctorBrain.tool.ts
- emergency.tool.ts
- habittracker.tool.ts
- healthhistory.tool.ts
- symtomagent.tool.ts (typo: symptomagent)

#### Queue & Workers
- Queue: textExtractionQueue.ts
- Worker: textExtractionWorker.ts

---

### 2. Appointment Service
**Location:** `Healthcare_backend/Appoinment_service/` (Typo in name)  
**Purpose:** Manages appointment booking, scheduling, and consultation logistics.

#### Structure (Similar to other services)
```
Appoinment_service/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── model/          (Note: 'model' instead of 'models')
│   ├── routes/
│   ├── services/
│   └── utils/
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

### 3. Auth Service
**Location:** `Healthcare_backend/auth-service/`  
**Purpose:** User authentication, registration, and session management.

#### Structure
```
auth-service/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── model/          (Note: 'model' instead of 'models')
│   ├── routes/
│   ├── services/
│   └── utils/
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

### 4. Doctor Service
**Location:** `Healthcare_backend/Docter_service/` (Typo in name)  
**Purpose:** Doctor profiles, availability, and service listings.

#### Structure (Similar pattern)
```
Docter_service/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── model/
│   ├── routes/
│   ├── services/
│   └── utils/
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

### 5. HabitTracker Service
**Location:** `Healthcare_backend/HabitTracker_service/`  
**Port:** 5006  
**Purpose:** Tracks 6 daily wellness habits, calculates wellness scores, provides streaks and trends.

#### Key Features
- **Habits Tracked:** Hydration, Sleep, Physical Activity, Meals, Screen Breaks, Stress Relief
- **Scoring:** Dynamic wellness score (0-100) based on goal achievement
- **Features:** 7-day streak data, trend charts, rule-based personalized tips

#### Implementation Plan (From implementation_plan.md)
**Current Status:** Models, middlewares, utils, and config are complete. Services, controllers, routes, app.ts, and index.ts need implementation.

#### Models (Already Done)
- HabitGoal.model.ts
- DailyLog.model.ts
- user.model.ts (mirrored from auth-service)

#### Required Implementation
1. **src/services/habit.service.ts** - Core business logic
2. **src/controller/habit.controller.ts** - HTTP handlers
3. **src/routes/habit.routes.ts** - Route definitions
4. **src/app.ts** - Express app setup
5. **src/index.ts** - Server entry point

#### API Endpoints (Planned)
- `GET /health` - Health check
- `GET /api/v1/habits/goals` - Get user goals
- `POST /api/v1/habits/goals` - Update goals
- `POST /api/v1/habits/log` - Log habit activity
- `GET /api/v1/habits/today` - Get today's log and score
- `GET /api/v1/habits/streak` - Get 7-day streak data
- `GET /api/v1/habits/trends` - Get trend chart data
- `GET /api/v1/habits/tip` - Get weekly personalized tip

#### Wellness Score Calculation
- Each of 6 habits worth ~16.67 points (100/6)
- Score = min(actual/target, 1) * weight for numeric habits
- Boolean habits (stress relief): full points if true, 0 if false
- Capped at 100, no bonus for over-achievement

#### Structure
```
HabitTracker_service/
├── src/
│   ├── app.ts           (To be implemented)
│   ├── index.ts         (To be implemented)
│   ├── config/          (Note: 'config' instead of 'configs')
│   ├── controller/      (To be implemented)
│   ├── middlewares/
│   ├── model/
│   ├── routes/          (To be implemented)
│   ├── services/        (To be implemented)
│   └── utils/
├── implementation_plan.md
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

### 6. User Service
**Location:** `Healthcare_backend/user_service/`  
**Purpose:** Patient profiles, onboarding, and general user management.

#### Structure (Similar pattern)
```
user_service/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── model/
│   ├── routes/
│   ├── services/
│   └── utils/
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

## Frontend Application

### Smart Healthcare Frontend
**Location:** `Healthcare_Frontend/smart_healthcare/`  
**Framework:** Next.js 16.2.1 with App Router  
**Styling:** Tailwind CSS v4  
**State Management:** React Context API

#### Dependencies (package.json)
- **Core:** next, react, react-dom
- **Styling:** tailwindcss, @tailwindcss/postcss, tailwind-merge
- **UI/UX:** framer-motion, lottie-react, react-parallax-tilt, @react-three/fiber, @react-three/drei, three
- **Forms:** react-hook-form, @hookform/resolvers, zod
- **HTTP:** axios
- **Real-time:** socket.io-client
- **Utilities:** clsx, date-fns, js-cookie, react-day-picker, react-dropzone, react-fast-marquee, react-hot-toast, react-markdown, remark-gfm, sonner
- **Icons:** lucide-react

#### Folder Structure
```
smart_healthcare/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (doctor)/          # Doctor-specific routes
│   ├── (patient)/         # Patient-specific routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── brand/             # Branding components
│   ├── doctor/            # Doctor-specific components
│   ├── layout/            # Layout components
│   ├── onboarding/        # Onboarding flow components
│   ├── patient/           # Patient-specific components
│   └── ui/                # UI library components
├── context/               # React Context providers
│   ├── docter.context.tsx (typo: doctor)
│   ├── doctor-dashboard.context.tsx
│   ├── habit-tracker.context.tsx
│   ├── patient-dashboard.context.tsx
│   └── user.context.tsx
├── hooks/                 # Custom React hooks
│   ├── useDoctorChat.ts
│   ├── useHistoricalAnalysis.ts
│   ├── useMultiSectionUpload.ts
│   └── useNovaChat.ts
├── lib/                   # Utility libraries
│   ├── api/               # API client functions
│   └── utils.ts           # General utilities
├── public/                # Static assets
├── types/                 # TypeScript type definitions
│   ├── doctor.types.ts
│   ├── patient.types.ts
│   └── type.ts            (in root)
├── AGENTS.md              # AI Agents documentation
├── CLAUDE.md              # Claude AI documentation
├── README.md
├── middleware.ts          # Next.js middleware
├── next.config.ts
├── next-env.d.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
└── .env
```

#### App Router Structure
- **(auth):** Authentication-related pages (login, register, etc.)
- **(doctor):** Doctor dashboard, profile, appointments, etc.
- **(patient):** Patient dashboard, health tracking, consultations, etc.

#### Context Providers
- **user.context.tsx:** Global user state management
- **doctor-dashboard.context.tsx:** Doctor dashboard state
- **patient-dashboard.context.tsx:** Patient dashboard state
- **habit-tracker.context.tsx:** Habit tracking state
- **docter.context.tsx (typo):** Doctor-specific context

#### Custom Hooks
- **useDoctorChat.ts:** Doctor chat functionality
- **useNovaChat.ts:** Main AI chat interface
- **useHistoricalAnalysis.ts:** Historical data analysis
- **useMultiSectionUpload.ts:** File upload handling

#### Component Categories
- **auth:** Login, registration, password reset
- **brand:** Logo, branding elements
- **doctor:** Doctor profile, appointment cards, analytics
- **layout:** Navigation, headers, footers, sidebars
- **onboarding:** User setup flow
- **patient:** Health metrics, appointment booking, reports
- **ui:** Reusable UI components (buttons, inputs, modals, etc.)

---

## Database Models Overview

### User Model (Example from AI Service)
```typescript
interface IUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "patient" | "doctor";
  createdAt: Date;
  updatedAt: Date;
}
```
- **Validation:** Email format, password min 6 chars, phone regex
- **Security:** Password hashed with bcrypt, not selected by default

### Key Models Across Services
- **User Models:** Consistent across services with role-based access
- **Appointment Models:** Scheduling, status, notes
- **Doctor Models:** Profiles, specializations, availability
- **Patient Models:** Health records, profiles
- **Habit Models:** Goals, daily logs, wellness scores
- **Report Models:** Medical reports, chat history, analytics

---

## AI Architecture

### Agent-Based System
- **Framework:** OpenAI Agents (@openai/agents)
- **Memory:** Mem0AI for persistent memory
- **Tools:** Specialized tools for different functionalities
- **Orchestration:** DoctorBrain as main coordinator

### Key AI Capabilities
1. **Medical Consultation:** AI-assisted diagnosis and advice
2. **Image Analysis:** Medical image processing (Google Cloud Vision)
3. **Report Analysis:** Lab reports, clinical reports interpretation
4. **Appointment Management:** AI-powered scheduling
5. **Health Analytics:** Patient insights and doctor analytics
6. **Emergency Response:** Critical situation handling
7. **Dietary Guidance:** Nutrition recommendations
8. **Symptom Analysis:** Initial symptom assessment

### Memory System
- **Redis:** For session-based memory
- **Mem0AI:** For long-term user memory and personalization
- **MongoDB:** For persistent chat history and reports

---

## API Architecture

### Authentication
- **JWT-based authentication**
- **Role-based access control** (patient/doctor)
- **Cookie-based sessions**

### Communication
- **RESTful APIs** for CRUD operations
- **WebSocket (Socket.io)** for real-time features
- **Background queues (BullMQ)** for async processing

### Key API Patterns
- **Standard Response:** `{ success: boolean, data: any }`
- **Error Handling:** Global error middleware
- **Validation:** Zod schemas for request validation
- **Middleware:** Auth, CORS, logging

---

## Development Setup

### Package Manager
- **pnpm** used across all services and frontend

### Environment Variables
- **.env files** for configuration
- **Database URLs, API keys, secrets**

### Build & Run
- **Development:** `pnpm dev` (with tsx watch for backend)
- **Production:** `pnpm build && pnpm start`

### Containerization
- **Docker Compose** in AI service for container orchestration

---

## Known Issues & Typos
1. **Service Names:** Appoinment_service → Appointment_service, Docter_service → Doctor_service
2. **File Names:** docter.agent.ts → doctor.agent.ts, symtom.agent.ts → symptom.agent.ts
3. **Model Names:** Docter.model.ts → Doctor.model.ts, overallreprot.model.ts → overallreport.model.ts
4. **Controller Names:** anaylisis.controller.ts → analysis.controller.ts
5. **Tool Names:** docteragent.tool.ts → doctoragent.tool.ts, symtomagent.tool.ts → symptomagent.tool.ts
6. **Context Names:** docter.context.tsx → doctor.context.tsx
7. **Folder Names:** model/ vs models/, config/ vs configs/

---

## Future Enhancements
1. **Complete HabitTracker Service Implementation**
2. **Mobile App Development**
3. **Integration with Wearable Devices**
4. **Advanced AI Diagnostics**
5. **Multi-language Support**
6. **Real-time Video Consultations**
7. **Electronic Health Records (EHR) Integration**
8. **Analytics Dashboard Expansion**

---

## Technology Stack Summary
- **Backend:** Node.js, Express, TypeScript, MongoDB, Redis
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **AI/ML:** OpenAI Agents, Google Gemini, Mem0AI, Google Cloud Vision
- **Real-time:** Socket.io
- **Cloud:** Cloudinary (media), Twilio (SMS), Nodemailer (email)
- **DevOps:** Docker, pnpm
- **Validation:** Zod
- **State Management:** React Context
- **Animations:** Framer Motion, Lottie
- **3D Graphics:** Three.js, React Three Fiber

This documentation provides a comprehensive overview of the NovaCure Healthcare Platform's architecture, components, and implementation details.</content>
<parameter name="filePath">c:\Users\patel\OneDrive\Desktop\minor project\Project_Details.md