# Frontend Switch OS

Full-stack prep tracker for a senior frontend job switch plan.

The primary workflow is the Weekly Plan: each week has firm day-by-day commitments across a frontend-focused Core 100 DSA list, JavaScript coding, React LLD, frontend HLD, and Patterns.dev review. The DSA Bank keeps the full 243-item Namaste reference set.

## Stack

- React + Vite frontend in `client/`
- Node + Express backend in `server/`
- PostgreSQL schema and analytics views in `db/`
- Namaste DSA seed data in `server/data/`
- Optional LeetCode solved verification through `LEETCODE_USERNAME`
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

Set `LEETCODE_USERNAME` in `server/.env` to require LeetCode verification before a linked DSA item can be marked `Solved`.

## Deploy

- Vercel: deploy `client/`; set `VITE_API_URL` to your Render API URL plus `/api`
- Render: create Postgres, deploy `server/`, set `DATABASE_URL`
- Superset: connect to the same Postgres database and use the views in `db/views.sql`
