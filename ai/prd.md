# Product Requirements Document

## Product Name

Frontend Switch OS

## Objective

Help a senior frontend engineer stay on track for a job switch within four months by combining DSA tracking, frontend interview preparation, daily study logs, and analytics.

## Problem

The user has access to strong preparation resources but loses track over time. DSA is the main weak area, and interview preparation requires repeated practice, revision, and visibility into progress.

## Goals

- Make DSA progress visible and easy to update.
- Provide a structured 16-week preparation plan with firm weekly and daily commitments.
- Prevent question-bank overwhelm by making a frontend-focused Core 100 the primary weekly DSA workflow.
- Track frontend interview milestones alongside DSA so GreatFrontend, devtools.tech, and Patterns.dev work does not drift.
- Capture daily study effort with minimal friction.
- Highlight revision items so weak problems are not forgotten.
- Support analytics through Superset for deeper progress review.
- Make the app deployable using Vercel, Render, and PostgreSQL.
- Protect the tracker with passwordless Gmail OTP login and logout.

## Non-Goals

- Full learning platform with video playback.
- Replacing GreatFrontend, devtools.tech, or Namaste DSA.
- Multi-user collaboration in the initial version.
- Calendar scheduling or notification automation in the initial version.
- Password-based authentication.

## Primary User Stories

1. As a candidate, I can start from a weekly plan instead of a raw question bank.
2. As a candidate, I can see each week's topic, commitment, frontend focus, daily milestones, and Easy/Medium/Hard progression.
3. As a candidate, I can open an accordion list of weekly Core 100 questions directly from the plan.
4. As a candidate, I can view all Namaste DSA problems in one searchable list when I need reference mode.
5. As a candidate, I can open both the NamasteDev lesson and the LeetCode problem when both links exist.
6. As a candidate, I can mark a problem as `Solved` only when LeetCode verification confirms an accepted submission.
7. As a candidate, I can mark a problem as `Revise` or `Todo` manually.
8. As a candidate, I can filter problems by pattern and status.
9. As a candidate, I can log what I studied today and how many minutes I spent.
10. As a candidate, I can see dashboard metrics for solved count, revision count, study minutes, and mocks.
11. As a candidate, I can review a 16-week preparation roadmap.
12. As a candidate, I can connect Superset to analyze progress by pattern and day.
13. As a candidate, I can mark weekly JavaScript, React LLD, frontend HLD, and Patterns.dev milestones as `Done`, `Revise`, or `Todo`.
14. As a candidate, I can filter the DSA Bank by `Core 100`, `Supplemental`, or `Course-only`.
15. As a candidate, I can follow a humane 5-day weekly cadence with a built-in revision/catch-up day.
16. As a candidate, I can see optional weekly bonus topics for performance, accessibility, and security after the core plan is complete.
17. As a candidate, I can switch between light and dark mode, with my preference remembered on the same browser.
18. As a candidate, I can log in with a Gmail OTP and log out without managing a password.
19. As a candidate, I can add my LeetCode username after first login so solved verification uses my own account.
20. As a candidate, I can update my LeetCode username later if I entered it incorrectly or changed accounts.

## Success Metrics

- The user logs at least 4 study sessions per week.
- The user solves or revises 4-6 DSA items per week, with stretch capacity for lighter weeks.
- The revision queue is reviewed weekly.
- Study minutes and solved questions trend upward over time.
- The user can identify weak DSA patterns from Superset or the dashboard.

## Functional Requirements

### Authentication

- The app requires authentication before showing tracker data.
- Login accepts Gmail addresses only.
- The backend generates a 6-digit OTP that expires after 10 minutes.
- OTP verification creates an HTTP-only session cookie.
- Logout clears the session cookie and deletes the server-side session.
- Production OTP delivery can use Gmail SMTP through `GMAIL_USER` and `GMAIL_APP_PASSWORD`, or Resend through `RESEND_API_KEY`.
- Local development may print OTP codes in the API console when no email provider is configured.
- Passwords are not collected or stored.
- After first login, the user must add a LeetCode username before entering the tracker.
- Logged-in users can edit their saved LeetCode username from the app chrome.

### Weekly Plan

- The Weekly Plan is the default first screen.
- Each week has a topic theme, DSA commitment, frontend commitment, and Easy/Medium/Hard progression.
- Weekly DSA questions come from a curated frontend Core 100 inspired by GreatFrontend Blind 75, NeetCode 150, and the local Namaste/LeetCode mappings.
- Each week has five study-day milestones for `DSA`, `JavaScript`, `React LLD`, `Frontend HLD`, and `Revision`.
- Milestones are approximately 60-75 minute study blocks and include source labels plus concrete links for Namaste DSA, LeetCode, GreatFrontend, devtools.tech, and Patterns.dev.
- Each week has an optional bonus section with one small performance topic, one accessibility topic, and one security topic, using stable resources from web.dev, MDN, OWASP, and Patterns.dev.
- Bonus work is not counted in required weekly milestone totals; it is a stretch lane for lighter weeks and should stay skippable during release-heavy weeks.
- Milestone progress uses `Todo`, `Done`, and `Revise`; this is separate from LeetCode-verified DSA question `Solved`.
- Weekly Core 100 questions are shown as an accordion grouped by Easy/Medium/Hard, with direct Namaste and LeetCode links for each question.
- Friday-style revision/catch-up work is built into every week to reduce burnout and protect retention.
- Weeks 14-16 are repair/mock/final-review weeks and may have no new DSA questions.
- Questions should be staged to avoid jumping directly into hard problems.
- The full DSA Bank remains available as a reference and search surface.

### User Interface

- The app supports light and dark themes.
- The first visit respects the browser color-scheme preference.
- Manual theme selection is persisted in browser local storage.
- Theme changes must preserve readable contrast for cards, forms, chips, links, and action buttons.

### DSA Bank

- Show seeded Namaste DSA items.
- Load the full question set by default.
- Show title, section, pattern, difficulty, duration, NamasteDev link, and LeetCode link where available.
- Filter by search text, pattern, and status.
- Filter by priority: `Core 100`, `Supplemental`, or `Course-only`.
- Update `Revise` and `Todo` through one-click actions.
- Update `Solved` only after backend LeetCode verification passes.
- LeetCode verification uses the logged-in user's saved LeetCode username.
- Persist progress in PostgreSQL.

### Daily Log

- Add entries with date, focus, minutes, and notes.
- Show recent logs.
- Count mock interviews from logs where focus is `Mock`.

### Dashboard

- Show solved questions versus total questions.
- Show Core 100 solved count and Core 100 revision count.
- Show total study minutes and sessions.
- Show mock interview count.
- Show weekly milestone completion count.
- Show recent study logs.
- Show top revision items.

### Roadmap

- Show 16 weekly phases.
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
