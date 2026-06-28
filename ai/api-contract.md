# API Contract

Base URL:

- Local: `http://localhost:8080/api`
- Production: Render API URL plus `/api`

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

## Roadmap

### `GET /api/roadmap`

Returns 12-week roadmap.

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

## Questions

### `GET /api/questions`

Query parameters:

- `search`: optional text search.
- `pattern`: default `All`.
- `status`: default `All`; accepted values are `All`, `Todo`, `Solved`, `Revise`.
- `limit`: default `120`, max `500`.

Response:

```json
{
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

When `status` is `Solved`, the API verifies the question against LeetCode using `LEETCODE_USERNAME`. If verification fails, the API returns `409`.

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
  "minutes": 0,
  "sessions": 0,
  "mocks": 0
}
```
