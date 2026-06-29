# Deployment

## Environments

### Local

Required:

- Node.js
- npm
- PostgreSQL

Commands:

```sh
npm install
cp server/.env.example server/.env
npm run seed
npm run dev:api
npm run dev
```

Local URLs:

- Client: `http://localhost:5173`
- API: `http://localhost:8080/api`

### Vercel

Deploy the frontend from `client/`.

Important settings:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<render-api-host>/api`

The root `vercel.json` is configured for monorepo deployment with `client/dist`.

### Render

Use `render.yaml`.

Render services:

- Web service: Express API.
- Database: PostgreSQL.

Required environment variables:

- `DATABASE_URL`: provided by Render database.
- `CLIENT_ORIGIN`: Vercel frontend origin.
- `AUTH_SECRET`: long random secret used for OTP/session hashing.
- `AUTH_COOKIE_NAME`: optional session cookie name; defaults to `switch_os_session`.
- `RESEND_API_KEY`: optional but required for production OTP email delivery.
- `AUTH_EMAIL_FROM`: verified sender for OTP email delivery.
- `LEETCODE_USERNAME`: optional but required if solved status should be verified against LeetCode.
- `DATABASE_SSL=true` may be required depending on Render connection mode.

Current Render start command runs:

```sh
npm run seed --workspace server && npm start --workspace server
```

This is convenient for early deployment because schema and seed are applied at startup. For production hardening, move migrations/seeding into a release phase or manual job.

### Superset

Connect Superset to the same PostgreSQL database.

Recommended datasets:

- `superset_question_progress`
- `superset_pattern_summary`
- `superset_daily_study`

See [../docs/superset.md](../docs/superset.md).

## Deployment Risks

- API CORS must include the exact Vercel origin.
- `VITE_API_URL` must include `/api`.
- Production auth cookies require HTTPS and are sent cross-site from Vercel to Render with `SameSite=None; Secure`.
- Without `RESEND_API_KEY`, OTPs are printed in API logs, which is acceptable only for local development.
- Render Postgres may require SSL; set `DATABASE_SSL=true` if connection fails in production.
- The app is still single-progress-track; auth gates access but does not yet split tracker data per user.
- LeetCode solved verification currently uses public accepted-submission data for `LEETCODE_USERNAME`; it does not store LeetCode credentials.

## CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`.

The workflow runs on pushes to `main` and pull requests:

1. `npm ci`
2. `npm run lint:commits`
3. `npm run check:docs`
4. `npm run check`
5. `npm run build`

The docs check enforces that feature-sensitive changes include relevant documentation updates in `ai/`, `docs/`, or `README.md`.
