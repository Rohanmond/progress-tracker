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

const coreDsaWeeks = [
  {
    week: 1,
    theme: "Arrays and hashing",
    questionIds: [
      "namaste-best-time-to-buy-and-sell-stocks",
      "namaste-move-zeros",
      "namaste-missing-number",
      "namaste-maximum-subarray-kadanes-algorithm",
      "namaste-maximum-product-subarray-approach-1",
      "namaste-top-k-frequent-elements",
      "namaste-valid-anagram",
      "namaste-group-anagrams-approach-1-sorted-key"
    ],
    commitment: "8 Core 100 items: scanning, hashing, frequency maps, and subarray patterns.",
    frontend: "JavaScript execution model, closures, this, and first small React widgets.",
    levels: [
      { name: "Easy", target: "Warm up with stock profit, move zeros, and missing number." },
      { name: "Medium", target: "Kadane, product subarray, top-k, anagram grouping." },
      { name: "Hard", target: "No hard. Write invariant and complexity notes." }
    ]
  },
  {
    week: 2,
    theme: "Two pointers",
    questionIds: [
      "namaste-two-sum",
      "namaste-two-sum-ii-input-array-is-sorted",
      "namaste-is-subsequence",
      "namaste-find-index-of-first-occurrence-in-string",
      "namaste-valid-palindrome-approach-1-extra-space",
      "namaste-container-with-most-water",
      "namaste-three-sum"
    ],
    commitment: "7 Core 100 items: pointer movement, sorted arrays, and string scan decisions.",
    frontend: "Promises, async/await, debounce/throttle, and form/search UI basics.",
    levels: [
      { name: "Easy", target: "Two sum variants, subsequence, palindrome, first occurrence." },
      { name: "Medium", target: "Container water and 3Sum with duplicate handling." },
      { name: "Hard", target: "No hard. Focus on why each pointer moves." }
    ]
  },
  {
    week: 3,
    theme: "Sliding window and strings",
    questionIds: [
      "namaste-trapping-rain-water",
      "namaste-longest-substring-without-repeating-characters",
      "namaste-longest-repeating-character-replacement",
      "namaste-permutation-in-string",
      "namaste-sliding-window-maximum",
      "namaste-longest-common-prefix",
      "namaste-isomorphic-strings"
    ],
    commitment: "7 Core 100 items: fixed/variable windows, string maps, and monotonic queue exposure.",
    frontend: "Prototypes, array/object utilities, and CRUD list UI.",
    levels: [
      { name: "Easy", target: "Prefix/isomorphic string checks and window templates." },
      { name: "Medium", target: "Longest substring, character replacement, permutation in string." },
      { name: "Hard", target: "Sliding window maximum and rain water as stretch reviews." }
    ]
  },
  {
    week: 4,
    theme: "Stack and queue",
    questionIds: [
      "namaste-valid-parentheses",
      "namaste-min-stack",
      "namaste-evaluate-reverse-polish-notation",
      "namaste-next-greater-element",
      "namaste-daily-temperatures",
      "namaste-next-greater-element-ii",
      "namaste-rotting-oranges"
    ],
    commitment: "7 Core 100 items: stack state, monotonic stack, and BFS queue modeling.",
    frontend: "Timers, event delegation, accessibility, and modal/dropdown interactions.",
    levels: [
      { name: "Easy", target: "Valid parentheses and stack mechanics." },
      { name: "Medium", target: "Min stack, RPN, next greater, daily temperatures." },
      { name: "Hard", target: "Rotting oranges as grid BFS practice." }
    ]
  },
  {
    week: 5,
    theme: "Binary search",
    questionIds: [
      "namaste-square-root-of-x",
      "namaste-search-in-rotated-sorted-array",
      "namaste-find-peak-element",
      "namaste-find-minimum-in-rotated-sorted-array",
      "namaste-find-first-last-position-in-sorted-array",
      "namaste-single-element-in-a-sorted-array",
      "namaste-find-k-closest-elements"
    ],
    commitment: "7 Core 100 items: lower/upper bounds, rotated arrays, and search invariants.",
    frontend: "Deep clone, curry, memoize, and async data table UI.",
    levels: [
      { name: "Easy", target: "Sqrt and basic boundary decisions." },
      { name: "Medium", target: "Rotated search, first/last position, peak, k closest." },
      { name: "Hard", target: "No hard. Explain termination conditions aloud." }
    ]
  },
  {
    week: 6,
    theme: "Linked list",
    questionIds: [
      "namaste-middle-of-linked-list",
      "namaste-reverse-linked-list",
      "namaste-linked-list-cycle-hash-table",
      "namaste-intersection-of-two-linked-lists",
      "namaste-remove-nth-node-from-end-of-list-two-pass",
      "namaste-merge-two-sorted-lists",
      "namaste-rotate-list",
      "namaste-swap-nodes-in-pairs-iterative-approach",
      "namaste-add-two-numbers"
    ],
    commitment: "9 Core 100 items: draw pointers first, then code cleanly.",
    frontend: "Promise utilities and tree/file explorer UI.",
    levels: [
      { name: "Easy", target: "Middle, reverse, cycle, intersection, remove nth." },
      { name: "Medium", target: "Merge, rotate, swap pairs, add numbers." },
      { name: "Hard", target: "No hard. Use diagrams for every miss." }
    ]
  },
  {
    week: 7,
    theme: "Trees core",
    questionIds: [
      "namaste-level-order-traversal-queue-bfs",
      "namaste-maximum-depth-of-binary-tree",
      "namaste-invert-a-binary-tree",
      "namaste-same-tree",
      "namaste-diameter-of-a-binary-tree",
      "namaste-subtree-of-another-tree",
      "namaste-lowest-common-ancestor",
      "namaste-binary-tree-right-side-view",
      "namaste-count-good-nodes-in-binary-tree"
    ],
    commitment: "9 Core 100 items: recursive return values and BFS traversal.",
    frontend: "Pub/sub, scheduler, and kanban or drag/drop UI.",
    levels: [
      { name: "Easy", target: "Max depth, invert, same tree, level order." },
      { name: "Medium", target: "Diameter, subtree, LCA, right side view, good nodes." },
      { name: "Hard", target: "No hard. Clarify return shape before code." }
    ]
  },
  {
    week: 8,
    theme: "BST and heap",
    questionIds: [
      "namaste-binary-tree-maximum-path-sum",
      "namaste-valid-binary-search-tree",
      "namaste-search-in-a-bst",
      "namaste-insert-into-a-bst",
      "namaste-kth-smallest-element",
      "namaste-lowest-common-ancestor-of-a-bst",
      "namaste-kth-largest-element-in-an-array",
      "namaste-kth-largest-element-in-a-stream",
      "namaste-last-stone-weight",
      "namaste-kth-smallest-element-in-a-sorted-matrix"
    ],
    commitment: "10 Core 100 items: BST invariants, heap operations, and one tree hard.",
    frontend: "LRU cache, rate limiter, calendar/date-range UI, and caching/offline design.",
    levels: [
      { name: "Easy", target: "BST validation/search reasoning and heap API fluency." },
      { name: "Medium", target: "Kth largest, stream kth, kth matrix, LCA BST." },
      { name: "Hard", target: "Maximum path sum with return/global distinction." }
    ]
  },
  {
    week: 9,
    theme: "Graphs and grids",
    questionIds: [
      "namaste-all-paths-from-source-to-target",
      "namaste-detect-cycle-in-undirected-connected-graph",
      "namaste-topological-sort-dfs",
      "namaste-number-of-operations-to-make-network-connected",
      "namaste-cheapest-flight-with-k-stops",
      "namaste-min-cost-to-connect-all-points"
    ],
    commitment: "6 Core 100 items: BFS/DFS, topological sort, union-find, and weighted graph exposure.",
    frontend: "Parser/string utilities and spreadsheet/grid UI.",
    levels: [
      { name: "Easy", target: "Graph representation and path/cycle dry runs." },
      { name: "Medium", target: "Topological sort, connected components, cheapest flight." },
      { name: "Hard", target: "Min cost connect points as algorithm exposure." }
    ]
  },
  {
    week: 10,
    theme: "DP foundation",
    questionIds: [
      "namaste-climbing-stairs",
      "namaste-minimum-cost-climbing-stairs",
      "namaste-house-robber",
      "namaste-house-robber-ii",
      "namaste-coin-change-top-down-recursive",
      "namaste-unique-paths"
    ],
    commitment: "6 Core 100 items: recurrence, memoization, and bottom-up translation.",
    frontend: "Graph utilities, tree/graph visualizer, and realtime collaboration design.",
    levels: [
      { name: "Easy", target: "Climbing stairs and min-cost stairs." },
      { name: "Medium", target: "House robber variants, coin change, unique paths." },
      { name: "Hard", target: "No hard. Write recurrence before code." }
    ]
  },
  {
    week: 11,
    theme: "DP strings",
    questionIds: [
      "namaste-palindromic-substrings",
      "namaste-longest-palindromic-substring",
      "namaste-decode-ways",
      "namaste-word-break",
      "namaste-longest-increasing-subsequence",
      "namaste-partition-equal-subset-sum",
      "namaste-coin-change-ii"
    ],
    commitment: "7 Core 100 items: DP over strings, choices, and subsequences.",
    frontend: "Timed mixed JS, React machine-coding mocks, and HLD mock setup.",
    levels: [
      { name: "Easy", target: "Palindromic substring counting and decode states." },
      { name: "Medium", target: "Word break, LIS, partition subset, coin change II." },
      { name: "Hard", target: "No hard. Identify state and transition verbally." }
    ]
  },
  {
    week: 12,
    theme: "Intervals and greedy",
    questionIds: [
      "namaste-insert-interval",
      "namaste-merge-intervals",
      "namaste-partition-labels",
      "namaste-non-overlapping-intervals",
      "namaste-task-scheduler",
      "namaste-gas-station",
      "namaste-jump-game-dp",
      "namaste-jump-game-ii"
    ],
    commitment: "8 Core 100 items: sort by interval, prove greedy choices, and scheduling.",
    frontend: "Timed JavaScript and React mocks with notes on misses.",
    levels: [
      { name: "Easy", target: "Merge/insert interval and partition labels." },
      { name: "Medium", target: "Non-overlap, task scheduler, gas station, jump game." },
      { name: "Hard", target: "Jump Game II stretch with greedy proof." }
    ]
  },
  {
    week: 13,
    theme: "Backtracking and trie",
    questionIds: [
      "namaste-subsets-the-power-set",
      "namaste-combinations",
      "namaste-permutations",
      "namaste-combination-sum",
      "namaste-letter-combinations-of-a-phone-number",
      "namaste-word-search",
      "namaste-n-queens",
      "namaste-trie-and-trienode-structure",
      "namaste-insert-search-prefixfind-trie-code"
    ],
    commitment: "9 Core 100 items: choose/explore/unchoose, pruning, and prefix tree basics.",
    frontend: "Performance, rendering, and frontend architecture review.",
    levels: [
      { name: "Easy", target: "Subsets, combinations, permutations, trie structure." },
      { name: "Medium", target: "Combination sum, phone letters, word search, trie code." },
      { name: "Hard", target: "N Queens as pruning and state-design exposure." }
    ]
  },
  {
    week: 14,
    theme: "Core 100 repair",
    questionIds: [],
    commitment: "No new DSA. Re-solve every Core 100 item marked Revise and write failure patterns.",
    frontend: "System design mocks: autocomplete, feed, chat, and dashboard tradeoffs.",
    levels: [
      { name: "Easy", target: "Re-solve missed easy/core confidence items." },
      { name: "Medium", target: "Re-solve missed medium items under 35 minutes." },
      { name: "Hard", target: "Only revisit hard/stretch items already attempted." }
    ]
  },
  {
    week: 15,
    theme: "Mixed DSA mocks",
    questionIds: [],
    commitment: "No new DSA. Run mixed Core 100 mocks: one array/string, one tree/graph, one DP/greedy.",
    frontend: "Full React LLD mocks and GreatFrontend HLD mocks.",
    levels: [
      { name: "Easy", target: "Fast correctness on basics without overthinking." },
      { name: "Medium", target: "Timed narration and clean code under pressure." },
      { name: "Hard", target: "Know when to state tradeoffs and simplify." }
    ]
  },
  {
    week: 16,
    theme: "Peak interview loop",
    questionIds: [],
    commitment: "No new DSA. Final Core 100 revision queue, timed mocks, and application loop.",
    frontend: "Final JS, React LLD, HLD, resume, and behavioral interview readiness.",
    levels: [
      { name: "Easy", target: "Re-solve small mistakes in one sitting." },
      { name: "Medium", target: "One mixed mock per weak pattern." },
      { name: "Hard", target: "Final timed review from every Revise item." }
    ]
  }
];

