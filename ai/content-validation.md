# Content Validation

Last validated: June 29, 2026.

## Validated Prep Sources

### GreatFrontend

URL: `https://www.greatfrontend.com/questions`

Validated surface:

- 500+ frontend interview questions.
- Coding, system design, quiz, JavaScript functions, and UI coding filters.
- Company filter is visible in the UI, but company-specific URLs were not exposed as direct links during validation.
- Useful stable links:
  - `https://www.greatfrontend.com/questions`
  - `https://www.greatfrontend.com/interviews/gfe75`
  - `https://www.greatfrontend.com/questions/formats/javascript-functions`
  - `https://www.greatfrontend.com/questions/formats/ui-coding`
  - `https://www.greatfrontend.com/questions/system-design`

### devtools.tech

URL: `https://devtools.tech/questions/all`

Validated surface:

- JavaScript, React, HTML/CSS/JS, programming, UI-based, and quiz filters.
- Company guides and company questions entry points.
- Visible company-specific lists for Intuit, Blinkit, MakeMyTrip, and Zeta.
- Visible company-focused videos for Paytm/Uber, Meta, Uber, and Atlassian.
- Useful stable links:
  - `https://devtools.tech/questions/all`
  - `https://devtools.tech/questions/all?language=javascript`
  - `https://devtools.tech/questions/all?language=react`
  - `https://devtools.tech/dashboard/time-savers/company-questions`
  - `https://devtools.tech/dashboard/guides/company`
  - `https://devtools.tech/dashboard/fsd/guide`

### LearnersBucket

URL: `https://alpha.learnersbucket.com/course/frontend-system-design/start`

Validated surface:

- Large JavaScript and frontend-system-design-adjacent course outline.
- Useful topics include pub/sub, analytics SDK, async engine, promise utilities, debounce, throttle, memoize, currying, router middleware, cached API, React race conditions, and performance checks.
- Course item links are stable `course-item?item-id=...` URLs.

### Namaste Frontend System Design

URL: `https://namastedev.com/learn/namaste-frontend-system-design`

Validated surface:

- Course modules and lesson links are visible from the course landing page.
- Modules include networking, communication, security, testing, performance, database and caching, logging and monitoring, accessibility, offline support, LLD, HLD, system design, and interview questions.
- Lesson links include XSS, CORS, CSRF, security headers, performance overview, rendering patterns, API caching, WebSockets, accessibility, and more.

## Curation Rules

- Prefer direct problem/list URLs when the site exposes them.
- Use GreatFrontend and devtools as primary frontend interview banks.
- Use LearnersBucket for JS machine-coding and advanced async/browser tasks.
- Use Namaste FSD for frontend system design concepts and security/performance/accessibility modules.
- Use LeetCode company pages for company-tagged DSA when available.
- Avoid inventing private or guessed lesson URLs; use searchable or generic entry points when direct links are not exposed.
