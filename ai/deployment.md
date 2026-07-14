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
3. Open the connection string panel.
4. Use the Supabase pooler connection string for Railway, not the direct database connection string.
5. Replace the password placeholder with the database password.
6. Use that value as Railway `DATABASE_URL`.

The Supabase pooler is the safer choice for hosted runtimes and avoids relying on direct IPv6 database connectivity. Prefer a connection string whose host contains `pooler.supabase.com`, for example:

```txt
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

If your database password contains special characters such as `@`, `#`, `/`, `?`, or `:`, URL-encode the password before putting it in `DATABASE_URL`.

Required Railway database settings:

- `DATABASE_URL`: Supabase Postgres connection string.
- `DATABASE_SSL=true`.

### Railway

Use the root-level `railway.json` configuration.

Create one Railway service for the Express API:

- GitHub repository: `Rohanmond/progress-tracker`.
- Root directory: leave blank (repository root).
- Config file path: `/railway.json` when Railway does not detect it automatically.
- Builder: Railpack.
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
- `NODE_ENV=production`.

The checked-in Railway commands are:

```sh
# Pre-deploy
npm run seed --workspace server

# Start
npm start --workspace server
```

Railpack handles npm workspace dependency installation during its build phase. Do not add a second `npm ci` build command because it can conflict with Railpack's cached dependency layer. The seed is idempotent and runs before traffic is switched to the new deployment. The service health check is `/api/health`, and Railway supplies `PORT` automatically.

After the first successful deployment:

1. Open Railway service Settings -> Networking.
2. Generate a public domain.
3. Confirm `https://<railway-domain>/api/health` returns `{"ok":true,...}`.
4. Update Vercel `VITE_API_URL` to `https://<railway-domain>/api` and redeploy the frontend.
5. Set Railway `CLIENT_ORIGIN` to the exact Vercel origin.
6. Test OTP login, logout, LeetCode profile loading, and one progress update.
7. Only after those checks pass, disable the Render service to avoid two active backends and duplicate cost.

### Vercel

Deploy the frontend from this GitHub repo.

Important settings:

- Framework: Vite
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Environment variable: `VITE_API_URL=https://<railway-api-host>/api`

After Vercel deploys, copy the Vercel app origin and set Railway `CLIENT_ORIGIN` to that exact origin, for example:

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
- Production auth cookies require HTTPS and are sent cross-site from Vercel to Railway with `SameSite=None; Secure`.
- Without `GMAIL_USER`/`GMAIL_APP_PASSWORD` or `RESEND_API_KEY`, OTPs are printed in API logs, which is acceptable only for local development.
- Supabase Postgres requires SSL from Railway; keep `DATABASE_SSL=true`.
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