const weeklyPlan = coreDsaWeeks;
const coreDsaIds = new Set(coreDsaWeeks.flatMap((week) => week.questionIds));

const roadmap = weeklyPlan.map((week) => ({
  week: week.week,
  theme: week.theme,
  focus: `${week.commitment} ${week.frontend}`
}));

const sourceUrls = {
  namaste: "https://namastedev.com/learn/namaste-dsa/",
  leetcode: "https://leetcode.com/",
  greatfrontendBlind75: "https://www.greatfrontend.com/interviews/blind75",
  neetcode150: "https://neetcode.io/practice/practice/neetcode150",
  greatfrontendDashboard: "https://www.greatfrontend.com/interviews/dashboard",
  greatfrontendJs: "https://www.greatfrontend.com/questions/formats/javascript-functions",
  greatfrontendUi: "https://www.greatfrontend.com/questions/formats/ui-coding",
  greatfrontendHld: "https://www.greatfrontend.com/questions/formats/system-design",
  devtoolsAll: "https://devtools.tech/questions/all",
  devtoolsJs: "https://devtools.tech/questions/all?language=javascript",
  devtoolsReact: "https://devtools.tech/questions/all?language=react",
  devtoolsSystem: "https://devtools.tech/questions/all?type=3&view=basic",
  patterns: "https://www.patterns.dev/",
  patternsHooks: "https://www.patterns.dev/react/hooks-pattern/",
  patternsCompound: "https://www.patterns.dev/react/compound-pattern/",
  patternsHoc: "https://www.patterns.dev/react/hoc-pattern/",
  patternsRenderProps: "https://www.patterns.dev/react/render-props-pattern/",
  patternsProvider: "https://www.patterns.dev/react/provider-pattern/",
  patternsContainer: "https://www.patterns.dev/react/presentational-container-pattern/",
  patternsObserver: "https://www.patterns.dev/vanilla/observer-pattern/",
  patternsPrototype: "https://www.patterns.dev/vanilla/prototype-pattern/",
  patternsModule: "https://www.patterns.dev/vanilla/module-pattern/",
  patternsProxy: "https://www.patterns.dev/vanilla/proxy-pattern/",
  patternsDynamicImport: "https://www.patterns.dev/vanilla/dynamic-import/",
  patternsVirtualLists: "https://www.patterns.dev/vanilla/virtual-lists/",
  patternsBundle: "https://www.patterns.dev/vanilla/bundle-splitting/",
  patternsTreeShaking: "https://www.patterns.dev/vanilla/tree-shaking/",
  patternsPrpl: "https://www.patterns.dev/vanilla/prpl/"
};

