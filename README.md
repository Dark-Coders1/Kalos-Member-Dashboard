# Kalos Member Dashboard

A full-stack Next.js 15 web app for Kalos Health Platform members to track body composition trends, upload DEXA scan reports, and review progress milestones.

**Live:** [ephemeral-paprenjak-2ac3fb.netlify.app](https://ephemeral-paprenjak-2ac3fb.netlify.app)

---

## Features

- **JWT authentication** — member registration and login with bcrypt password hashing
- **DEXA scan upload** — parses PDF reports and extracts body composition metrics automatically
- **Progress dashboard** — scan history table, summary cards (body fat delta, lean mass gained), and an interactive trend chart
- **Recharts trend visualization** — weight, body fat %, lean mass, and fat mass plotted over time
- **Role-based accounts** — `member` and `coach` roles
- **Seed script** — populates 5 realistic demo members with staggered DEXA histories

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, custom CSS design system |
| Database | MongoDB via Mongoose |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| PDF parsing | `pdf-parse` |
| Charts | Recharts |
| Deployment | Netlify + `@netlify/plugin-nextjs` |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js        # POST /api/auth/login
│   │   │   └── register/route.js     # POST /api/auth/register
│   │   ├── members/me/
│   │   │   ├── route.js              # GET  /api/members/me
│   │   │   ├── scans/route.js        # GET  /api/members/me/scans
│   │   │   └── summary/route.js      # GET  /api/members/me/summary
│   │   └── scans/upload/route.js     # POST /api/scans/upload
│   ├── dashboard/page.jsx
│   ├── login/page.jsx
│   ├── about/page.jsx
│   ├── layout.jsx
│   └── globals.css
├── components/
│   ├── AppProvider.jsx   # Global auth + data state (React context)
│   ├── AppShell.jsx      # Top nav
│   ├── DashboardPage.jsx
│   ├── TrendChart.jsx    # Recharts line chart
│   ├── LoginPage.jsx
│   ├── AboutPage.jsx
│   └── NotFoundPage.jsx
└── lib/
    ├── auth.js           # JWT sign / verify / getAuthUser
    ├── db.js             # Cached Mongoose connection
    ├── pdf.js            # DEXA PDF parser
    └── models/
        ├── User.js
        └── Scan.js
scripts/
└── seed.mjs              # Populate demo data
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB)

### 1. Clone and install

```bash
git clone https://github.com/Dark-Coders1/Kalos-Member-Dashboard.git
cd Kalos-Member-Dashboard
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<random-secret-min-32-chars>
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=<gemini-model-name>
```

### 3. Seed demo data (optional)

```bash
npm run seed
```

Creates 5 member accounts and 1 coach account — all with password `kalos123`:

| Email | Scans |
|---|---|
| sarah@kalos.demo | 5 (full trend data) |
| jordan@kalos.demo | 1 |
| alex@kalos.demo | 2 |
| priya@kalos.demo | 4 |
| marcus@kalos.demo | 5 |
| coach@kalos.demo | — (coach role) |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account, returns JWT |
| `POST` | `/api/auth/login` | — | Login, returns JWT |
| `GET` | `/api/members/me` | ✅ | Member profile |
| `GET` | `/api/members/me/scans` | ✅ | All scans sorted by date |
| `GET` | `/api/members/me/summary` | ✅ | Progress summary stats |
| `POST` | `/api/scans/upload` | ✅ | Upload DEXA PDF, auto-parse metrics |

---

## Deployment

The app is deployed on Netlify with `@netlify/plugin-nextjs`. Set the following environment variables in the Netlify dashboard:

- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secret for signing tokens
- `GEMINI_API_KEY` — Gemini API key
- `GEMINI_MODEL` — Gemini model name

> **MongoDB Atlas:** make sure Network Access allows `0.0.0.0/0` so Netlify's serverless functions can reach the cluster.
