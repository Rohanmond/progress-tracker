# Frontend Switch OS

Full-stack prep tracker for a senior frontend job switch plan.

The primary workflow is the Weekly Plan: each week has five humane day-by-day commitments across a frontend-focused Core 100 DSA list, JavaScript coding, React LLD, frontend HLD, and revision. Each week also has an optional bonus lane for performance, accessibility, and security when the core work is complete. Access is protected by passwordless Gmail OTP login. The DSA Bank keeps the full 243-item Namaste reference set.

## Stack

- React + Vite frontend in `client/`
- Node + Express backend in `server/`
- PostgreSQL schema and analytics views in `db/`
- Namaste DSA seed data in `server/data/`
- Per-user LeetCode solved verification after first login
- Weekly milestone progress for the 16-week interview plan

## AI Context

Architecture, PRD, API contract, deployment notes, and AI working context live in [`ai/`](./ai/README.md).

## Quality Gates

```sh
npm run lint:commits
npm run check:docs
npm run check
npm run build
```

GitHub Actions runs the same guardrails on pushes and pull requests.

## Local Setup

```sh
npm install
cp server/.env.example server/.env
npm run seed
npm run dev:api
npm run dev
```

Set `VITE_API_URL=http://localhost:8080/api` for local frontend API calls.

After first login, the app asks for your LeetCode username and uses it to verify linked DSA items before they can be marked `Solved`.

Set `AUTH_SECRET` for signed OTP/session hashing. Add `GMAIL_USER` and `GMAIL_APP_PASSWORD` to send OTP emails through Gmail SMTP. `RESEND_API_KEY` remains available as a fallback provider; without either provider, local development prints OTPs in the API console.

## Deploy

- Vercel: deploy `client/`; set `VITE_API_URL` to your Render API URL plus `/api`
- Render: create Postgres, deploy `server/`, set `DATABASE_URL`
- Superset: connect to the same Postgres database and use the views in `db/views.sql`
