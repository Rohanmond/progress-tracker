# Frontend Switch OS

Full-stack prep tracker for a senior frontend job switch plan.

## Stack

- React + Vite frontend in `client/`
- Node + Express backend in `server/`
- PostgreSQL schema and analytics views in `db/`
- Namaste DSA seed data in `server/data/`

## AI Context

Architecture, PRD, API contract, deployment notes, and AI working context live in [`ai/`](./ai/README.md).

## Local Setup

```sh
npm install
cp server/.env.example server/.env
npm run seed
npm run dev:api
npm run dev
```

Set `VITE_API_URL=http://localhost:8080/api` for local frontend API calls.

## Deploy

- Vercel: deploy `client/`; set `VITE_API_URL` to your Render API URL plus `/api`
- Render: create Postgres, deploy `server/`, set `DATABASE_URL`
- Superset: connect to the same Postgres database and use the views in `db/views.sql`
