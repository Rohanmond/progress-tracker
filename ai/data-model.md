# Data Model

## Tables

### `app_users`

Passwordless login identities.

Columns:

- `id`: generated primary key.
- `email`: unique Gmail address.
- `created_at`: first-seen timestamp.
- `last_login_at`: latest successful OTP login.

### `email_otps`

Short-lived login codes.

Columns:

- `id`: generated primary key.
- `email`: requested Gmail address.
- `otp_hash`: hashed OTP value; raw OTPs are never stored.
- `attempts`: failed verification attempts.
- `expires_at`: OTP expiry timestamp.
- `consumed_at`: set after successful verification.
- `created_at`: request timestamp.

### `auth_sessions`

Server-side sessions for HTTP-only cookies.

Columns:

- `id`: generated primary key.
- `user_id`: references `app_users(id)`.
- `token_hash`: hashed session token; raw token lives only in the cookie.
- `expires_at`: session expiry timestamp.
- `created_at`, `last_seen_at`: timestamps.

### `questions`

Seeded catalog of DSA items.

Columns:

- `id`: stable text primary key, e.g. `namaste-remove-duplicates`.
- `source`: currently `Namaste DSA`.
- `source_order`: ordering from the course outline.
- `title`: problem or lesson title.
- `section`: course section, e.g. `Arrays - Easy/Medium`.
- `pattern`: normalized practice pattern, e.g. `Arrays`, `Graphs`.
- `difficulty`: `Easy`, `Medium`, or `Hard`.
- `duration`: course video duration when available.
- `url`: legacy Namaste DSA lesson URL.
- `namaste_url`: NamasteDev lesson URL.
- `leetcode_slug`: LeetCode problem title slug when mapped.
- `leetcode_url`: LeetCode problem URL when mapped.
- `description`: short description from public or derived source.
- `created_at`, `updated_at`: timestamps.

### `question_progress`

One row per tracked question.

Columns:

- `question_id`: references `questions(id)`.
- `status`: `Todo`, `Solved`, or `Revise`.
- `notes`: optional notes.
- `leetcode_verified_at`: timestamp when `Solved` was verified against LeetCode.
- `leetcode_verification_note`: verification detail, including the LeetCode username used.
- `updated_at`: timestamp of latest status update.

### `study_logs`

Daily preparation entries.

Columns:

- `id`: generated primary key.
- `log_date`: study date.
- `focus`: `DSA`, `Frontend`, `System Design`, `Mock`, or `Career`.
- `minutes`: positive integer.
- `notes`: free text.
- `created_at`: timestamp.

### `milestone_progress`

One row per weekly interview-plan milestone that the user has touched.

Columns:

- `milestone_id`: stable text key generated from week, day, track, and sort order.
- `status`: `Todo`, `Done`, or `Revise`.
- `notes`: optional notes.
- `completed_at`: timestamp set while the milestone is `Done`.
- `updated_at`: timestamp of latest status update.

## Seed Data

Path: `server/data/namaste-dsa-questions.json`

Current count: 243 items.

The seed script is idempotent. Running `npm run seed` upserts questions, creates tables, and recreates analytics views.

Run `npm run enrich:leetcode` after editing the Namaste seed if new titles need LeetCode mappings. The current curated mapping links 177 items.

The frontend Core 100 is not a separate table. It is a backend curation layer in `server/src/index.js` that references stable `questions.id` values and adds computed API fields:

- `is_core_100`
- `dsa_priority`: `Core 100`, `Supplemental`, or `Course-only`.
- `dsa_plan`: `Frontend Core 100` for curated items, otherwise the priority label.

## Superset Views

### `superset_question_progress`

Flat joined dataset of question catalog plus progress status.

Use for:

- Detailed tables.
- Revision queue.
- Problem-level filtering.

### `superset_pattern_summary`

Aggregated progress by DSA pattern.

Use for:

- Bar chart by solved percentage.
- Weak pattern identification.

### `superset_daily_study`

Aggregated study logs by date and focus.

Use for:

- Study minutes over time.
- Focus distribution.

## Weekly Planning

Weekly planning is currently a backend-defined product layer in `server/src/index.js`, not a database table.

Each week maps to curated Core 100 question IDs and returns:

- Weekly commitment.
- Frontend focus.
- Easy/Medium/Hard progression notes.
- Five day-by-day milestones for `DSA`, `JavaScript`, `React LLD`, `Frontend HLD`, and `Revision`.
- Optional weekly bonus topics for `Performance`, `Accessibility`, and `Security`.
- Source labels and concrete resource links for Namaste DSA, LeetCode, GreatFrontend, devtools.tech, and Patterns.dev.
- Question rows from the mapped Core 100 IDs.
- Progress counts from `question_progress`.
- Milestone progress counts from `milestone_progress`.

If weekly planning itself becomes user-editable, promote the milestone seed layer into database tables.
