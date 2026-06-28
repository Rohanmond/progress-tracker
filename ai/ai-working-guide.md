# AI Working Guide

Use this guide when modifying the repo as an AI agent.

## First Read

Before editing, read:

- `ai/README.md`
- `ai/project-context.md`
- `ai/architecture.md`
- The files you intend to change.

## Repo Conventions

- Keep client-only code in `client/`.
- Keep API/database code in `server/`.
- Keep durable schema changes in `db/schema.sql`.
- Keep BI-facing queries in `db/views.sql`.
- Keep product/architecture context in `ai/`.
- Keep user-facing setup docs in `README.md`.

## Engineering Preferences

- Prefer simple React state and fetch calls until complexity justifies a client state library.
- Keep Express route handlers explicit and readable.
- Prefer SQL views for analytics rather than duplicating analytics logic in JavaScript.
- Preserve seed id stability in `server/data/namaste-dsa-questions.json`.
- Avoid mixing generated build output into git.

## Checks

Run before committing:

```sh
npm run check
npm run build --workspace client
```

If database behavior changes, also run against a real Postgres instance:

```sh
npm run seed
npm run dev:api
```

## Safe Change Patterns

### Adding a new tracked resource

1. Add seed data under `server/data/`.
2. Update `server/src/seed.js`.
3. Add or adjust schema only if needed.
4. Update client filters and labels.
5. Update `ai/data-model.md` and `ai/prd.md`.

### Adding a new metric

1. Add SQL in `/api/metrics` or a Superset view.
2. Render it in `client/src/App.jsx`.
3. Document it in `ai/api-contract.md`.

### Adding auth

This is a major architecture change. Update:

- Database schema for users.
- API routes to scope data by user.
- Client auth flow.
- Deployment environment variables.
- All `ai/` context docs.

## Current Known Limitations

- Single-user data model.
- No authentication.
- No migrations framework.
- No automated tests beyond syntax/build checks.
- Seed runs at Render startup in current config.
