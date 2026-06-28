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
  { week: 1, theme: "Arrays foundation", focus: "Easy array problems first, then medium array patterns, plus JS execution model" },
  { week: 2, theme: "Strings and recursion", focus: "String easy wins, medium string patterns, recursion basics, browser rendering" },
  { week: 3, theme: "Linked list", focus: "Pointer basics, medium linked-list patterns, then timed linked-list revision" },
  { week: 4, theme: "Stacks, queues, and binary search", focus: "Stack/queue easy-to-medium flow, then binary search invariants" },
  { week: 5, theme: "Two pointers and sliding window", focus: "Sorted two-pointer problems, substring windows, then hard window problems" },
  { week: 6, theme: "Trees and BST", focus: "Traversals, recursive tree patterns, BST operations, accessibility revision" },
  { week: 7, theme: "Heap and backtracking", focus: "Heap operations, top-k patterns, subsets/permutations, one mock round" },
  { week: 8, theme: "Greedy and intervals", focus: "Greedy choice proofs, interval patterns, frontend system design practice" },
  { week: 9, theme: "Dynamic programming", focus: "DP easy foundations, medium recurrence patterns, hard DP exposure" },
  { week: 10, theme: "Graphs", focus: "BFS/DFS, topological sort, shortest paths, graph implementation fluency" },
  { week: 11, theme: "Advanced DSA", focus: "Tries, advanced sorting, advanced graph/DP review, weak-pattern repair" },
  { week: 12, theme: "Peak interview loop", focus: "Advanced strings, final revision queue, timed mocks, company targeting" }
];

