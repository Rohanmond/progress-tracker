require("dotenv").config({ path: require("node:path").resolve(__dirname, "..", ".env") });

const cors = require("cors");
const crypto = require("node:crypto");
const express = require("express");
const nodemailer = require("nodemailer");
const { query } = require("./db");
const { verifySolved } = require("./leetcode");

const app = express();
const port = process.env.PORT || 8080;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");
const cookieName = process.env.AUTH_COOKIE_NAME || "switch_os_session";
const authSecret = process.env.AUTH_SECRET || process.env.SESSION_SECRET || "dev-switch-os-auth-secret";
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());
app.set("trust proxy", 1);
app.use(
  cors({
    credentials: true,
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
  patternsPrpl: "https://www.patterns.dev/vanilla/prpl/",
  webDevPerformance: "https://web.dev/learn/performance/",
  webDevVitals: "https://web.dev/articles/vitals",
  webDevLcp: "https://web.dev/articles/lcp",
  webDevInp: "https://web.dev/articles/inp",
  webDevCls: "https://web.dev/articles/cls",
  webDevOptimizeLcp: "https://web.dev/articles/optimize-lcp",
  webDevOptimizeInp: "https://web.dev/articles/optimize-inp",
  webDevLazyLoading: "https://web.dev/articles/browser-level-image-lazy-loading",
  webDevCodeSplitting: "https://web.dev/articles/reduce-javascript-payloads-with-code-splitting",
  webDevAccessibility: "https://web.dev/learn/accessibility/",
  webDevFocus: "https://web.dev/learn/accessibility/focus/",
  webDevAriaHtml: "https://web.dev/learn/accessibility/aria-html/",
  webDevForms: "https://web.dev/learn/accessibility/forms/",
  webDevImages: "https://web.dev/learn/accessibility/images/",
  webDevLabels: "https://web.dev/learn/accessibility/labels-and-text-alternatives/",
  mdnCsp: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
  mdnCors: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS",
  mdnSRI: "https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity",
  mdnCookieSecurity: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies",
  mdnSecureContexts: "https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts",
  owaspXss: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
  owaspClickjacking: "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html",
  owaspCsrf: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
  webDevSecurityHeaders: "https://web.dev/articles/security-headers",
  webDevSameSite: "https://web.dev/articles/samesite-cookies-explained",
  webDevFetchMetadata: "https://web.dev/articles/fetch-metadata"
};

const interviewTopics = [
  {
    week: 1,
    javascript: "Closures only: scope, lexical environment, and two small utilities",
    react: "Counter only: state, events, reset, and keyboard-safe buttons",
    hld: "Browser rendering: DOM, CSSOM, layout, paint, and one diagram",
    revision: "Review arrays/hash mistakes and re-read closure notes",
    patterns: "Hooks pattern only",
    patternsLinks: [sourceUrls.patternsHooks, sourceUrls.patternsModule]
  },
  {
    week: 2,
    javascript: "This binding only: call/apply/bind and arrow-function traps",
    react: "Tabs only: controlled state, ARIA roles, and keyboard switching",
    hld: "Networking basics: request lifecycle, HTTP cache, CDN in one flow",
    revision: "Re-solve two pointer misses and revisit Week 1 closure utility",
    patterns: "Dynamic import basics",
    patternsLinks: [sourceUrls.patternsDynamicImport, sourceUrls.patternsBundle]
  },
  {
    week: 3,
    javascript: "Event loop only: microtasks, macrotasks, and promise ordering",
    react: "Accordion only: disclosure state, animation-safe markup, ARIA",
    hld: "Autocomplete v1: requirements, API shape, debounce, cache",
    revision: "Re-solve one sliding-window miss and explain event loop aloud",
    patterns: "Observer pattern basics",
    patternsLinks: [sourceUrls.patternsPrototype, sourceUrls.patternsObserver]
  },
  {
    week: 4,
    javascript: "Debounce only: implement, test mentally, and compare throttle",
    react: "Form validation only: touched state, errors, submit disable",
    hld: "Component library v1: tokens, primitives, accessibility contract",
    revision: "Stack/queue mistake review plus debounce re-implementation",
    patterns: "Compound components only",
    patternsLinks: [sourceUrls.patternsCompound, sourceUrls.patternsRenderProps]
  },
  {
    week: 5,
    javascript: "Throttle only: leading/trailing behavior and timer cleanup",
    react: "Searchable list only: filtering, empty state, and URL-safe query",
    hld: "Search results page: filters, pagination, cache, loading states",
    revision: "Binary-search boundary review plus debounce/throttle contrast",
    patterns: "Provider pattern only",
    patternsLinks: [sourceUrls.patternsProvider, sourceUrls.patternsContainer]
  },
  {
    week: 6,
    javascript: "Promise.all only: implementation idea and failure behavior",
    react: "Async table only: loading, error, retry, and pagination",
    hld: "Comments system: entities, nesting, pagination, optimistic reply",
    revision: "Linked-list diagram replays plus Promise.all notes",
    patterns: "Virtual lists only",
    patternsLinks: [sourceUrls.patternsVirtualLists, sourceUrls.patternsTreeShaking]
  },
  {
    week: 7,
    javascript: "Deep clone only: primitives, arrays, objects, cycles as stretch",
    react: "File tree only: recursive render, expand/collapse, selection",
    hld: "Analytics dashboard: widgets, query model, refresh, permissions",
    revision: "Tree recursion review plus Week 1-3 JS flashback",
    patterns: "Tree rendering and observer recap",
    patternsLinks: [sourceUrls.patternsObserver, sourceUrls.patternsProxy]
  },
  {
    week: 8,
    javascript: "Memoize only: cache key strategy, invalidation, and limits",
    react: "Nested checkbox only: parent/child checked and indeterminate",
    hld: "Notification system: delivery, read state, realtime, fallback",
    revision: "BST/heap review plus memoize re-write from memory",
    patterns: "Bundle splitting basics",
    patternsLinks: [sourceUrls.patternsPrpl, sourceUrls.patternsBundle]
  },
  {
    week: 9,
    javascript: "Curry only: placeholders as stretch, simple curry as target",
    react: "Virtualized list only: fixed row height and scroll window",
    hld: "Spreadsheet grid v1: cells, selection, editing, undo boundary",
    revision: "Graph/BFS review plus curry from scratch",
    patterns: "Render props comparison",
    patternsLinks: [sourceUrls.patternsHoc, sourceUrls.patternsRenderProps]
  },
  {
    week: 10,
    javascript: "LRU cache only: Map-based implementation and eviction",
    react: "Typeahead polish only: keyboard nav, active option, loading",
    hld: "Realtime collaboration basics: presence, conflicts, transport",
    revision: "DP recurrence review plus LRU trace table",
    patterns: "Client-side rendering and progressive hydration",
    patternsLinks: ["https://www.patterns.dev/react/client-side-rendering/", "https://www.patterns.dev/react/progressive-hydration/"]
  },
  {
    week: 11,
    javascript: "Pub/sub only: subscribe, unsubscribe, emit, once as stretch",
    react: "Toast system only: queue, auto-dismiss, pause on hover",
    hld: "Feed system: ranking boundary, pagination, cache, media loading",
    revision: "DP string review plus pub/sub memory implementation",
    patterns: "Weak-pattern review from the revision queue",
    patternsLinks: [sourceUrls.patterns]
  },
  {
    week: 12,
    javascript: "Rate limiter only: fixed window, sliding window as stretch",
    react: "Modal only: focus trap, escape, overlay click, portal",
    hld: "Chat system: message model, realtime, delivery states, search",
    revision: "Intervals/greedy review plus rate limiter dry run",
    patterns: "Mock debrief and architecture notes",
    patternsLinks: [sourceUrls.patterns]
  },
  {
    week: 13,
    javascript: "Scheduler basics: task queue and priority as stretch",
    react: "Calendar day picker only: date state, disabled days, keyboard",
    hld: "Frontend observability: errors, vitals, logs, dashboards",
    revision: "Backtracking/trie review plus all JS utility flashcards",
    patterns: "Next.js vitals and React rendering patterns",
    patternsLinks: ["https://www.patterns.dev/react/nextjs-vitals/", "https://www.patterns.dev/react/server-side-rendering/"]
  },
  {
    week: 14,
    javascript: "JS repair: redo weakest two utilities only",
    react: "React repair: redo weakest one component only",
    hld: "Autocomplete mock: 45-minute design, 15-minute critique",
    revision: "Core 100 repair queue and frontend notes cleanup",
    patterns: "Streaming SSR and React Server Components",
    patternsLinks: ["https://www.patterns.dev/react/streaming-ssr/", "https://www.patterns.dev/react/react-server-components/"]
  },
  {
    week: 15,
    javascript: "One timed JS utility mock",
    react: "One timed React LLD mock",
    hld: "One timed HLD mock",
    revision: "Mixed DSA mock review and missed-topic repair",
    patterns: "Targeted weak-pattern review",
    patternsLinks: [sourceUrls.patternsHooks, sourceUrls.patternsCompound, sourceUrls.patternsVirtualLists]
  },
  {
    week: 16,
    javascript: "Final JS confidence pass: only revise misses",
    react: "Final React confidence pass: only revise misses",
    hld: "Final HLD confidence pass and behavioral stories",
    revision: "Final review queue, resume, applications, and rest buffer",
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
      `${dsaWeek.theme}: Core 100 question list and 2-3 focused solves`,
      "Frontend Core 100",
      sourceUrls.namaste,
      75,
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
      60,
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
      "React LLD",
      topic.react,
      "devtools.tech + GreatFrontend UI",
      sourceUrls.devtoolsReact,
      75,
      "Machine coding",
      3,
      [
        { label: "devtools React", url: sourceUrls.devtoolsReact },
        { label: "GreatFrontend UI", url: sourceUrls.greatfrontendUi }
      ]
    ),
    createMilestone(
      topic.week,
      4,
      "Frontend HLD",
      topic.hld,
      "GreatFrontend + devtools.tech",
      sourceUrls.greatfrontendHld,
      60,
      "System design",
      4,
      [
        { label: "GreatFrontend System Design", url: sourceUrls.greatfrontendHld },
        { label: "devtools System Design", url: sourceUrls.devtoolsSystem }
      ]
    ),
    createMilestone(
      topic.week,
      5,
      "Revision",
      topic.revision,
      "Core 100 + weekly notes",
      sourceUrls.leetcode,
      60,
      "Catch-up",
      5,
      [
        { label: "GreatFrontend Blind 75", url: sourceUrls.greatfrontendBlind75 },
        { label: "NeetCode 150 reference", url: sourceUrls.neetcode150 },
        { label: "LeetCode", url: sourceUrls.leetcode },
        { label: "Patterns.dev", url: topic.patternsLinks[0] || sourceUrls.patterns }
      ]
    )
  ];
});

