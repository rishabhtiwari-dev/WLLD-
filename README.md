# Meme'd — Campaign Payout Tracker

A full-stack application built for the **WLDD** assignment. It lets brands run creator campaigns with view-based milestone ladders (e.g. 10K views → ₹500, 50K views → ₹2,000, 100K views → ₹5,000) and strict budget caps, while creators can submit links, view verified payouts, and simulate view updates in real-time.

- **GitHub Repository**: [https://github.com/rishabhtiwari-dev/WLLD-](https://github.com/rishabhtiwari-dev/WLLD-)
- **Live Backend API**: [https://wlld.onrender.com](https://wlld.onrender.com) (Health: [https://wlld.onrender.com/health](https://wlld.onrender.com/health))
- **Live Frontend**: *(Follow the 60-second Vercel deployment below)*

---

## 🔑 Demo Login Accounts

Both accounts are pre-seeded in the database. You can also use the **1-Click Demo buttons** on the login page:

| Role | Email / Username | Password |
|---|---|---|
| **Brand Account** | `brand@memed.com` | `password123` |
| **Creator Account** | `creator@memed.com` | `password123` |
| **Creator Account 2** | `priya@memed.com` | `password123` |

*(You can also sign up a new brand or creator account directly through the registration page).*

---

## ⚙️ Quick Setup & Running Locally

### Step 1: Start the Backend
Open a terminal in the root folder:

```bash
cd backend
npm install
npm run dev
```

- The API starts on `http://localhost:5000`.
- Health check: `http://localhost:5000/health`.
- **Note on Database**: By default, `MONGODB_URI` uses an in-memory MongoDB instance. You don't need to install or run MongoDB locally to test the app. If you want to connect to a real MongoDB Atlas cluster, simply paste your connection string into `backend/.env`.

### Step 2: Start the Frontend
Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

- The frontend starts on `http://localhost:3000`.
- Open `http://localhost:3000` in your browser.

---

## 🧪 Running the Tests

The backend includes 15 automated Jest tests covering payout calculations, budget caps, concurrency safety, and view spike detection.

```bash
cd backend
npm test
```

All 15 tests should pass:
- Milestone ladder math (exact milestones, between tiers, virality jumps).
- No double payouts on repeated view updates.
- Budget cap enforcement (stopping when budget reaches 0, handling partial payouts).
- Concurrency test with 10 simultaneous view updates competing for budget without overspending.
- View spike velocity detection.

---

## 🐳 Running with Docker

If you prefer Docker Compose:

```bash
docker-compose up --build
```

This brings up:
- Backend (`http://localhost:5000`)
- Frontend (`http://localhost:3000`)
- MongoDB (`localhost:27017`)
- Redis (`localhost:6379`)

---

## 🏗️ Code Structure & Separation of Concerns

We organized the frontend and backend with a clean separation of logic and presentation:

### Backend Structure (`/backend`)
- `src/controllers/`: HTTP route handlers (validating inputs, sending responses).
- `src/services/`: Core business logic:
  - `payoutService.ts`: Milestone calculation, incremental delta logic, atomic budget checks, and mutex locking.
  - `spikeService.ts`: View velocity & surge anomaly detection.
  - `cacheService.ts`: Redis caching with graceful fallback when Redis isn't running.
- `src/models/`: Mongoose schemas for User, Campaign, and Submission.
- `src/middlewares/`: JWT authentication, role guards (`brand` vs `creator`), and Zod request validation.
- `tests/`: Jest test suites (`payoutService.test.ts` and `concurrency.test.ts`).

### Frontend Structure (`/frontend`)
To keep code clean and maintainable, we separated **functions and business logic** from the **UI design**:
- `src/hooks/` (Logic & Functions):
  - `useBrandDashboard.ts`: Loads brand campaigns and computes total, spent, and remaining budget metrics.
  - `useCreatorPortal.ts`: Loads creator stats, post submissions, and live campaigns.
  - `useCreateCampaign.ts`: Handles campaign form state, ladder builder rows, and validation.
  - `useSubmitPost.ts`: Post link submission and test link generation.
  - `useSimulateView.ts`: Calls the `PATCH /api/submissions/:id/views` endpoint and handles alerts.
  - `useLoginForm.ts` & `useRegisterForm.ts`: Authentication form handlers.
- `src/components/` (Pure UI & Design):
  - `brand/BrandStats.tsx` & `brand/CampaignsList.tsx`: Visual cards, progress bars, and submission tables.
  - `creator/CreatorStats.tsx`, `creator/CreatorSubmissionsList.tsx`, `creator/LiveCampaignsGrid.tsx`: Clean UI tables and cards.
  - `modals/`: Presentational dialogs for creating campaigns, submitting links, and simulating view spikes.
- `src/app/` (Pages):
  - Clean containers (`brand/page.tsx`, `creator/page.tsx`, `login/page.tsx`, etc.) that wire the hooks to the design components.

---

## 💰 How the Payout Logic Works

1. **Highest Milestone Rule**:
   - A creator is always paid based on the highest milestone their post has crossed so far.
   - Example ladder: `10,000 views -> ₹500`, `50,000 views -> ₹2,000`, `100,000 views -> ₹5,000`.
   - At 15,000 views, the post crossed 10K, so total payout earned is ₹500.
   - Later, at 55,000 views, the post crosses 50K (total ₹2,000). The incremental payout added to this update is `₹2,000 - ₹500 = ₹1,500`.

2. **No Double-Pay**:
   - If views update from 55,000 to 65,000, the highest milestone reached is still 50K (₹2,000).
   - Because the creator already received ₹2,000, the incremental payout is `₹0`.

3. **Multi-Milestone Jump**:
   - If a post jumps from 0 views directly to 120,000 views in one update, the highest milestone crossed is 100K (₹5,000), and ₹5,000 is paid out in that single update.

4. **Handling Low or Exhausted Budget**:
   - A campaign must never pay out more than its remaining budget.
   - If a creator's milestone jump qualifies them for ₹1,500, but the campaign only has ₹600 left, the creator receives the remaining ₹600. The campaign's remaining budget becomes ₹0, and the update is marked as a partial payout.
   - Once remaining budget is 0, any further view updates will award ₹0.

5. **Concurrency & Race Conditions**:
   - When multiple view updates hit the server simultaneously, we use an atomic MongoDB query (`$inc` guarded with `$expr: { $lte: [{ $add: ['$spentBudget', amount] }, '$totalBudget'] }`).
   - If 10 requests hit at the exact same millisecond trying to claim budget, only the ones that fit within the budget will succeed. The others receive ₹0. Total spending never exceeds `totalBudget`.
   - In addition, an asynchronous mutex in `PayoutService` locks updates by `submissionId`, so rapid duplicate calls for the same post run sequentially and cannot double-pay.

---

## 🚨 View Spike Detection (Bonus Feature)

When views are updated, `SpikeDetectionService` looks at the post's view history:
- If a post jumps by more than 50,000 views in under 60 seconds (or velocity > 1,000 views/sec), it flags the submission.
- The post receives a `FLAGGED` status in the database with a clear reason (e.g. `Rapid surge detected: +60,000 views in 15s`).
- The dashboard highlights this submission with a warning badge so the brand can review it for view fraud.

---

## ⚡ Redis Caching (Bonus Feature)

- `GET /api/campaigns` caches active campaign listings in Redis for 60 seconds.
- Whenever a brand creates a new campaign or a view update spends budget, the cache is automatically invalidated so creators always see accurate remaining budgets.
- If Redis is not installed or the connection fails, the app catches the error and silently falls back to direct MongoDB queries without crashing.

---

## 📈 How Would This Scale to 10,000 Creators? (Stretch Architecture Note)

If Meme’d grows from a few hundred creators to 10,000 active creators submitting thousands of view updates per minute, running everything directly through synchronous database writes will create bottlenecks. Here is how I would scale this:

### 1. Queue-Based Asynchronous View Ingestion
Right now, `PATCH /api/submissions/:id/views` calculates payouts and writes to MongoDB synchronously. At 10,000 creators, view updates from scrapers or webhooks should be pushed into a message broker (like **RabbitMQ**, **Kafka**, or **BullMQ / Redis Streams**).
- The API endpoint immediately returns `202 Accepted`.
- Background worker processes consume messages from the queue and process the milestone math.
- By partitioning queue messages by `campaignId` or `submissionId`, updates for the same campaign are naturally serialized without locking the entire database.

### 2. Distributed Locking with Redis (Redlock)
Our current code uses an in-memory `KeyedMutex` to prevent double-spending on the same submission. In a scaled environment with multiple backend containers behind a load balancer, an in-memory lock only protects a single Node process.
- We would replace the in-memory mutex with a distributed lock like **Redis Redlock**.
- Alternatively, we can use Redis Lua scripts to atomically check and decrement campaign budgets in-memory before persisting them to MongoDB.

### 3. Buffering and Batching View Updates
When a meme goes viral, view scrapers might report new numbers every 10 seconds. Calculating payouts on every single view increase is wasteful.
- We can buffer view counts in Redis with a 30-to-60 second debounce window.
- The worker only runs the milestone check once per post per window, cutting database transactions by over 80%.

### 4. Database Indexing & Read Replicas
- Ensure indexes on `{ campaignId: 1, creatorId: 1 }` and `{ campaignId: 1, postUrl: 1 }`.
- Set up a MongoDB replica set: route high-frequency campaign listing reads to secondary read replicas, while writes go to the primary node.

---

## 📄 Environment Variables Reference

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=memory          # Set to 'memory' for zero-config, or paste MongoDB Atlas URI
JWT_SECRET=your_jwt_secret_key_here
REDIS_URL=redis://localhost:6379   # Optional
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
