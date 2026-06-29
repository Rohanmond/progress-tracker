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
npm run lint:commits
npm run check:docs
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
3. Run `npm run enrich:leetcode` if the resource maps to LeetCode.
4. Add or adjust schema only if needed.
5. Update client filters and labels.
6. Update `ai/data-model.md` and `ai/prd.md`.

### Adding a new metric

1. Add SQL in `/api/metrics` or a Superset view.
2. Render it in `client/src/App.jsx`.
3. Document it in `ai/api-contract.md`.

### Changing the weekly plan

1. Update `weeklyPlan`, `interviewTopics`, and `roadmap` in `server/src/index.js`.
2. Confirm `/api/weekly-plan` still maps real seeded Core 100 question IDs and returns 5 milestones per week.
3. Keep `bonusTopics` optional and untracked unless the product requirement explicitly changes.
4. Update `ai/prd.md`, `ai/api-contract.md`, and `ai/architecture.md`.
5. Keep the weekly plan commitment-first; do not make the full 243-item question bank the primary flow.

### Adding auth

Auth exists as a passwordless Gmail OTP access gate. When changing it, update:

- Database schema for users.
- API routes for OTP request, OTP verification, sessions, and logout.
- Client auth flow.
- Deployment environment variables.
- All `ai/` context docs.

Do not add password storage. Tracker progress is not yet partitioned by user.

## Current Known Limitations

- Single-user data model.
- No authentication.
- No migrations framework.
- No automated tests beyond syntax/build checks.
- Seed runs at Render startup in current config.

## Commit And Documentation Guardrails

Commit messages are validated with Conventional Commits through Commitlint.

Examples:

- `feat: add weekly goal tracking`
- `fix: correct question status update`
- `docs: update deployment notes`
- `chore: add CI doc checks`

CI runs `npm run check:docs`. When feature-sensitive files change, update the matching docs in the same PR:

- Client behavior: `ai/prd.md`, `ai/architecture.md`, or `ai/project-context.md`.
- API behavior: `ai/api-contract.md` or `ai/architecture.md`.
- Database/seed behavior: `ai/data-model.md`, `ai/architecture.md`, or `docs/superset.md`.
- Deployment/config behavior: `ai/deployment.md`, `README.md`, or `ai/ai-working-guide.md`.
