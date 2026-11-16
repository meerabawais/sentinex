# SENTINEX — PPE Safety Monitoring Dashboard

Next.js (React) frontend + Express / Prisma / PostgreSQL backend.

```
sentinex/
├── docker-compose.yml        PostgreSQL 16 for local development
├── backend/                  REST API
│   ├── prisma/schema.prisma  database schema (User, Camera, Incident, PpeCheck, Worker)
│   ├── prisma/seed.js        demo data (cameras, ~3,000 incidents, workers, users)
│   └── src/                  server.js, routes/, middleware/, lib/
└── frontend/                 Next.js 14 (App Router)
    └── src/
        ├── app/              pages: /login, /dashboard, /incidents, /workers, /metrics, /cameras
        ├── components/       Sidebar, Topbar, charts (LineChart, DonutChart, BarChart…), tables, drawer
        ├── context/          AppContext — login, data loading, filters
        ├── lib/              api client, analytics helpers, constants, demo data
        └── styles/globals.css   the single stylesheet
```

## What you need

- Node.js 18 or newer
- PostgreSQL 14+ **or** Docker (the compose file starts PostgreSQL for you)

## Run it (with the database)

**1. Start PostgreSQL**

```bash
docker compose up -d
```
Without Docker, create an empty database and user yourself and put them in `DATABASE_URL` below.

**2. Backend** (terminal 1)

```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env   — then set JWT_SECRET to any long random text
npm install                 # also runs "prisma generate"
npm run db:push             # creates the tables
npm run db:seed             # fills them with demo data
npm run dev                 # API on http://localhost:4000
```

**3. Frontend** (terminal 2)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

**4. Sign in** at http://localhost:3000

| Account | Password | Can do |
|---|---|---|
| `admin@sentinex.com` | `admin123` | everything, including resolving incidents |
| `viewer@sentinex.com` | `viewer123` | read-only (Resolve is refused with 403) |

"Scan login card" signs in the admin account through its card ID (`DEMO-CARD-001`).
**Change these passwords before showing the project to anyone else.**

## Run the frontend only (no database)

In `frontend/.env.local` set `NEXT_PUBLIC_USE_DEMO=true`, run `npm run dev`, and sign in with any email and password. The data is generated in the browser.

## API

All routes except login need `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/card` | `{ cardId }` → `{ token, user }` |
| GET | `/api/auth/me` | current user |
| GET | `/api/bootstrap` | cameras, 60 days of incidents and PPE checks, workers (what the dashboard loads) |
| GET | `/api/incidents` | filters: `from`, `to`, `camera`, `status`, `severity`, `limit` |
| PATCH | `/api/incidents/:code` | `{ status: "open" \| "reviewed" \| "resolved" }` (ADMIN / SUPERVISOR only) |
| GET | `/api/cameras`, `/api/workers` | lists |
| GET | `/api/health` | no auth |

## Connecting the AI pipeline (UC-07)

The detector only has to insert rows into `Incident` (and, for the compliance %, count its checks in `PpeCheck`). The dashboard shows them without any frontend change. Example:

```js
await prisma.incident.create({ data: {
  code: 'INC-5001', ts: new Date(), cameraId: 'CAM-02', ppe: 'helmet',
  severity: 'high', confidence: 0.91, trackId: 17, source: 'clip_3.mp4'
}});
```

## Notes

- The seed data is generated relative to the time you run it, so it ages. Run `npm run db:seed` again for fresh "last 7 days" data (it replaces the demo data; users are kept).
- `npm run db:push` is the quick way to create tables. When you start changing the schema for real, use `npm run db:migrate` to keep migration files.
- The dashboard loads 60 days of data in one request and computes the charts in the browser. That is fine for a demo; for large data move the aggregation into SQL endpoints.
- Not built yet: worker-to-incident links, real camera streams and the video analysis page (marked "Soon").
- If `npm install` in `backend/` fails while downloading the Prisma engine, you are behind a firewall or proxy that blocks `binaries.prisma.sh`.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Can't load data — Cannot reach the backend" | start the backend, or check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` |
| CORS error in the browser console | put the frontend's address in `CORS_ORIGIN` in `backend/.env` and restart the backend |
| `P1001 Can't reach database server` | PostgreSQL is not running or `DATABASE_URL` is wrong |
| Changed `.env.local` but nothing changed | restart `npm run dev` (Next.js reads it at start-up) |
