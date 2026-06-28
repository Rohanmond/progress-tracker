# Data Model

## Tables

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

## Seed Data

Path: `server/data/namaste-dsa-questions.json`

Current count: 243 items.

The seed script is idempotent. Running `npm run seed` upserts questions, creates tables, and recreates analytics views.

Run `npm run enrich:leetcode` after editing the Namaste seed if new titles need LeetCode mappings. The current curated mapping links 175 items.

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

Each week maps to one or more Namaste DSA `section` values and returns:

- Weekly commitment.
- Frontend focus.
- Easy/Medium/Hard progression notes.
- Question rows from the mapped sections.
- Progress counts from `question_progress`.

If weekly planning becomes user-editable, promote it into database tables.