const bonusTopics = [
  {
    week: 1,
    summary: "If the core week is done, build interview language around rendering, focus, and XSS basics.",
    items: [
      { track: "Performance", title: "Core Web Vitals overview: LCP, INP, CLS and why frontend teams care", source: "web.dev", source_url: sourceUrls.webDevVitals },
      { track: "Accessibility", title: "Keyboard focus basics for the counter widget: visible focus and tab order", source: "web.dev", source_url: sourceUrls.webDevFocus },
      { track: "Security", title: "XSS mental model: output encoding, dangerous sinks, and React escaping", source: "OWASP", source_url: sourceUrls.owaspXss }
    ]
  },
  {
    week: 2,
    summary: "Use the bonus slot to connect forms/search work with caching, labels, and browser trust boundaries.",
    items: [
      { track: "Performance", title: "HTTP cache and CDN review: what should be cached and what must revalidate", source: "web.dev", source_url: sourceUrls.webDevPerformance },
      { track: "Accessibility", title: "Form labels, errors, and text alternatives for form/search UI", source: "web.dev", source_url: sourceUrls.webDevLabels },
      { track: "Security", title: "CORS basics: origin checks, preflight, credentials, and common interview traps", source: "MDN", source_url: sourceUrls.mdnCors }
    ]
  },
  {
    week: 3,
    summary: "Add polish around typeahead/autocomplete without expanding the required build.",
    items: [
      { track: "Performance", title: "INP basics: how event handlers, promises, and rendering affect responsiveness", source: "web.dev", source_url: sourceUrls.webDevInp },
      { track: "Accessibility", title: "ARIA only when needed: native HTML first, then roles for disclosure/autocomplete", source: "web.dev", source_url: sourceUrls.webDevAriaHtml },
      { track: "Security", title: "CSP intro: reduce XSS blast radius and explain nonce/hash tradeoffs", source: "MDN", source_url: sourceUrls.mdnCsp }
    ]
  },
  {
    week: 4,
    summary: "Make modal/dropdown work interview-ready with motion, focus, and clickjacking awareness.",
    items: [
      { track: "Performance", title: "CLS basics: avoid layout shifts in toast, modal, and dropdown interactions", source: "web.dev", source_url: sourceUrls.webDevCls },
      { track: "Accessibility", title: "Focus management for dialogs and menus: entry, escape, and restore focus", source: "web.dev", source_url: sourceUrls.webDevFocus },
      { track: "Security", title: "Clickjacking defenses: frame-ancestors and X-Frame-Options", source: "OWASP", source_url: sourceUrls.owaspClickjacking }
    ]
  },
  {
    week: 5,
    summary: "Round out list/search work with practical loading and auth/session safety.",
    items: [
      { track: "Performance", title: "LCP basics: images, server response, render-blocking CSS/JS", source: "web.dev", source_url: sourceUrls.webDevLcp },
      { track: "Accessibility", title: "Search results semantics: headings, status text, and empty-state announcements", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "Cookie attributes: HttpOnly, Secure, SameSite, and session risk in SPAs", source: "MDN", source_url: sourceUrls.mdnCookieSecurity }
    ]
  },
  {
    week: 6,
    summary: "Use async table/file-tree practice to discuss heavy lists and safe dependency loading.",
    items: [
      { track: "Performance", title: "Lazy loading images and offscreen content without hurting UX", source: "web.dev", source_url: sourceUrls.webDevLazyLoading },
      { track: "Accessibility", title: "Tree and nested navigation basics: keyboard paths and selected state", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "Subresource Integrity: when third-party script/style integrity matters", source: "MDN", source_url: sourceUrls.mdnSRI }
    ]
  },
  {
    week: 7,
    summary: "Make dashboard/kanban work stronger by discussing observation, live regions, and CSRF.",
    items: [
      { track: "Performance", title: "Measure before optimizing: field data, lab data, and simple profiling notes", source: "web.dev", source_url: sourceUrls.webDevPerformance },
      { track: "Accessibility", title: "Live updates: when to announce changes and when to keep UI quiet", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "CSRF overview: SameSite, tokens, and why APIs still need a policy", source: "OWASP", source_url: sourceUrls.owaspCsrf }
    ]
  },
  {
    week: 8,
    summary: "Connect notification/calendar work to payload control, images, and request hardening.",
    items: [
      { track: "Performance", title: "Code splitting basics: route-level and component-level split decisions", source: "web.dev", source_url: sourceUrls.webDevCodeSplitting },
      { track: "Accessibility", title: "Image alternatives and icon-only buttons in calendar/notification UI", source: "web.dev", source_url: sourceUrls.webDevImages },
      { track: "Security", title: "Security headers overview: HSTS, CSP, X-Content-Type-Options, and Referrer-Policy", source: "web.dev", source_url: sourceUrls.webDevSecurityHeaders }
    ]
  },
  {
    week: 9,
    summary: "Use grid/editor practice to sharpen virtualization, keyboard, and paste/input safety.",
    items: [
      { track: "Performance", title: "Virtual lists: when virtualization helps and what it can break", source: "Patterns.dev", source_url: sourceUrls.patternsVirtualLists },
      { track: "Accessibility", title: "Grid keyboard behavior: roving focus, active cell, and edit mode", source: "web.dev", source_url: sourceUrls.webDevFocus },
      { track: "Security", title: "Sanitization and dangerous HTML sinks: paste/import safety for editors", source: "OWASP", source_url: sourceUrls.owaspXss }
    ]
  },
  {
    week: 10,
    summary: "Realtime systems need careful latency, announcements, and secure transport stories.",
    items: [
      { track: "Performance", title: "Optimize INP: break up long tasks and keep interactions responsive", source: "web.dev", source_url: sourceUrls.webDevOptimizeInp },
      { track: "Accessibility", title: "Presence/realtime updates: avoid noisy announcements while preserving context", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "Secure contexts: why powerful browser APIs require HTTPS", source: "MDN", source_url: sourceUrls.mdnSecureContexts }
    ]
  },
  {
    week: 11,
    summary: "For feed systems, practice media performance, inclusive navigation, and embedded content safety.",
    items: [
      { track: "Performance", title: "Optimize LCP: priority images, preconnect, preload, and server timing", source: "web.dev", source_url: sourceUrls.webDevOptimizeLcp },
      { track: "Accessibility", title: "Feed navigation: landmarks, headings, and meaningful link text", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "Untrusted media and embeds: CSP plus sandboxed iframe tradeoffs", source: "MDN", source_url: sourceUrls.mdnCsp }
    ]
  },
  {
    week: 12,
    summary: "Chat systems are a good place to review responsiveness, accessible status, and cookie policy.",
    items: [
      { track: "Performance", title: "Long task review: why chat typing and message rendering can feel slow", source: "web.dev", source_url: sourceUrls.webDevInp },
      { track: "Accessibility", title: "Message status and errors: announce failures without interrupting typing", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "SameSite cookies explained for logged-in web apps", source: "web.dev", source_url: sourceUrls.webDevSameSite }
    ]
  },
  {
    week: 13,
    summary: "Observability week gets a focused bonus around vitals, audits, and request metadata.",
    items: [
      { track: "Performance", title: "Core Web Vitals reporting: what to log and how to segment", source: "web.dev", source_url: sourceUrls.webDevVitals },
      { track: "Accessibility", title: "Accessibility audit pass: keyboard, labels, contrast, and screen-reader smoke test", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "Fetch Metadata headers: simple server-side protection for cross-site requests", source: "web.dev", source_url: sourceUrls.webDevFetchMetadata }
    ]
  },
  {
    week: 14,
    summary: "Repair week bonus: tighten weak points without adding new interview domains.",
    items: [
      { track: "Performance", title: "Pick one slow UI you built and write a 5-step optimization plan", source: "web.dev", source_url: sourceUrls.webDevPerformance },
      { track: "Accessibility", title: "Redo one weak component with keyboard-first behavior", source: "web.dev", source_url: sourceUrls.webDevFocus },
      { track: "Security", title: "Write a frontend security checklist: XSS, CSP, CORS, cookies, dependencies", source: "OWASP + MDN", source_url: sourceUrls.owaspXss }
    ]
  },
  {
    week: 15,
    summary: "Mock week bonus: use these only as interview talking points after timed practice.",
    items: [
      { track: "Performance", title: "Mock debrief: name the bottleneck, measurement, and tradeoff", source: "web.dev", source_url: sourceUrls.webDevPerformance },
      { track: "Accessibility", title: "Mock debrief: name the keyboard path and screen-reader state", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "Mock debrief: name one abuse case and mitigation for each design", source: "web.dev + OWASP", source_url: sourceUrls.webDevSecurityHeaders }
    ]
  },
  {
    week: 16,
    summary: "Final week bonus: light checklist only, no new heavy study.",
    items: [
      { track: "Performance", title: "Final Core Web Vitals flashcards: LCP, INP, CLS, examples, fixes", source: "web.dev", source_url: sourceUrls.webDevVitals },
      { track: "Accessibility", title: "Final accessibility flashcards: semantic HTML, labels, focus, ARIA rules", source: "web.dev", source_url: sourceUrls.webDevAccessibility },
      { track: "Security", title: "Final security flashcards: XSS, CSRF, CORS, CSP, cookies, SRI", source: "OWASP + MDN", source_url: sourceUrls.owaspXss }
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

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isAllowedEmail(email) {
  return /^[^\s@]+@gmail\.com$/.test(email);
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashOtp(email, otp) {
  return hashValue(`${email}:${otp}:${authSecret}`);
}

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf("=");
        if (index === -1) return [cookie, ""];
        return [cookie.slice(0, index), decodeURIComponent(cookie.slice(index + 1))];
      })
  );
}

