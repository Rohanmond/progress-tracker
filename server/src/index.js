require("dotenv").config({ path: require("node:path").resolve(__dirname, "..", ".env") });

const cors = require("cors");
const express = require("express");
const { query } = require("./db");
const { verifySolved } = require("./leetcode");

const app = express();
const port = process.env.PORT || 8080;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    }
  })
);

const roadmap = [
  { week: 1, theme: "Baseline and DSA restart", focus: "Arrays, strings, JS execution model, resume baseline" },
  { week: 2, theme: "Core patterns", focus: "Two pointers, sliding window, hashing, browser rendering" },
  { week: 3, theme: "Stack, queue, recursion", focus: "Pattern recognition, React rendering, first coding mock" },
  { week: 4, theme: "Trees and binary search", focus: "Accessibility, forms, referrals, applications" },
  { week: 5, theme: "Graphs and async UI", focus: "BFS/DFS, loading/retry/optimistic UI, frontend design" },
  { week: 6, theme: "Dynamic programming basics", focus: "DP patterns, Core Web Vitals, system design mock" },
  { week: 7, theme: "Senior frontend design", focus: "Architecture, tradeoffs, STAR stories" },
  { week: 8, theme: "GreatFrontend sprint", focus: "JavaScript and component questions" },
  { week: 9, theme: "Devtools machine coding", focus: "Timed builds and architecture notes" },
  { week: 10, theme: "Interview simulation", focus: "Timed DSA, frontend coding, applications" },
  { week: 11, theme: "Company targeting", focus: "Weak pattern revision and company-specific stories" },
  { week: 12, theme: "Peak week", focus: "Revision, mocks, rest before interviews" }
];

app.get("/api/health", async (_req, res, next) => {
  try {
    const result = await query("select now() as now");
    res.json({ ok: true, databaseTime: result.rows[0].now });
  } catch (error) {
    next(error);
  }
});

app.get("/api/roadmap", (_req, res) => {
  res.json({ roadmap });
});

app.get("/api/questions", async (req, res, next) => {
  try {
    const { search = "", pattern = "All", status = "All", limit = "120" } = req.query;
    const values = [];
    const clauses = [];

    if (search) {
      values.push(`%${search}%`);
      clauses.push(`(q.title ilike $${values.length} or q.section ilike $${values.length} or q.pattern ilike $${values.length})`);
    }
    if (pattern !== "All") {
      values.push(pattern);
      clauses.push(`q.pattern = $${values.length}`);
    }
    if (status !== "All") {
      values.push(status);
      clauses.push(`coalesce(qp.status, 'Todo') = $${values.length}`);
    }

    values.push(Math.min(Number(limit) || 120, 500));
    const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
    const result = await query(
      `select
        q.*,
        coalesce(qp.status, 'Todo') as status,
        qp.notes,
        qp.leetcode_verified_at,
        qp.leetcode_verification_note,
        qp.updated_at as progress_updated_at
       from questions q
       left join question_progress qp on qp.question_id = q.id
       ${where}
       order by q.source_order asc
       limit $${values.length}`,
      values
    );

    res.json({ questions: result.rows });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/questions/:id/status", async (req, res, next) => {
  try {
    const { status, notes = "" } = req.body;
    if (!["Todo", "Solved", "Revise"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const questionResult = await query("select * from questions where id = $1", [req.params.id]);
    if (!questionResult.rowCount) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    let verifiedAt = null;
    let verificationNote = "";
    if (status === "Solved") {
      const verification = await verifySolved(questionResult.rows[0]);
      if (!verification.ok) {
        res.status(409).json({ error: verification.reason });
        return;
      }
      verifiedAt = new Date();
      verificationNote = `Verified against LeetCode user ${verification.username}.`;
    }

    const result = await query(
      `insert into question_progress (question_id, status, notes, leetcode_verified_at, leetcode_verification_note)
       values ($1, $2, $3, $4, $5)
       on conflict (question_id) do update set
         status = excluded.status,
         notes = excluded.notes,
         leetcode_verified_at = excluded.leetcode_verified_at,
         leetcode_verification_note = excluded.leetcode_verification_note,
         updated_at = now()
       returning *`,
      [req.params.id, status, notes, verifiedAt, verificationNote]
    );
    res.json({ progress: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.get("/api/logs", async (_req, res, next) => {
  try {
    const result = await query("select * from study_logs order by log_date desc, created_at desc limit 50");
    res.json({ logs: result.rows });
  } catch (error) {
    next(error);
  }
});

app.post("/api/logs", async (req, res, next) => {
  try {
    const { logDate, focus, minutes, notes } = req.body;
    const result = await query(
      `insert into study_logs (log_date, focus, minutes, notes)
       values ($1, $2, $3, $4)
       returning *`,
      [logDate, focus, Number(minutes), notes || ""]
    );
    res.status(201).json({ log: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.get("/api/metrics", async (_req, res, next) => {
  try {
    const [questions, logs] = await Promise.all([
      query(
        `select
          count(*)::int as total,
          count(*) filter (where coalesce(qp.status, 'Todo') = 'Solved')::int as solved,
          count(*) filter (where coalesce(qp.status, 'Todo') = 'Revise')::int as revise
         from questions q
         left join question_progress qp on qp.question_id = q.id`
      ),
      query(
        `select
          coalesce(sum(minutes), 0)::int as minutes,
          count(*)::int as sessions,
          count(*) filter (where focus = 'Mock')::int as mocks
         from study_logs`
      )
    ]);

    res.json({ ...questions.rows[0], ...logs.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`Frontend Switch OS API listening on ${port}`);
});
