# Product Requirements Document

## Product Name

Frontend Switch OS

## Objective

Help a senior frontend engineer stay on track for a job switch within three months by combining DSA tracking, frontend interview preparation, daily study logs, and analytics.

## Problem

The user has access to strong preparation resources but loses track over time. DSA is the main weak area, and interview preparation requires repeated practice, revision, and visibility into progress.

## Goals

- Make DSA progress visible and easy to update.
- Provide a structured 12-week preparation roadmap.
- Capture daily study effort with minimal friction.
- Highlight revision items so weak problems are not forgotten.
- Support analytics through Superset for deeper progress review.
- Make the app deployable using Vercel, Render, and PostgreSQL.

## Non-Goals

- Full learning platform with video playback.
- Replacing GreatFrontend, devtools.tech, or Namaste DSA.
- Multi-user collaboration in the initial version.
- Calendar scheduling or notification automation in the initial version.

## Primary User Stories

1. As a candidate, I can view all Namaste DSA problems in one searchable list.
2. As a candidate, I can mark a problem as `Solved`, `Revise`, or `Todo`.
3. As a candidate, I can filter problems by pattern and status.
4. As a candidate, I can log what I studied today and how many minutes I spent.
5. As a candidate, I can see dashboard metrics for solved count, revision count, study minutes, and mocks.
6. As a candidate, I can review a 12-week preparation roadmap.
7. As a candidate, I can connect Superset to analyze progress by pattern and day.

## Success Metrics

- The user logs at least 4 study sessions per week.
- The user solves or revises at least 8 DSA items per week.
- The revision queue is reviewed weekly.
- Study minutes and solved questions trend upward over time.
- The user can identify weak DSA patterns from Superset or the dashboard.

## Functional Requirements

### DSA Bank

- Show seeded Namaste DSA items.
- Show title, section, pattern, difficulty, duration, and link.
- Filter by search text, pattern, and status.
- Update status through one-click actions.
- Persist progress in PostgreSQL.

### Daily Log

- Add entries with date, focus, minutes, and notes.
- Show recent logs.
- Count mock interviews from logs where focus is `Mock`.

### Dashboard

- Show solved questions versus total questions.
- Show revision queue count.
- Show total study minutes and sessions.
- Show mock interview count.
- Show recent study logs.
- Show top revision items.

### Roadmap

- Show 12 weekly phases.
- Each week includes theme and focus.

### Analytics

- Provide SQL views for Superset:
  - `superset_question_progress`
  - `superset_pattern_summary`
  - `superset_daily_study`

## Future Requirements

- User authentication.
- Multiple preparation tracks.
- Weekly goals and streak tracking.
- Import/export progress.
- Company-specific interview loops.
- GreatFrontend and devtools.tech practice banks.
- Automated weekly review summaries.
- Calendar reminders.

## Open Questions

- Should the product remain single-user or add auth soon?
- Should GreatFrontend and devtools.tech questions be manually curated or imported?
- Should Superset be self-hosted or used only as an optional external BI layer?
- Should revision scheduling use spaced repetition rules?
