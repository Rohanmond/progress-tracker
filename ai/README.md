# AI Context Index

This folder is the fast-start context pack for humans and AI agents working on Frontend Switch OS.

Read in this order:

1. [project-context.md](./project-context.md) - what this app is and who it serves.
2. [architecture.md](./architecture.md) - system structure, runtime boundaries, and data flow.
3. [prd.md](./prd.md) - product requirements and roadmap.
4. [data-model.md](./data-model.md) - PostgreSQL tables, seed data, analytics views.
5. [api-contract.md](./api-contract.md) - backend endpoints consumed by the React app.
6. [deployment.md](./deployment.md) - Vercel, Render, Postgres, and Superset setup.
7. [ai-working-guide.md](./ai-working-guide.md) - conventions for future AI edits.

## Current Stack

- Frontend: React 18, Vite, CSS, lucide-react.
- Backend: Node.js, Express, pg.
- Database: PostgreSQL.
- Analytics: Superset over PostgreSQL views.
- Deploy target: Vercel for `client/`, Render for `server/` and Postgres.

## Critical Paths

- React app: `client/src/App.jsx`
- API client: `client/src/lib/api.js`
- Express API: `server/src/index.js`
- Database helper: `server/src/db.js`
- Seed script: `server/src/seed.js`
- Namaste DSA seed: `server/data/namaste-dsa-questions.json`
- Schema: `db/schema.sql`
- Superset views: `db/views.sql`
