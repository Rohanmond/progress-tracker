# Project Context

## Product

Frontend Switch OS is a preparation tracker for a senior frontend engineer targeting a job switch in roughly four months.

The product combines:

- A 16-week interview preparation roadmap.
- A weekly commitment plan centered on a frontend Core 100 DSA list, with later repair/mock weeks.
- Five day-by-day weekly milestones across DSA, JavaScript coding, React LLD, frontend HLD, and revision/catch-up.
- DSA problem tracking, seeded from Namaste DSA, with computed `Core 100`, `Supplemental`, and `Course-only` priority labels.
- Separate NamasteDev lesson links and LeetCode problem links where a mapping exists.
- LeetCode-backed solved verification for linked problems.
- Daily study logging.
- Progress metrics for Core 100 solved questions, revision queue, minutes studied, and mock interviews.
- PostgreSQL-backed analytics that can be explored in Superset.

## User

Primary user: Rohan, a frontend engineer preparing for senior frontend interviews at larger companies.

Known constraints:

- Strong frontend foundation.
- DSA is the weaker area and needs deliberate tracking.
- The main behavioral problem is losing track, not lack of resources.
- Existing resources include GreatFrontend, devtools.tech, and Namaste DSA.
- GreatFrontend, devtools.tech, Patterns.dev, Namaste DSA, and LeetCode should appear as source-linked prep surfaces inside the plan.

## Product Philosophy

The app should minimize friction and prevent open-ended question-bank browsing. It should help the user restart quickly after missed days, track DSA coverage, and make progress visible.

Avoid adding heavy workflows that require too much manual entry. Prefer:

- One-click status changes.
- Simple daily logs.
- Clear revision queues.
- Weekly commitment cards with topic, effort target, and Easy/Medium/Hard progression.
- Daily milestone cards with track, source, effort target, and Done/Revise/Todo controls.
- A visible accordion list of weekly Core 100 problems with direct Namaste and LeetCode links.
- Optional weekly bonus cards for performance, accessibility, and security resources.
- Dashboard metrics that answer "am I moving?" quickly.

## Current State

The app is a full-stack monorepo:

- `client/`: React + Vite frontend.
- `server/`: Express API.
- `db/`: schema and analytics views.
- `server/data/`: seed dataset.

The first seed dataset contains 243 Namaste DSA course items extracted from the authenticated course outline, excluding intro/warm-up/time-complexity/bonus sections.

177 of those items currently have curated LeetCode links. Course-only lessons intentionally have no LeetCode link and cannot be marked `Solved` through LeetCode verification.

The Weekly Plan now includes 80 seed-backed milestones: 5 per week for 16 weeks. Each milestone is roughly a 60-75 minute block and includes concrete resource links where the source exposes stable URLs. Every week includes a revision/catch-up day to make the plan sustainable around work, gym, and release cycles. Each week also has optional, untracked bonus cards for performance, accessibility, and security using web.dev, MDN, OWASP, and Patterns.dev resources. Milestone progress is stored in Postgres separately from DSA question progress so non-DSA preparation can be tracked without weakening LeetCode solve verification.

The DSA plan intentionally does not use all 243 course items as the default commitment. It keeps all 243 in the DSA Bank, but the Weekly Plan uses 100 curated questions selected for frontend interviews, informed by GreatFrontend Blind 75, NeetCode 150, and the existing Namaste/LeetCode links.
