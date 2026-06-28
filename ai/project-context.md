# Project Context

## Product

Frontend Switch OS is a preparation tracker for a senior frontend engineer targeting a job switch in roughly three months.

The product combines:

- A 12-week interview preparation roadmap.
- DSA problem tracking, seeded from Namaste DSA.
- Separate NamasteDev lesson links and LeetCode problem links where a mapping exists.
- LeetCode-backed solved verification for linked problems.
- Daily study logging.
- Progress metrics for solved questions, revision queue, minutes studied, and mock interviews.
- PostgreSQL-backed analytics that can be explored in Superset.

## User

Primary user: Rohan, a frontend engineer preparing for senior frontend interviews at larger companies.

Known constraints:

- Strong frontend foundation.
- DSA is the weaker area and needs deliberate tracking.
- The main behavioral problem is losing track, not lack of resources.
- Existing resources include GreatFrontend, devtools.tech, and Namaste DSA.

## Product Philosophy

The app should minimize friction. It should help the user restart quickly after missed days, track DSA coverage, and make progress visible.

Avoid adding heavy workflows that require too much manual entry. Prefer:

- One-click status changes.
- Simple daily logs.
- Clear revision queues.
- Dashboard metrics that answer "am I moving?" quickly.

## Current State

The app is a full-stack monorepo:

- `client/`: React + Vite frontend.
- `server/`: Express API.
- `db/`: schema and analytics views.
- `server/data/`: seed dataset.

The first seed dataset contains 243 Namaste DSA course items extracted from the authenticated course outline, excluding intro/warm-up/time-complexity/bonus sections.

175 of those items currently have curated LeetCode links. Course-only lessons intentionally have no LeetCode link and cannot be marked `Solved` through LeetCode verification.
