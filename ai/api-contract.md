# API Contract

Base URL:

- Local: `http://localhost:8080/api`
- Production: Railway API URL plus `/api`

## Health

### `GET /api/health`

Returns database health.

Response:

```json
{
  "ok": true,
  "databaseTime": "2026-06-29T00:00:00.000Z"
}
```

## Authentication

All tracker APIs except `GET /api/health` and `/api/auth/*` require an authenticated session cookie.

### `GET /api/auth/me`

Returns the current session user, or `null`.

```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "leetcode_username": "Rohan108"
  }
}
```

### `POST /api/auth/request-otp`

Request a 6-digit OTP for a Gmail address.

Request:

```json
{
  "email": "user@gmail.com"
}
```

Response:

```json
{
  "ok": true,
  "delivery": "email",
  "message": "OTP sent to your Gmail inbox."
}
```

When Gmail SMTP is configured, `delivery` is `gmail`. When Resend is configured, `delivery` is `email`. When no email provider is configured locally, `delivery` is `console` and the OTP is printed in the API console.

### `POST /api/auth/verify-otp`

Verify the OTP and create an HTTP-only session cookie.

Request:

```json
{
  "email": "user@gmail.com",
  "otp": "123456"
}
```

Response:

```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com"
  }
}
```

### `POST /api/auth/logout`

Deletes the server-side session and clears the cookie.

Response:

```json
{
  "ok": true
}
```

### `PATCH /api/auth/profile`

Saves profile fields required after first login.

Request:

```json
{
  "leetcodeUsername": "Rohan108"
}
```

Response:

```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "leetcode_username": "Rohan108"
  }
}
```

## Roadmap

### `GET /api/roadmap`

Returns 16-week roadmap.

Response:

```json
{
  "roadmap": [
    {
      "week": 1,
      "theme": "Baseline and DSA restart",
      "focus": "Arrays, strings, JS execution model, resume baseline"
    }
  ]
}
```

## Weekly Plan

### `GET /api/weekly-plan`

Returns the commitment-first 16-week plan. Each week contains topic metadata, five humane daily milestones, optional bonus topics, staged Easy/Medium/Hard DSA targets, progress counts, and linked Core 100 question rows for that week.

Response:

```json
{
  "weeks": [
    {
      "week": 1,
      "theme": "Arrays and hashing",
      "commitment": "8 Core 100 items...",
      "frontend": "JavaScript execution model, closures, this, and first small React widgets.",
      "total": 8,
      "solved": 0,
      "revise": 0,
      "milestone_total": 5,
      "milestone_done": 0,
      "milestone_revise": 0,
      "bonus": {
        "week": 1,
        "summary": "If the core week is done, build interview language around rendering, focus, and XSS basics.",
        "items": [
          {
            "track": "Performance",
            "title": "Core Web Vitals overview: LCP, INP, CLS and why frontend teams care",
            "source": "web.dev",
            "source_url": "https://web.dev/articles/vitals"
          }
        ]
      },
      "milestones": [
        {
          "id": "v2-w1-d2-javascript-2",
          "week": 1,
          "day_index": 2,
          "day_label": "Day 2",
          "track": "JavaScript",
          "title": "Closures only: scope, lexical environment, and two small utilities",
          "source": "GreatFrontend + devtools.tech",
          "source_url": "https://www.greatfrontend.com/questions/formats/javascript-functions",
          "links": [
            {
              "label": "GreatFrontend JS",
              "url": "https://www.greatfrontend.com/questions/formats/javascript-functions"
            },
            {
              "label": "devtools JavaScript",
              "url": "https://devtools.tech/questions/all?language=javascript"
            },
            {
              "label": "LearnersBucket: Memoize",
              "url": "https://alpha.learnersbucket.com/course-item?item-id=68c2a99bfd9a9ff800fbe756"
            }
          ],
          "estimated_minutes": 60,
          "difficulty": "Medium",
          "status": "Todo"
        }
      ],
      "levels": [
        {
          "name": "Easy",
          "target": "Second pass on basic array mutations and scanning."
        }
      ],
      "questions": [
        {
          "id": "namaste-best-time-to-buy-and-sell-stocks",
          "title": "Best Time to Buy and Sell Stocks",
          "plan_stage": "Easy",
          "is_core_100": true,
          "dsa_priority": "Core 100",
          "status": "Todo"
        }
      ]
    }
  ]
}
```

### `PATCH /api/milestones/:id/status`

Request:

```json
{
  "status": "Done",
  "notes": ""
}
```

Accepted statuses are `Todo`, `Done`, and `Revise`.

Response:

```json
{
  "milestone": {
    "id": "v2-w1-d2-javascript-2",
    "milestone_id": "v2-w1-d2-javascript-2",
    "track": "JavaScript",
    "status": "Done",
    "completed_at": "2026-06-29T00:00:00.000Z"
  }
}
```

## Questions

### `GET /api/questions`

Query parameters:

- `search`: optional text search.
- `pattern`: default `All`.
- `status`: default `All`; accepted values are `All`, `Todo`, `Solved`, `Revise`.
- `priority`: default `All`; accepted values are `All`, `Core 100`, `Supplemental`, `Course-only`.
- `sort`: default `source_order`; accepted values are `source_order`, `title`, `pattern`, `difficulty`, `status`.
- `direction`: default `asc`; accepted values are `asc`, `desc`.

Response:

```json
{
  "patterns": ["All", "Arrays", "Backtracking"],
  "questions": [
    {
      "id": "namaste-remove-duplicates",
      "title": "Remove Duplicates",
      "section": "Arrays - Easy/Medium",
      "pattern": "Arrays",
      "difficulty": "Easy",
      "duration": "45m 5s",
      "namaste_url": "https://namastedev.com/learn/namaste-dsa/remove-duplicates",
      "leetcode_slug": "remove-duplicates-from-sorted-array",
      "leetcode_url": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
      "is_core_100": false,
      "dsa_priority": "Supplemental",
      "dsa_plan": "Supplemental",
      "status": "Todo"
    }
  ]
}
```

### `PATCH /api/questions/:id/status`

Request:

```json
{
  "status": "Solved",
  "notes": ""
}
```

Response:

```json
{
  "progress": {
    "question_id": "namaste-remove-duplicates",
    "status": "Solved",
    "notes": "",
    "updated_at": "2026-06-29T00:00:00.000Z"
  }
}
```

When `status` is `Solved`, the API verifies the question against the logged-in user's saved LeetCode username. If verification fails, the API returns `409`.

Example failure:

```json
{
  "error": "LeetCode user example has no accepted submission for two-sum in the public accepted-submissions feed."
}
```

## Logs

### `GET /api/logs`

Returns latest 50 logs.

### `POST /api/logs`

Request:

```json
{
  "logDate": "2026-06-29",
  "focus": "DSA",
  "minutes": 45,
  "notes": "Solved binary search problems."
}
```

Response:

```json
{
  "log": {
    "id": 1,
    "log_date": "2026-06-29",
    "focus": "DSA",
    "minutes": 45,
    "notes": "Solved binary search problems."
  }
}
```

## Metrics

### `GET /api/metrics`

Response:

```json
{
  "total": 243,
  "solved": 0,
  "revise": 0,
  "core_total": 100,
  "core_solved": 0,
  "core_revise": 0,
  "minutes": 0,
  "sessions": 0,
  "mocks": 0,
  "milestone_total": 80,
  "milestone_done": 0,
  "milestone_revise": 0
}
```