const interviewTopics = [
  {
    week: 1,
    javascript: "Closures, this, and event loop",
    react: "Counter, tabs, and accordion",
    hld: "Browser rendering pipeline",
    patterns: "Hooks and module pattern",
    patternsLinks: [sourceUrls.patternsHooks, sourceUrls.patternsModule]
  },
  {
    week: 2,
    javascript: "Promises, async/await, debounce, and throttle",
    react: "Forms, validation, and searchable list",
    hld: "Networking, caching, and CDN basics",
    patterns: "Dynamic import and preload/prefetch basics",
    patternsLinks: [sourceUrls.patternsDynamicImport, sourceUrls.patternsBundle]
  },
  {
    week: 3,
    javascript: "Prototypes, arrays, and object utilities",
    react: "CRUD list with filter and sort",
    hld: "Autocomplete/typeahead system",
    patterns: "Prototype and observer patterns",
    patternsLinks: [sourceUrls.patternsPrototype, sourceUrls.patternsObserver]
  },
  {
    week: 4,
    javascript: "Timers and event delegation",
    react: "Modal, toast, and dropdown/menu",
    hld: "Component library or form system",
    patterns: "Compound components and render props",
    patternsLinks: [sourceUrls.patternsCompound, sourceUrls.patternsRenderProps]
  },
  {
    week: 5,
    javascript: "Deep clone, curry, and memoize",
    react: "Async data table, pagination, and infinite scroll",
    hld: "Search results/feed page",
    patterns: "Provider and container/presentational patterns",
    patternsLinks: [sourceUrls.patternsProvider, sourceUrls.patternsContainer]
  },
  {
    week: 6,
    javascript: "Promise utilities",
    react: "File tree, nested checkbox, and virtualized list",
    hld: "Comments/file explorer system",
    patterns: "Virtual lists and tree shaking",
    patternsLinks: [sourceUrls.patternsVirtualLists, sourceUrls.patternsTreeShaking]
  },
  {
    week: 7,
    javascript: "Pub/sub and scheduler",
    react: "Kanban or drag/drop board",
    hld: "Analytics dashboard",
    patterns: "Observer, proxy, and mediator review",
    patternsLinks: [sourceUrls.patternsObserver, sourceUrls.patternsProxy]
  },
  {
    week: 8,
    javascript: "LRU cache and rate limiter",
    react: "Calendar, date range picker, and polished typeahead",
    hld: "Chat or notification system",
    patterns: "PRPL and bundle splitting",
    patternsLinks: [sourceUrls.patternsPrpl, sourceUrls.patternsBundle]
  },
  {
    week: 9,
    javascript: "Parser/string utilities",
    react: "Spreadsheet/grid/editor",
    hld: "Spreadsheet/editor architecture",
    patterns: "HOC and render-props comparison",
    patternsLinks: [sourceUrls.patternsHoc, sourceUrls.patternsRenderProps]
  },
  {
    week: 10,
    javascript: "Graph traversal utilities",
    react: "Tree/graph visualizer or route planner",
    hld: "Realtime collaboration",
    patterns: "Client-side rendering and progressive hydration",
    patternsLinks: ["https://www.patterns.dev/react/client-side-rendering/", "https://www.patterns.dev/react/progressive-hydration/"]
  },
  {
    week: 11,
    javascript: "Timed mixed JavaScript problems",
    react: "Devtools.tech-style machine coding mocks",
    hld: "GreatFrontend-style HLD mocks",
    patterns: "Weak-pattern review from the revision queue",
    patternsLinks: [sourceUrls.patterns]
  },
  {
    week: 12,
    javascript: "Timed JavaScript mocks",
    react: "Full React LLD mocks",
    hld: "Full HLD mocks",
    patterns: "Mock debrief and architecture notes",
    patternsLinks: [sourceUrls.patterns]
  },
  {
    week: 13,
    javascript: "Performance-oriented JavaScript utilities",
    react: "Rendering performance and memoization lab",
    hld: "Frontend observability and Core Web Vitals",
    patterns: "Next.js vitals and React rendering patterns",
    patternsLinks: ["https://www.patterns.dev/react/nextjs-vitals/", "https://www.patterns.dev/react/server-side-rendering/"]
  },
  {
    week: 14,
    javascript: "Mixed graph/tree utilities under time",
    react: "Realtime UI state and optimistic updates",
    hld: "Autocomplete, feed, chat, and dashboard mocks",
    patterns: "Streaming SSR and React Server Components",
    patternsLinks: ["https://www.patterns.dev/react/streaming-ssr/", "https://www.patterns.dev/react/react-server-components/"]
  },
  {
    week: 15,
    javascript: "Final GreatFrontend JavaScript sprint",
    react: "Final devtools React machine-coding sprint",
    hld: "Final GreatFrontend system-design sprint",
    patterns: "Targeted weak-pattern review",
    patternsLinks: [sourceUrls.patternsHooks, sourceUrls.patternsCompound, sourceUrls.patternsVirtualLists]
  },
  {
    week: 16,
    javascript: "Final timed JavaScript mock",
    react: "Final full React LLD mock",
    hld: "Final full HLD mock and behavioral stories",
    patterns: "Final review and interview checklist",
    patternsLinks: [sourceUrls.patterns]
  }
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function createMilestone(week, dayIndex, track, title, source, sourceUrl, estimatedMinutes, difficulty, sortOrder, links = []) {
  const resourceLinks = links.length ? links : [{ label: source, url: sourceUrl }];
  return {
    id: `v2-w${week}-d${dayIndex}-${slugify(track)}-${sortOrder}`,
    week,
    day_index: dayIndex,
    day_label: `Day ${dayIndex}`,
    track,
    title,
    source,
    source_url: sourceUrl,
    links: resourceLinks,
    estimated_minutes: estimatedMinutes,
    difficulty,
    sort_order: sortOrder
  };
}

const weeklyMilestones = interviewTopics.flatMap((topic) => {
  const dsaWeek = weeklyPlan.find((week) => week.week === topic.week);
  return [
    createMilestone(
      topic.week,
      1,
      "DSA",
      `${dsaWeek.theme}: Core 100 concept pass`,
      "Frontend Core 100",
      sourceUrls.namaste,
      120,
      "Easy/Medium",
      1,
      [
        { label: "GreatFrontend Blind 75", url: sourceUrls.greatfrontendBlind75 },
        { label: "NeetCode 150 reference", url: sourceUrls.neetcode150 },
        { label: "Namaste DSA", url: sourceUrls.namaste },
        { label: "LeetCode", url: sourceUrls.leetcode }
      ]
    ),
    createMilestone(
      topic.week,
      2,
      "JavaScript",
      topic.javascript,
      "GreatFrontend + devtools.tech",
      sourceUrls.greatfrontendJs,
      120,
      "Medium",
      2,
      [
        { label: "GreatFrontend JS", url: sourceUrls.greatfrontendJs },
        { label: "devtools JavaScript", url: sourceUrls.devtoolsJs }
      ]
    ),
    createMilestone(
      topic.week,
      3,
      "DSA",
      `${dsaWeek.theme}: Core 100 verified solve updates`,
      "Frontend Core 100",
      sourceUrls.leetcode,
      120,
      "Medium",
      3,
      [
        { label: "GreatFrontend Blind 75", url: sourceUrls.greatfrontendBlind75 },
        { label: "NeetCode 150 reference", url: sourceUrls.neetcode150 },
        { label: "Namaste DSA", url: sourceUrls.namaste },
        { label: "LeetCode", url: sourceUrls.leetcode }
      ]
    ),
    createMilestone(
      topic.week,
      4,
      "React LLD",
      topic.react,
      "devtools.tech + GreatFrontend UI",
      sourceUrls.devtoolsReact,
      120,
      "Machine coding",
      4,
      [
        { label: "devtools React", url: sourceUrls.devtoolsReact },
        { label: "GreatFrontend UI", url: sourceUrls.greatfrontendUi }
      ]
    ),
    createMilestone(
      topic.week,
      5,
      "Frontend HLD",
      topic.hld,
      "GreatFrontend + devtools.tech",
      sourceUrls.greatfrontendHld,
      120,
      "System design",
      5,
      [
        { label: "GreatFrontend System Design", url: sourceUrls.greatfrontendHld },
        { label: "devtools System Design", url: sourceUrls.devtoolsSystem }
      ]
    ),
    createMilestone(
      topic.week,
      6,
      "DSA",
      `${dsaWeek.theme}: timed Core 100 practice plus mistake review`,
      "Frontend Core 100",
      sourceUrls.leetcode,
      120,
      "Timed",
      6,
      [
        { label: "GreatFrontend Blind 75", url: sourceUrls.greatfrontendBlind75 },
        { label: "NeetCode 150 reference", url: sourceUrls.neetcode150 },
        { label: "LeetCode", url: sourceUrls.leetcode },
        { label: "Namaste DSA", url: sourceUrls.namaste }
      ]
    ),
    createMilestone(
      topic.week,
      7,
      "Patterns",
      topic.patterns,
      "Patterns.dev",
      topic.patternsLinks[0] || sourceUrls.patterns,
      120,
      "Review",
      7,
      topic.patternsLinks.map((url) => ({ label: "Patterns.dev", url }))
    )
  ];
});

function stageForQuestion(question, index, total) {
  if (question.difficulty === "Hard") return "Hard";
  if (question.difficulty === "Easy") return "Easy";
  if (index < Math.ceil(total * 0.4)) return "Easy";
  if (index < Math.ceil(total * 0.85)) return "Medium";
  return "Hard";
}

function enrichQuestion(question) {
  const isCore = coreDsaIds.has(question.id);
  const priority = isCore ? "Core 100" : question.leetcode_slug ? "Supplemental" : "Course-only";
  return {
    ...question,
    is_core_100: isCore,
    dsa_priority: priority,
    dsa_plan: isCore ? "Frontend Core 100" : priority
  };
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
    const [questionResult, milestoneResult] = await Promise.all([
      query(
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
      ),
      query("select * from milestone_progress")
    ]);

    const questions = questionResult.rows.map(enrichQuestion);
    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const milestoneProgress = new Map(milestoneResult.rows.map((progress) => [progress.milestone_id, progress]));
    const weeks = weeklyPlan.map((week) => {
      const weekQuestions = week.questionIds.map((id) => questionsById.get(id)).filter(Boolean);
      const stagedQuestions = weekQuestions.map((question, index) => ({
        ...question,
        plan_stage: stageForQuestion(question, index, weekQuestions.length)
      }));
      const milestones = weeklyMilestones
        .filter((milestone) => milestone.week === week.week)
        .map((milestone) => {
          const progress = milestoneProgress.get(milestone.id);
          return {
            ...milestone,
            status: progress?.status || "Todo",
            notes: progress?.notes || "",
            completed_at: progress?.completed_at || null,
            progress_updated_at: progress?.updated_at || null
          };
        });
      const milestoneDone = milestones.filter((milestone) => milestone.status === "Done").length;
      const milestoneRevise = milestones.filter((milestone) => milestone.status === "Revise").length;

      return {
        ...week,
        total: stagedQuestions.length,
        solved: stagedQuestions.filter((question) => question.status === "Solved").length,
        revise: stagedQuestions.filter((question) => question.status === "Revise").length,
        milestone_total: milestones.length,
        milestone_done: milestoneDone,
        milestone_revise: milestoneRevise,
        milestones,
        questions: stagedQuestions
      };
    });

    res.json({ weeks });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/milestones/:id/status", async (req, res, next) => {
  try {
    const { status, notes = "" } = req.body;
    if (!["Todo", "Done", "Revise"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const milestone = weeklyMilestones.find((item) => item.id === req.params.id);
    if (!milestone) {
      res.status(404).json({ error: "Milestone not found" });
      return;
    }

    const result = await query(
      `insert into milestone_progress (milestone_id, status, notes, completed_at)
       values ($1, $2, $3, case when $2 = 'Done' then now() else null end)
       on conflict (milestone_id) do update set
         status = excluded.status,
         notes = excluded.notes,
         completed_at = case when excluded.status = 'Done' then coalesce(milestone_progress.completed_at, now()) else null end,
         updated_at = now()
       returning *`,
      [req.params.id, status, notes]
    );

    res.json({ milestone: { ...milestone, ...result.rows[0] } });
  } catch (error) {
    next(error);
  }
});

app.get("/api/questions", async (req, res, next) => {
  try {
    const { search = "", pattern = "All", status = "All", priority = "All", limit = "500" } = req.query;
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
       order by q.source_order asc`,
      values
    );
    const questions = result.rows
      .map(enrichQuestion)
      .filter((question) => priority === "All" || question.dsa_priority === priority)
      .slice(0, Math.min(Number(limit) || 500, 500));

    res.json({ questions });
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
    const [questionResult, logs, milestones] = await Promise.all([
      query(
        `select
          q.id,
          q.leetcode_slug,
          coalesce(qp.status, 'Todo') as status
         from questions q
         left join question_progress qp on qp.question_id = q.id`
      ),
      query(
        `select
          coalesce(sum(minutes), 0)::int as minutes,
          count(*)::int as sessions,
          count(*) filter (where focus = 'Mock')::int as mocks
         from study_logs`
      ),
      query("select * from milestone_progress")
    ]);
    const questions = questionResult.rows.map(enrichQuestion);
    const coreQuestions = questions.filter((question) => question.is_core_100);
    const currentMilestoneIds = new Set(weeklyMilestones.map((milestone) => milestone.id));
    const currentMilestoneProgress = milestones.rows.filter((milestone) => currentMilestoneIds.has(milestone.milestone_id));

    res.json({
      total: questions.length,
      solved: questions.filter((question) => question.status === "Solved").length,
      revise: questions.filter((question) => question.status === "Revise").length,
      core_total: coreQuestions.length,
      core_solved: coreQuestions.filter((question) => question.status === "Solved").length,
      core_revise: coreQuestions.filter((question) => question.status === "Revise").length,
      ...logs.rows[0],
      milestone_total: weeklyMilestones.length,
      milestone_done: currentMilestoneProgress.filter((milestone) => milestone.status === "Done").length,
      milestone_revise: currentMilestoneProgress.filter((milestone) => milestone.status === "Revise").length
    });
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
