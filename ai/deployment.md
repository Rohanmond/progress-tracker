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

### Supabase

Use Supabase for the production PostgreSQL database.

Steps:

1. Create a Supabase project.
2. Go to Project Settings -> Database.
3. Copy the Postgres connection string.
4. Use the pooled connection string for Render if possible.
5. Replace the password placeholder with the database password.
6. Use that value as Render `DATABASE_URL`.

Required Render database settings:

- `DATABASE_URL`: Supabase Postgres connection string.
- `DATABASE_SSL=true`.

### Render

Use `render.yaml`.

Render services:

- Web service: Express API.
- Database: external Supabase PostgreSQL.

Required environment variables:

- `DATABASE_URL`: Supabase PostgreSQL connection string.
- `CLIENT_ORIGIN`: Vercel frontend origin.
- `AUTH_SECRET`: long random secret used for OTP/session hashing.
- `AUTH_COOKIE_NAME`: optional session cookie name; defaults to `switch_os_session`.
- `GMAIL_USER`: Gmail account used to send OTP emails.
- `GMAIL_APP_PASSWORD`: Google App Password for Gmail SMTP.
- `RESEND_API_KEY`: optional fallback provider for production OTP email delivery.
- `AUTH_EMAIL_FROM`: optional sender label/address for OTP email delivery.
- `DATABASE_SSL=true`.

Current Render start command runs:

```sh
npm run seed --workspace server && npm start --workspace server
```

This is convenient for early deployment because schema and seed are applied at startup. For production hardening, move migrations/seeding into a release phase or manual job.

### Vercel

Deploy the frontend from this GitHub repo.

Important settings:

- Framework: Vite
- Build command: `cd client && npm install && npm run build`
- Output directory: `client/dist`
- Environment variable: `VITE_API_URL=https://<render-api-host>/api`

After Vercel deploys, copy the Vercel app origin and set Render `CLIENT_ORIGIN` to that exact origin, for example:

```txt
https://frontend-switch-os.vercel.app
```

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
- Without `GMAIL_USER`/`GMAIL_APP_PASSWORD` or `RESEND_API_KEY`, OTPs are printed in API logs, which is acceptable only for local development.
- Render Postgres may require SSL; set `DATABASE_SSL=true` if connection fails in production.
- The app is still single-progress-track; auth gates access but does not yet split tracker data per user.
- LeetCode solved verification uses the username collected after first login; it does not store LeetCode credentials.

## CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`.

The workflow runs on pushes to `main` and pull requests:

1. `npm ci`
2. `npm run lint:commits`
3. `npm run check:docs`
4. `npm run check`
5. `npm run build`

The docs check enforces that feature-sensitive changes include relevant documentation updates in `ai/`, `docs/`, or `README.md`.
