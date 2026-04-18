# CPTrack – Competitive Programming Tracker

A full-stack SaaS platform for competitive programmers to track solved problems, analyze performance, and improve systematically with Codeforces integration.

---

## Features

### 📊 Dashboard
- Day streak, total solved, weekly summary, target rating
- Live Codeforces rating with progress bar toward target
- Average difficulty, hardest problem solved, top platform
- GitHub-style activity heatmap (last 5 months)
- Difficulty distribution bar chart and topic breakdown donut chart
- Recent activity feed with CF rating-colored badges

### 🎯 Problem of the Day
- Personalized daily challenge based on your live CF rating
- Rating range: `your_rating - 200` to `your_rating + 500`
- Excludes problems you've already solved
- Deterministic daily seed (same problem all day, changes tomorrow)
- One-click status check against Codeforces API
- No topic tags shown (no hints!)

### ✅ Solved Problems
- Log problems with name, difficulty, topic, platform, URL, and notes
- Expandable rows with **Notes & Approach** section for each problem
- Search/filter by name, topic, or platform
- Codeforces rating-colored difficulty badges

### 📝 To-Do List
- Queue problems you plan to solve
- **Mark as Solved** — instantly moves to solved log with one click
- Add problems manually or from Find Problems / Upsolving pages

### 🔍 Find Problems
- Browse Codeforces problems by rating range and topic
- Returns 50–70 popular problems sorted by global solve count
- Shows solved/unsolved status per problem
- One-click **Add to To-Do** button

### 📈 CF Analytics (things Codeforces doesn't show you)
- **Rating History Chart** — interactive line chart across all contests
- **Contest Performance** — total contests, win rate %, avg rating change, best/worst contest
- **Weak Topics Analysis** — success rate per topic sorted weakest first
- **Upsolving Suggestions** — unsolved problems from your past contests, with add-to-todo

### 🔄 Codeforces Sync
- Link your CF handle and sync all accepted submissions
- Auto-imports problem name, rating, topic, platform, and solve date
- Deduplication prevents double-counting

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens) with bcrypt |
| External API | Codeforces API (user.info, user.status, user.rating, problemset.problems) |

---

## Architecture

```
backend/
├── src/
│   ├── controllers/     # HTTP request handlers
│   │   ├── AuthController.js
│   │   ├── ProblemController.js
│   │   ├── PendingProblemController.js
│   │   └── UserController.js
│   ├── services/        # Business logic
│   │   ├── AuthService.js
│   │   ├── ProblemService.js
│   │   ├── PendingProblemService.js
│   │   ├── AnalyticsService.js
│   │   └── CodeforcesService.js
│   ├── repositories/    # Database abstraction
│   │   ├── UserRepository.js
│   │   ├── ProblemRepository.js
│   │   └── PendingProblemRepository.js
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── ProblemLog.js
│   │   └── PendingProblem.js
│   ├── middleware/       # Auth middleware
│   └── routes/          # Express routes
└── server.js

frontend/
├── src/
│   ├── components/
│   │   ├── Auth/        # Login, Register
│   │   ├── Dashboard/   # Dashboard with heatmap, POTD, charts
│   │   ├── Problems/    # ProblemsManager, PendingProblems, FindProblems
│   │   ├── Analytics/   # CFAnalytics
│   │   └── Layout/      # SidebarLayout
│   ├── context/         # AuthContext (JWT state)
│   ├── api/             # Axios instance
│   └── utils/           # Color helpers
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Problems
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/problems` | Get all solved problems |
| POST | `/api/problems` | Log a solved problem |
| PUT | `/api/problems/:id` | Update problem (notes, etc.) |
| DELETE | `/api/problems/:id` | Delete a problem |

### Pending Problems
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pending` | Get all pending problems |
| POST | `/api/pending` | Add a pending problem |
| DELETE | `/api/pending/:id` | Delete a pending problem |

### User & Codeforces
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile + full analytics |
| PUT | `/api/users/goal` | Update target rating & daily goal |
| PUT | `/api/users/handle` | Set Codeforces handle |
| POST | `/api/users/sync` | Sync CF submissions |
| GET | `/api/users/potd` | Get Problem of the Day |
| POST | `/api/users/check-potd` | Check if POTD is solved |
| GET | `/api/users/find-problems` | Find CF problems by filters |
| GET | `/api/users/deep-analytics` | Get deep CF analytics |

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
# Create .env with MONGO_URI, JWT_SECRET, PORT=8000
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` (frontend) and `http://localhost:8000` (backend).

---

## Design Patterns

- **Repository Pattern** — Database operations abstracted behind repository classes
- **Service Layer** — Business logic encapsulated in service classes
- **MVC** — Controllers handle HTTP, services handle logic, models define data
- **JWT Authentication** — Stateless auth with middleware protection
- **Layered Architecture** — Frontend → Controller → Service → Repository → Database

---

## Diagrams

- [Class Diagram](classDiagram.md)
- [ER Diagram](ErDiagram.md)
- [Sequence Diagram](sequenceDiagram.md)
- [Use Case Diagram](useCaseDiagram.md)