const weeklyPlan = [
  {
    week: 1,
    theme: "Arrays foundation",
    sections: ["Arrays - Easy/Medium", "Searching & Sorting - Easy/Medium"],
    commitment: "15 DSA touches: arrays plus search/sort basics, 4 LeetCode verifications, 2 revision passes.",
    frontend: "Revise JS execution model, closures, promises, and event loop.",
    levels: [
      { name: "Easy", target: "Second pass on basic array mutations and scanning." },
      { name: "Medium", target: "Stock profit, merge, zero movement, missing/single number patterns." },
      { name: "Hard", target: "No new hard. Write clean explanations and complexity notes." }
    ]
  },
  {
    week: 2,
    theme: "Strings and recursion",
    sections: ["Strings - Easy/Medium", "Recursion - Easy/Medium"],
    commitment: "18 DSA touches: 12 solve attempts, 4 re-solves, 2 written pattern notes.",
    frontend: "Browser rendering, storage, networking, and Core Web API refresh.",
    levels: [
      { name: "Easy", target: "Last word, character frequency, palindrome, anagram." },
      { name: "Medium", target: "Group anagrams, isomorphic strings, reverse string variants." },
      { name: "Hard", target: "One timed string medium under interview narration." }
    ]
  },
  {
    week: 3,
    theme: "Linked list",
    sections: ["Linked List - Easy/Medium"],
    commitment: "20 DSA touches: 14 linked-list items, 4 re-solves, 2 dry-run sheets.",
    frontend: "React rendering, hooks, memoization, and state tradeoffs.",
    levels: [
      { name: "Easy", target: "Traversal, insert/delete, middle, reverse." },
      { name: "Medium", target: "Cycle, palindrome, nth from end, odd-even, add numbers." },
      { name: "Hard", target: "Timed linked-list medium with pointer diagram." }
    ]
  },
  {
    week: 4,
    theme: "Stacks, queues, and binary search",
    sections: ["Stack and Queues", "Binary Search Algorithm"],
    commitment: "22 DSA touches: 10 stack/queue, 9 binary search, 3 revision queue items.",
    frontend: "Accessibility, forms, keyboard navigation, semantic HTML.",
    levels: [
      { name: "Easy", target: "Valid parentheses, stack/queue implementation, sqrt." },
      { name: "Medium", target: "Min stack, RPN, temperatures, rotated search, bounds search." },
      { name: "Hard", target: "One binary-search-on-answer style prompt if time allows." }
    ]
  },
  {
    week: 5,
    theme: "Two pointers and sliding window",
    sections: ["Two Pointers & Sliding Window"],
    commitment: "16 DSA touches: all section items, 2 timed rounds, 1 mistake review.",
    frontend: "Async UX: loading, retry, cancellation, optimistic updates.",
    levels: [
      { name: "Easy", target: "Two sum variants, subsequence, first occurrence." },
      { name: "Medium", target: "Container water, 3Sum, longest substring, permutation." },
      { name: "Hard", target: "Trapping rain water and sliding window maximum." }
    ]
  },
  {
    week: 6,
    theme: "Trees and BST",
    sections: ["Binary Tree", "Binary Search Tree"],
    commitment: "24 DSA touches: traversals, tree recursion, BST operations, 2 timed mocks.",
    frontend: "Performance profiling, render cost, bundle splitting, Core Web Vitals.",
    levels: [
      { name: "Easy", target: "Traversal, max depth, same/invert/symmetric tree." },
      { name: "Medium", target: "LCA, right side view, good nodes, BST validation." },
      { name: "Hard", target: "Binary tree maximum path sum exposure." }
    ]
  },
  {
    week: 7,
    theme: "Heap and backtracking",
    sections: ["Heap / Priority Queue", "Backtracking"],
    commitment: "24 DSA touches: top-k/heap items, subsets/permutations, 1 mock interview.",
    frontend: "Senior frontend architecture: data flow, ownership boundaries, observability.",
    levels: [
      { name: "Easy", target: "Heap basics, last stone weight, subsets." },
      { name: "Medium", target: "Top K, kth largest, combinations, permutation variants." },
      { name: "Hard", target: "N Queens or word search with pruning explanation." }
    ]
  },
  {
    week: 8,
    theme: "Greedy and intervals",
    sections: ["Greedy Algorithm"],
    commitment: "18 DSA touches: 12 greedy/interval items, 3 proof notes, 3 re-solves.",
    frontend: "Frontend system design: autocomplete, feed, dashboard, or spreadsheet.",
    levels: [
      { name: "Easy", target: "Assign cookies, lemonade, stock II." },
      { name: "Medium", target: "Intervals, partition labels, task scheduler, gas station." },
      { name: "Hard", target: "Candy, one pass versus two pass tradeoffs." }
    ]
  },
  {
    week: 9,
    theme: "Dynamic programming",
    sections: ["Dynamic Programming"],
    commitment: "22 DSA touches: 6 easy DP, 10 medium DP, 4 re-solves, 2 recurrence notes.",
    frontend: "GreatFrontend JS and component sprint.",
    levels: [
      { name: "Easy", target: "Fibonacci, climbing stairs, min-cost stairs." },
      { name: "Medium", target: "House robber, coin change, decode ways, LIS, word break." },
      { name: "Hard", target: "Partition subset and maximum product reasoning." }
    ]
  },
  {
    week: 10,
    theme: "Graphs",
    sections: ["Graphs"],
    commitment: "26 DSA touches: BFS/DFS, topological sort, shortest path, 2 timed graph rounds.",
    frontend: "Devtools.tech machine coding sprint.",
    levels: [
      { name: "Easy", target: "Graph representation, BFS, DFS, path existence." },
      { name: "Medium", target: "All paths, itinerary, cycle detection, topological sort." },
      { name: "Hard", target: "Dijkstra/Bellman/Floyd and MST exposure." }
    ]
  },
  {
    week: 11,
    theme: "Advanced DSA repair",
    sections: ["Tries", "Searching & Sorting - Advanced", "DP and Arrays - Advanced"],
    commitment: "18 DSA touches: tries, sorting, jump game, egg drop exposure, weak area review.",
    frontend: "Company-specific prep, STAR stories, architecture tradeoffs.",
    levels: [
      { name: "Easy", target: "Trie operations and sorting basics." },
      { name: "Medium", target: "Quick/counting/radix sort and jump game variants." },
      { name: "Hard", target: "Stick cutting and super egg drop exposure, not mastery." }
    ]
  },
  {
    week: 12,
    theme: "Peak interview loop",
    sections: ["Strings - Advanced"],
    commitment: "14 DSA touches plus 3 mocks: advanced strings, revision queue, final timed rounds.",
    frontend: "Mock loop, resume stories, recruiter/company targeting.",
    levels: [
      { name: "Easy", target: "Reverse words, count and say." },
      { name: "Medium", target: "Decode string, reorganize string, Rabin-Karp." },
      { name: "Hard", target: "Timed mixed review from every Revise item." }
    ]
  }
];

function stageForQuestion(question, index, total) {
  if (question.difficulty === "Hard") return "Hard";
  if (question.difficulty === "Easy") return "Easy";
  if (index < Math.ceil(total * 0.4)) return "Easy";
  if (index < Math.ceil(total * 0.85)) return "Medium";
  return "Hard";
}

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

app.get("/api/weekly-plan", async (_req, res, next) => {
  try {
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
       order by q.source_order asc`
    );

    const questions = result.rows;
    const weeks = weeklyPlan.map((week) => {
      const weekQuestions = questions.filter((question) => week.sections.includes(question.section));
      const stagedQuestions = weekQuestions.map((question, index) => ({
        ...question,
        plan_stage: stageForQuestion(question, index, weekQuestions.length)
      }));

      return {
        ...week,
        total: stagedQuestions.length,
        solved: stagedQuestions.filter((question) => question.status === "Solved").length,
        revise: stagedQuestions.filter((question) => question.status === "Revise").length,
        questions: stagedQuestions
      };
    });

    res.json({ weeks });
  } catch (error) {
    next(error);
  }
});

app.get("/api/questions", async (req, res, next) => {
  try {
    const { search = "", pattern = "All", status = "All", limit = "500" } = req.query;
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