function sessionCookie(token, expiresAt) {
  const parts = [
    `${cookieName}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    `SameSite=${isProduction ? "None" : "Lax"}`,
    `Expires=${expiresAt.toUTCString()}`
  ];
  if (isProduction) parts.push("Secure");
  return parts.join("; ");
}

function clearSessionCookie() {
  const parts = [`${cookieName}=`, "HttpOnly", "Path=/", `SameSite=${isProduction ? "None" : "Lax"}`, "Expires=Thu, 01 Jan 1970 00:00:00 GMT"];
  if (isProduction) parts.push("Secure");
  return parts.join("; ");
}

async function sendOtpEmail(email, otp) {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.AUTH_EMAIL_FROM || `Frontend Switch OS <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Frontend Switch OS login code",
      text: `Your login code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your login code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
    });

    return "gmail";
  }

  if (!process.env.RESEND_API_KEY) {
    console.log(`[auth] OTP for ${email}: ${otp}`);
    return "console";
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.AUTH_EMAIL_FROM || "Frontend Switch OS <onboarding@resend.dev>",
      to: email,
      subject: "Your Frontend Switch OS login code",
      text: `Your login code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your login code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email provider rejected OTP send: ${body}`);
  }

  return "email";
}

async function requireAuth(req, res, next) {
  try {
    const token = parseCookies(req.headers.cookie)[cookieName];
    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const sessionResult = await query(
      `select s.id as session_id, s.expires_at, u.id as user_id, u.email, u.leetcode_username
       from auth_sessions s
       join app_users u on u.id = s.user_id
       where s.token_hash = $1 and s.expires_at > now()`,
      [hashValue(token)]
    );

    if (!sessionResult.rowCount) {
      res.setHeader("Set-Cookie", clearSessionCookie());
      res.status(401).json({ error: "Session expired" });
      return;
    }

    req.user = {
      id: sessionResult.rows[0].user_id,
      email: sessionResult.rows[0].email,
      leetcode_username: sessionResult.rows[0].leetcode_username
    };
    await query("update auth_sessions set last_seen_at = now() where id = $1", [sessionResult.rows[0].session_id]);
    next();
  } catch (error) {
    next(error);
  }
}

app.get("/api/health", async (_req, res, next) => {
  try {
    const result = await query("select now() as now");
    res.json({ ok: true, databaseTime: result.rows[0].now });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", async (req, res, next) => {
  try {
    const token = parseCookies(req.headers.cookie)[cookieName];
    if (!token) {
      res.json({ user: null });
      return;
    }

    const sessionResult = await query(
      `select u.id, u.email, u.leetcode_username
       from auth_sessions s
       join app_users u on u.id = s.user_id
       where s.token_hash = $1 and s.expires_at > now()`,
      [hashValue(token)]
    );

    if (!sessionResult.rowCount) {
      res.setHeader("Set-Cookie", clearSessionCookie());
      res.json({ user: null });
      return;
    }

    res.json({ user: sessionResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/request-otp", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!isAllowedEmail(email)) {
      res.status(400).json({ error: "Use a valid Gmail address to continue." });
      return;
    }

    const recentResult = await query(
      `select count(*)::int as recent_count
       from email_otps
       where email = $1 and created_at > now() - interval '2 minutes'`,
      [email]
    );
    if (recentResult.rows[0].recent_count >= 3) {
      res.status(429).json({ error: "Too many OTP requests. Please wait a couple of minutes." });
      return;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    await query(
      `insert into email_otps (email, otp_hash, expires_at)
       values ($1, $2, now() + interval '10 minutes')`,
      [email, hashOtp(email, otp)]
    );

    const delivery = await sendOtpEmail(email, otp);
    res.json({
      ok: true,
      delivery,
      message: delivery === "console" ? "Development OTP printed in the API console." : "OTP sent to your Gmail inbox."
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/verify-otp", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    if (!isAllowedEmail(email) || !/^\d{6}$/.test(otp)) {
      res.status(400).json({ error: "Enter the Gmail address and 6-digit OTP." });
      return;
    }

    const otpResult = await query(
      `select *
       from email_otps
       where email = $1 and consumed_at is null and expires_at > now()
       order by created_at desc
       limit 1`,
      [email]
    );

    if (!otpResult.rowCount) {
      res.status(400).json({ error: "OTP expired. Request a new code." });
      return;
    }

    const otpRow = otpResult.rows[0];
    if (otpRow.attempts >= 5) {
      res.status(429).json({ error: "Too many attempts. Request a new code." });
      return;
    }

    if (otpRow.otp_hash !== hashOtp(email, otp)) {
      await query("update email_otps set attempts = attempts + 1 where id = $1", [otpRow.id]);
      res.status(400).json({ error: "Invalid OTP. Check the code and try again." });
      return;
    }

    const userResult = await query(
      `insert into app_users (email, last_login_at)
       values ($1, now())
       on conflict (email) do update set last_login_at = now()
       returning id, email, leetcode_username`,
      [email]
    );
    await query("update email_otps set consumed_at = now() where id = $1", [otpRow.id]);

    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await query(
      `insert into auth_sessions (user_id, token_hash, expires_at)
       values ($1, $2, $3)`,
      [userResult.rows[0].id, hashValue(token), expiresAt]
    );

    res.setHeader("Set-Cookie", sessionCookie(token, expiresAt));
    res.json({ user: userResult.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", async (req, res, next) => {
  try {
    const token = parseCookies(req.headers.cookie)[cookieName];
    if (token) {
      await query("delete from auth_sessions where token_hash = $1", [hashValue(token)]);
    }
    res.setHeader("Set-Cookie", clearSessionCookie());
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use("/api", requireAuth);

app.patch("/api/auth/profile", async (req, res, next) => {
  try {
    const leetcodeUsername = String(req.body.leetcodeUsername || "").trim();
    if (!/^[A-Za-z0-9_-]{3,30}$/.test(leetcodeUsername)) {
      res.status(400).json({ error: "Enter a valid LeetCode username, 3-30 characters using letters, numbers, underscore, or hyphen." });
      return;
    }

    const result = await query(
      `update app_users
       set leetcode_username = $1
       where id = $2
       returning id, email, leetcode_username`,
      [leetcodeUsername, req.user.id]
    );

    res.json({ user: result.rows[0] });
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
      const bonus = bonusTopics.find((item) => item.week === week.week);

      return {
        ...week,
        bonus: bonus || null,
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
    const { search = "", pattern = "All", status = "All", priority = "All", sort = "source_order", direction = "asc" } = req.query;
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
    const sortColumns = {
      source_order: "q.source_order",
      title: "q.title",
      pattern: "q.pattern",
      difficulty: `case q.difficulty when 'Easy' then 1 when 'Medium' then 2 when 'Hard' then 3 else 4 end`,
      status: "coalesce(qp.status, 'Todo')"
    };
    const sortColumn = sortColumns[sort] || sortColumns.source_order;
    const sortDirection = String(direction).toLowerCase() === "desc" ? "desc" : "asc";
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
       order by ${sortColumn} ${sortDirection}, q.source_order asc`,
      values
    );
    const patternResult = await query("select distinct pattern from questions where pattern is not null order by pattern asc");
    const questions = result.rows
      .map(enrichQuestion)
      .filter((question) => priority === "All" || question.dsa_priority === priority);

    res.json({ questions, patterns: ["All", ...patternResult.rows.map((row) => row.pattern)] });
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
      const verification = await verifySolved(questionResult.rows[0], req.user.leetcode_username);
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
