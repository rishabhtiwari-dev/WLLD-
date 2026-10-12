# 🚀 Meme’d — Campaign Payout Tracker

A full-stack creator marketplace application built for **WLDD**. Brands launch campaigns with custom view-milestone ladders and strict budgets; creators submit content (Instagram/YouTube), and earn payouts as their posts reach higher view tiers.

---

## 📑 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [Payout & Budget Logic](#-payout--budget-logic)
- [Concurrency & Race Condition Protection](#-concurrency--race-condition-protection)
- [View Spike Anomaly Detection](#-view-spike-anomaly-detection)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Running Unit & Concurrency Tests](#-running-unit--concurrency-tests)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [Design Decisions & Stated Assumptions](#-design-decisions--stated-assumptions)
- [Scaling to 10,000 Creators (Stretch Architecture Note)](#-scaling-to-10000-creators-stretch-architecture-note)
- [Deployment Info](#-deployment-info)

---

## 🛠 Architecture & Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB with Mongoose, Zod (runtime validation), JSON Web Tokens (JWT), Bcrypt, ioredis (optional caching), Jest + Supertest + `mongodb-memory-server` (for zero-dependency automated testing).
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Data Persistence**: MongoDB (supports MongoDB Atlas, local MongoDB, or zero-config in-memory MongoDB).
- **Caching**: Redis (graceful degradation if Redis is not configured).

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/             # DB & Redis connection handlers
│   │   ├── controllers/        # Express route controllers (Auth, Campaign, Submission)
│   │   ├── middlewares/        # JWT auth, Role guards, Zod validators, Global error handler
│   │   ├── models/             # Mongoose schemas (User, Campaign, Submission)
│   │   ├── routes/             # Express API routers
│   │   ├── services/           # PayoutService, SpikeDetectionService, CacheService
│   │   ├── types/              # Domain TypeScript interfaces & types
│   │   ├── scripts/            # Database seed script for 1-click test data
│   │   ├── app.ts              # Express application assembly
│   │   └── server.ts           # Server entrypoint with graceful shutdown
│   ├── tests/
│   │   ├── payoutService.test.ts   # Unit tests for ladder logic & budget capping
│   │   └── concurrency.test.ts     # Parallel stress tests (10 concurrent requests)
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── hooks/                  # BUSINESS LOGIC & FUNCTIONS (state, handlers, API calls)
│   │   │   ├── useBrandDashboard.ts
│   │   │   ├── useCreatorPortal.ts
│   │   │   ├── useCreateCampaign.ts
│   │   │   ├── useSubmitPost.ts
│   │   │   ├── useSimulateView.ts
│   │   │   ├── useLoginForm.ts
│   │   │   └── useRegisterForm.ts
│   │   ├── components/             # PURE PRESENTATIONAL / UI DESIGN COMPONENTS
│   │   │   ├── brand/
│   │   │   │   ├── BrandStats.tsx
│   │   │   │   └── CampaignsList.tsx
│   │   │   ├── creator/
│   │   │   │   ├── CreatorStats.tsx
│   │   │   │   ├── CreatorSubmissionsList.tsx
│   │   │   │   └── LiveCampaignsGrid.tsx
│   │   │   ├── modals/
│   │   │   │   ├── CreateCampaignModal.tsx
│   │   │   │   ├── SubmitPostModal.tsx
│   │   │   │   └── SimulateViewModal.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginFormView.tsx
│   │   │   │   └── RegisterFormView.tsx
│   │   │   └── Navbar.tsx
│   │   ├── app/                    # THIN ROUTE CONTAINERS (connecting hook to design)
│   │   │   ├── brand/page.tsx      # Brand dashboard
│   │   │   ├── creator/page.tsx    # Creator portal
│   │   │   ├── login/page.tsx      # Login page
│   │   │   ├── register/page.tsx   # Sign-up page
│   │   │   ├── layout.tsx          # Root layout with AuthProvider & Navbar
│   │   │   └── page.tsx            # Landing page
│   │   ├── lib/                    # API client & AuthContext
│   │   └── types/                  # Frontend shared types
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.example
├── docker-compose.yml              # Multi-container orchestration (Backend + Frontend + Mongo + Redis)
└── README.md
```

---

## ✨ Key Features

1. **Role-Based Authentication (JWT)**:
   - Dedicated access controls for `brand` and `creator` users.
2. **Brand Campaign Management**:
   - Create campaigns with dynamic milestone ladders (`views -> payout`).
   - Real-time budget progress bar (**Spent Budget vs. Remaining Budget**).
   - View audit log of all creator submissions and milestone progression.
3. **Creator Marketplace Experience**:
   - Browse open campaigns and submit public Instagram/YouTube post links.
   - Aggregate earnings tracker (`Total Earned`, `Total Views`, `Verified Posts`).
   - Real-time milestone status badges.
4. **Interactive Platform View Simulator**:
   - Built-in UI modal to simulate `PATCH /api/submissions/:id/views` with preset surges or custom view counts.
   - Evaluators can immediately test milestone triggers, budget caps, and spike alerts live.
5. **View Spike Anomaly Detector**:
   - Identifies unnatural view velocity (e.g. >50,000 views within 60s or >1,000 views/sec).
   - Flags suspicious submissions with reasons in the database and shows a badge on the dashboard.
6. **Campaign List Caching**:
   - High-throughput Redis caching on campaign listings with automatic cache invalidation upon updates.

---

## 💰 Payout & Budget Logic

The core payout calculation follows these principles:
- **Highest Milestone Rule**:
  A creator is awarded the payout matching the highest milestone their post has crossed:
  - Example ladder: `10,000 views -> ₹500`, `50,000 views -> ₹2,000`, `100,000 views -> ₹5,000`.
  - At `15,000 views` $\rightarrow$ qualifies for the 10K milestone ($\text{₹}500$).
  - At `55,000 views` $\rightarrow$ qualifies for the 50K milestone ($\text{₹}2,000$). Incremental payout awarded is $\text{₹}2,000 - \text{₹}500 = \text{₹}1,500$.
- **No Double-Pay**:
  If a post's view count increases from `55,000` to `65,000`, the highest milestone crossed is still 50K ($\text{₹}2,000$). Since the creator already received $\text{₹}2,000$, the incremental payout is strictly **$\text{₹}0$**.
- **Multi-Milestone Jump**:
  If a post goes viral overnight from `0` to `120,000` views in a single update, the highest milestone crossed is 100K ($\text{₹}5,000$). The full $\text{₹}5,000$ is awarded in one step.
- **Budget Cap Enforcement**:
  A campaign's total cumulative payouts can **never exceed its `totalBudget`**.
  - If a creator earns an incremental $\text{₹}1,500$, but the campaign only has $\text{₹}600$ remaining, the payout is capped at $\text{₹}600$.
  - The campaign remaining budget becomes $\text{₹}0$, and all subsequent view updates receive $\text{₹}0$.

---

## 🔒 Concurrency & Race Condition Protection

To fulfill the stretch goal (*"Ensure two simultaneous view updates can never overspend the campaign budget, and repeated updates never double-pay"*):

1. **Atomic Campaign Budget Allocation**:
   Instead of non-atomic `find` then `save`, budget increments are executed using an atomic MongoDB conditional check:
   ```typescript
   await Campaign.findOneAndUpdate(
     {
       _id: campaignId,
       $expr: { $lte: [{ $add: ['$spentBudget', requestedAmount] }, '$totalBudget'] }
     },
     { $inc: { spentBudget: requestedAmount } },
     { new: true }
   );
   ```
   If two requests hit the campaign simultaneously when only $\text{₹}500$ is left, only one request can satisfy the condition. The second request detects that remaining budget is $\text{₹}0$ and awards $\text{₹}0$.
2. **Submission-Level Mutex (Idempotency Guard)**:
   In `PayoutService`, incoming view updates for the same `submissionId` are serialized through an asynchronous `KeyedMutex`. This ensures that even if five concurrent requests report `12,000 views` for the exact same post, the calculation is evaluated sequentially against the saved payout state, guaranteeing that **no repeated update can ever double-pay**.

---

## 🚨 View Spike Anomaly Detection

In `backend/src/services/spikeService.ts`, each view update compares the new view count against the post's previous audit trail:
- **Velocity Check**: $\text{Velocity} = \frac{\Delta \text{Views}}{\Delta \text{Seconds}}$. If velocity exceeds $1,000\text{ views/sec}$, an anomaly is flagged.
- **Rapid Surge**: Sudden jump of $\ge 50,000\text{ views}$ in under $60\text{ seconds}$.
- **Massive Step**: Single update jump of $\ge 200,000\text{ views}$.
- **Result**: The submission is flagged as `FLAGGED` with the audit reason saved, and an alert tag is displayed on both brand and creator dashboards.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$
- *(Optional)* Docker & Docker Compose

### 1. Clone & Setup Backend
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env
```
> **Zero-Config Database**: By default, `MONGODB_URI=memory` in `.env`. If you do not have MongoDB running locally, the backend automatically boots an in-memory MongoDB instance. No setup required!

Seed the database with ready-to-test brand and creator demo accounts:
```bash
npm run seed
```
Start the backend development server:
```bash
npm run dev
# Running on http://localhost:5000
# Health check: http://localhost:5000/health
```

### 2. Setup Frontend
In a separate terminal window:
```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env.local

# Run frontend development server
npm run dev
# Running on http://localhost:3000
```

Open your browser at `http://localhost:3000`.

### 🔑 Demo Credentials
For testing convenience, the login page features **1-Click Demo Login** buttons:
- **Brand Demo**: `brand@memed.com` / `password123`
- **Creator Demo**: `creator@memed.com` / `password123`

---

## 🧪 Running Unit & Concurrency Tests

The backend includes a comprehensive Jest test suite covering milestone calculation, budget capping, view spike detection, and parallel race condition stress testing.

Run all tests:
```bash
cd backend
npm test
```

### Test Coverage Highlights:
- `tests/payoutService.test.ts`:
  - 0 views / views below 1st milestone $\rightarrow$ ₹0
  - Exact milestone thresholds $\rightarrow$ correct payout
  - Mid-milestone views $\rightarrow$ correct floor payout
  - Repeated updates without new milestones $\rightarrow$ ₹0 delta (no double-pay)
  - Multi-milestone virality in a single update $\rightarrow$ highest milestone payout
  - Strict campaign budget capping & exhaustion
  - View spike anomaly detection
- `tests/concurrency.test.ts`:
  - **10 simultaneous parallel view updates** attempting to exceed budget $\rightarrow$ strictly capped with zero overspend.
  - **5 repeated simultaneous requests** on the same post $\rightarrow$ paid exactly once.

---

## 🐳 Docker Setup

To run the complete stack (Backend + Frontend + MongoDB + Redis) with a single command:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

---

## 🌐 Environment Variables

### Backend (`backend/.env.example`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB connection URI (`memory` for zero-setup in-memory DB) | `memory` |
| `JWT_SECRET` | Secret key for JWT signing | `memed_secret_2025` |
| `REDIS_URL` | Redis URI for campaign list caching | `redis://localhost:6379` |

### Frontend (`frontend/.env.example`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## 💡 Design Decisions & Stated Assumptions

1. **Milestone Ladder Sorting & Validation**:
   - Ladders are strictly sorted in ascending order of views and payouts upon creation.
   - Payout increments are strictly non-negative: view fluctuations (e.g. platform scrubbing fake views) do not claw back already disbursed payouts.
2. **Partial Payout upon Budget Exhaustion**:
   - If a creator earns an increment of $\text{₹}1,500$ but the campaign only has $\text{₹}600$ remaining, the system awards the remaining $\text{₹}600$, brings remaining budget to $\text{₹}0$, and marks the payout as partial. This guarantees fair partial allocation rather than a total rejection while preserving the brand's budget ceiling.
3. **Simulation Endpoint Access**:
   - `PATCH /api/submissions/:id/views` does not require user authentication, directly matching the brief requirement to simulate third-party platform scrapers/webhooks.
4. **Duplicate Submission Guard**:
   - A compound unique index `{ campaignId: 1, postUrl: 1 }` prevents a creator from submitting the exact same post link multiple times to the same campaign.

---

## 📈 Scaling to 10,000 Creators (Stretch Architecture Note)

Scaling Meme’d from hundreds to **10,000 active creators** submitting thousands of concurrent view updates requires addressing database write contention, external API limits, and real-time ledger accounting:

### 1. Asynchronous Ingestion & Message Queues
- **Bottleneck**: Directly writing every view update synchronously to MongoDB will saturate database connection pools under 10k creators.
- **Solution**: Decouple ingestion from processing using **Apache Kafka** or **RabbitMQ / BullMQ**.
  - `PATCH /api/submissions/:id/views` immediately pushes an event to a `views.ingest` queue and returns `202 Accepted`.
  - Worker pools consume view events partitioned by `campaignId` (or `submissionId`), serializing balance mutations naturally without database contention.

### 2. Distributed Locking & Fast Caching with Redis
- Replace the in-process `KeyedMutex` with **Redis Redlock** to support horizontally scaled backend containers across multiple server nodes.
- Maintain campaign budgets in Redis using atomic Lua scripts (`EVAL`) or Redis Hashes (`HINCRBYFLOAT`). If Redis confirms budget availability, the worker flushes the transaction to MongoDB in bulk.

### 3. Database Sharding & Read-Write Splitting
- **Read/Write Splitting**: Route all high-volume campaign browsing queries to MongoDB secondary read replicas.
- **Sharding**: Shard the `submissions` collection on `{ campaignId: 1, creatorId: 1 }`, ensuring view history writes are evenly distributed across the database cluster.

### 4. Write Buffering & Delta Batching
- Posts undergoing viral surges (e.g. gaining 10k views every few seconds) generate redundant intermediate calculations.
- Implement a **sliding window buffer**: accumulate raw view updates in Redis for a 15–30 second window and execute a single consolidated payout calculation, cutting database I/O by over 90%.

### 5. Social Platform Scraping & Webhook Optimization
- Rather than constant polling, utilize YouTube Data API v3 PubSubHubbub webhooks and Instagram Graph API Webhooks with exponential backoff and HMAC signature verification.

---

## 🚀 Deployment Info

- **Backend**: Ready to deploy on Render / Railway / AWS ECS (`backend/Dockerfile`).
- **Frontend**: Ready to deploy on Vercel / Netlify (`frontend/`). Set `NEXT_PUBLIC_API_URL` to your production backend URL.
- **Database**: MongoDB Atlas free tier cluster.
- **Cache**: Upstash Redis (free tier) or Docker Redis.

---

*Crafted with ❤️ for WLDD by Antigravity.*

