import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, Building2, CalendarDays, CheckCircle2, ClipboardList, Clock3, Database, ExternalLink, Moon, RefreshCcw, Search, Sun } from "lucide-react";
import { api } from "./lib/api.js";

const tabs = [
  { id: "plan", label: "Weekly Plan", icon: ClipboardList },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "questions", label: "DSA Bank", icon: Database },
  { id: "companies", label: "Company Targets", icon: Building2 },
  { id: "logs", label: "Daily Log", icon: CalendarDays },
  { id: "roadmap", label: "Roadmap", icon: BookOpen }
];

const companyPrepSources = [
  {
    title: "Validated Frontend Banks",
    description: "Use these for frontend-specific coding, React LLD, system design, and company-tagged prep.",
    links: [
      { label: "GreatFrontend questions", url: "https://www.greatfrontend.com/questions" },
      { label: "GreatFrontend GFE 75", url: "https://www.greatfrontend.com/interviews/gfe75" },
      { label: "devtools all questions", url: "https://devtools.tech/questions/all" },
      { label: "devtools company questions", url: "https://devtools.tech/dashboard/time-savers/company-questions" },
      { label: "devtools company guides", url: "https://devtools.tech/dashboard/guides/company" },
      { label: "LearnersBucket FSD", url: "https://alpha.learnersbucket.com/course/frontend-system-design/start" },
      { label: "Namaste FSD", url: "https://namastedev.com/learn/namaste-frontend-system-design" }
    ]
  },
  {
    title: "High-Signal Public Resources",
    description: "Use these when company pages do not expose exact frontend questions or when you need fundamentals.",
    links: [
      { label: "Patterns.dev", url: "https://www.patterns.dev/" },
      { label: "web.dev performance", url: "https://web.dev/learn/performance/" },
      { label: "web.dev accessibility", url: "https://web.dev/learn/accessibility/" },
      { label: "OWASP XSS cheat sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
      { label: "MDN HTTP caching", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching" },
      { label: "MDN WebSocket API", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" }
    ]
  }
];

const companyTargets = [
  {
    group: "MAANG / FAANG",
    helper: "Start here for broad big-tech loops: DSA fundamentals, JS utilities, React LLD, frontend system design, performance, accessibility, and security.",
    companies: [
      {
        name: "Google",
        focus: "DSA depth, web performance, search/autocomplete, calendar/collaboration HLD.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/google/" },
          { label: "Google Calendar FSD", url: "https://devtools.tech/frontend-system-design/calendar" },
          { label: "GreatFrontend company filter", url: "https://www.greatfrontend.com/questions" }
        ]
      },
      {
        name: "Meta",
        focus: "React internals, feed/chat surfaces, virtual DOM, accessibility, product tradeoffs.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/facebook/" },
          { label: "Meta virtual DOM video", url: "https://www.youtube.com/watch?v=eaPv4yCSkBE" },
          { label: "GreatFrontend UI coding", url: "https://www.greatfrontend.com/questions/formats/ui-coding" }
        ]
      },
      {
        name: "Amazon",
        focus: "DSA consistency, scalable UI components, retail/search flows, operational edge cases.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/amazon/" },
          { label: "devtools company questions", url: "https://devtools.tech/dashboard/time-savers/company-questions" },
          { label: "Frontend system design", url: "https://devtools.tech/dashboard/fsd/guide" }
        ]
      },
      {
        name: "Microsoft",
        focus: "DSA, UI state machines, accessibility, enterprise product design, testing clarity.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/microsoft/" },
          { label: "Country capital game", url: "https://www.youtube.com/results?search_query=devtools.tech+Microsoft+frontend+country+capital+game" },
          { label: "GreatFrontend JS functions", url: "https://www.greatfrontend.com/questions/formats/javascript-functions" }
        ]
      },
      {
        name: "Apple",
        focus: "Polished UI, browser APIs, performance, correctness, and clean interaction design.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/apple/" },
          { label: "GreatFrontend questions", url: "https://www.greatfrontend.com/questions" },
          { label: "Namaste performance module", url: "https://namastedev.com/learn/namaste-frontend-system-design/performance-overview" }
        ]
      },
      {
        name: "Netflix",
        focus: "Performance, video/feed UX, caching, observability, and resilient frontend architecture.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/netflix/" },
          { label: "web.dev performance", url: "https://web.dev/learn/performance/" },
          { label: "Namaste caching module", url: "https://namastedev.com/learn/namaste-frontend-system-design/database-caching-overview" }
        ]
      }
    ]
  },
  {
    group: "Global Product Companies",
    helper: "Good target set for senior frontend interviews with real-world machine-coding and frontend architecture rounds.",
    companies: [
      {
        name: "Uber",
        focus: "Maps, realtime state, batching, rate limits, overlapping shapes, async task control.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/uber/" },
          { label: "Paytm/Uber mapLimit", url: "https://www.youtube.com/watch?v=6IH79tU0l1g" },
          { label: "Uber shape question", url: "https://www.youtube.com/watch?v=DCoIeGt4g7M" }
        ]
      },
      {
        name: "Atlassian",
        focus: "Feature flags, dashboards, product workflows, nested data, collaboration surfaces.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/atlassian/" },
          { label: "Feature flag video", url: "https://www.youtube.com/watch?v=pxPVsZyMcb4" },
          { label: "JIRA velocity chart video", url: "https://www.youtube.com/results?search_query=devtools.tech+Atlassian+JIRA+Velocity+Chart" }
        ]
      },
      {
        name: "LinkedIn",
        focus: "Feed, search, messaging, graph-ish data, accessibility, and JS array utilities.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/linkedin/" },
          { label: "LinkedIn tuple arrays search", url: "https://www.youtube.com/results?search_query=devtools.tech+LinkedIn+Tuple+Arrays+JavaScript" },
          { label: "GreatFrontend system design", url: "https://www.greatfrontend.com/questions/system-design" }
        ]
      },
      {
        name: "Airbnb",
        focus: "Search/filter UI, forms, maps, design systems, and high-quality component behavior.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/airbnb/" },
          { label: "GreatFrontend UI coding", url: "https://www.greatfrontend.com/questions/formats/ui-coding" },
          { label: "Patterns.dev React", url: "https://www.patterns.dev/react/" }
        ]
      },
      {
        name: "Intuit",
        focus: "Forms, dashboards, charts, validation-heavy UI, and frontend coding questions.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/intuit/" },
          { label: "devtools Intuit list", url: "https://devtools.tech/lists/s/intuit-frontend-interview-questions---lid---lhSfvCsE96RgGJeb3xY6?ref=item-card" },
          { label: "GreatFrontend forms/UI", url: "https://www.greatfrontend.com/questions/formats/ui-coding" }
        ]
      },
      {
        name: "Stripe",
        focus: "API mental models, correctness, security, checkout/payment UI, and system tradeoffs.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/stripe/" },
          { label: "OWASP CSRF", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
          { label: "Namaste security module", url: "https://namastedev.com/learn/namaste-frontend-system-design/security-overview" }
        ]
      }
    ]
  },
  {
    group: "India Top Tech / Startups",
    helper: "Prioritize company-tagged DSA plus frontend machine-coding rounds from devtools, GreatFrontend, LearnersBucket, and Namaste FSD.",
    companies: [
      {
        name: "Flipkart",
        focus: "E-commerce search, cart/listing UI, DSA, caching, pagination, and performance.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/flipkart/" },
          { label: "GreatFrontend questions", url: "https://www.greatfrontend.com/questions" },
          { label: "Namaste caching module", url: "https://namastedev.com/learn/namaste-frontend-system-design/api-caching" }
        ]
      },
      {
        name: "Blinkit",
        focus: "Fast commerce UI, search, inventory-ish state, timers, forms, and React LLD.",
        links: [
          { label: "devtools Blinkit list", url: "https://devtools.tech/lists/s/blinkit-frontend-interview-questions---lid---zEZeVs8U7ehEmzdXYWB7?ref=item-card" },
          { label: "LeetCode company search", url: "https://leetcode.com/problemset/?search=Blinkit" },
          { label: "LearnersBucket JS bank", url: "https://alpha.learnersbucket.com/course/frontend-system-design/start" }
        ]
      },
      {
        name: "MakeMyTrip",
        focus: "Booking/search flows, filters, forms, calendar/date picker, caching, and UX states.",
        links: [
          { label: "devtools MakeMyTrip list", url: "https://devtools.tech/lists/s/makemytrip-frontend-interview-questions---lid---7CkHb2WmMx8FWyzSVbRT?ref=item-card" },
          { label: "LeetCode company search", url: "https://leetcode.com/problemset/?search=MakeMyTrip" },
          { label: "Calendar system design", url: "https://devtools.tech/frontend-system-design/calendar" }
        ]
      },
      {
        name: "Zeta",
        focus: "Fintech UI, data grids, forms, validation, security, and JS utilities.",
        links: [
          { label: "devtools Zeta list", url: "https://devtools.tech/lists/s/zeta-frontend-interview-questions---lid---kh6swDyCEcXbNpSth2VO?ref=item-card" },
          { label: "LeetCode company search", url: "https://leetcode.com/problemset/?search=Zeta" },
          { label: "Namaste security module", url: "https://namastedev.com/learn/namaste-frontend-system-design/security-overview" }
        ]
      },
      {
        name: "Paytm",
        focus: "Payments UI, mapLimit-style async control, security, forms, and DSA basics.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/paytm/" },
          { label: "Paytm/Uber mapLimit", url: "https://www.youtube.com/watch?v=6IH79tU0l1g" },
          { label: "Namaste security headers", url: "https://namastedev.com/learn/namaste-frontend-system-design/security-headers" }
        ]
      },
      {
        name: "Razorpay",
        focus: "Checkout flows, reliability, security, validation, SDK thinking, and observability.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/razorpay/" },
          { label: "LearnersBucket analytics SDK", url: "https://alpha.learnersbucket.com/course-item?item-id=67b0d7d0d84a43d13e5bd61e" },
          { label: "Namaste client security", url: "https://namastedev.com/learn/namaste-frontend-system-design/client-side-security" }
        ]
      },
      {
        name: "PhonePe",
        focus: "Payment/product UI, state consistency, retries, idempotency discussions, and DSA.",
        links: [
          { label: "LeetCode company tag", url: "https://leetcode.com/company/phonepe/" },
          { label: "LearnersBucket retry promises", url: "https://alpha.learnersbucket.com/course-item?item-id=67c19f40acd6fb93643bb09b" },
          { label: "devtools company questions", url: "https://devtools.tech/dashboard/time-savers/company-questions" }
        ]
      },
      {
        name: "CRED / Groww / Zerodha",
        focus: "Fintech frontend: charts, tables, security, performance, state, and product polish.",
        links: [
          { label: "LeetCode company search", url: "https://leetcode.com/problemset/?search=Cred" },
          { label: "devtools spreadsheet grid search", url: "https://devtools.tech/questions/all?search=Spreadsheet%20Grid" },
          { label: "Namaste monitoring module", url: "https://namastedev.com/learn/namaste-frontend-system-design/logging-and-monitoring-overview" }
        ]
      }
    ]
  }
];

const today = () => new Date().toISOString().slice(0, 10);

function getInitialTheme() {
  const storedTheme = window.localStorage.getItem("switch-os-theme");
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [activeTab, setActiveTab] = useState("plan");
  const [theme, setTheme] = useState(getInitialTheme);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [logs, setLogs] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [patterns, setPatterns] = useState(["All"]);
  const [filters, setFilters] = useState({ search: "", pattern: "All", status: "All", priority: "All", sort: "source_order", direction: "asc" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingLeetcode, setIsEditingLeetcode] = useState(false);
  const [leetcodeDraft, setLeetcodeDraft] = useState("");
  const [isSavingLeetcode, setIsSavingLeetcode] = useState(false);

  async function loadSession() {
    try {
      const result = await api.me();
      setUser(result.user);
      if (result.user?.leetcode_username) {
        await loadApp();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAuthChecked(true);
    }
  }

  async function loadApp() {
    setIsLoading(true);
    setError("");
    try {
      const [metricsResult, roadmapResult, weeklyPlanResult, logsResult, questionsResult] = await Promise.all([
        api.metrics(),
        api.roadmap(),
        api.weeklyPlan(),
        api.logs(),
        api.questions(filters)
      ]);
      setMetrics(metricsResult);
      setRoadmap(roadmapResult.roadmap);
      setWeeklyPlan(weeklyPlanResult.weeks);
      setLogs(logsResult.logs);
      setQuestions(questionsResult.questions);
      setPatterns(questionsResult.patterns || ["All"]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadQuestions(nextFilters = filters) {
    setFilters(nextFilters);
    try {
      const result = await api.questions(nextFilters);
      setQuestions(result.questions);
      setPatterns(result.patterns || ["All"]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateQuestion(id, status) {
    setError("");
    try {
      await api.updateQuestion(id, { status });
      await Promise.all([
        loadQuestions(),
        api.metrics().then(setMetrics),
        api.weeklyPlan().then((result) => setWeeklyPlan(result.weeks))
      ]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateMilestone(id, status) {
    setError("");
    try {
      await api.updateMilestone(id, { status });
      await Promise.all([
        api.metrics().then(setMetrics),
        api.weeklyPlan().then((result) => setWeeklyPlan(result.weeks))
      ]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function addLog(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.addLog({
      logDate: form.get("logDate"),
      focus: form.get("focus"),
      minutes: Number(form.get("minutes")),
      notes: form.get("notes")
    });
    event.currentTarget.reset();
    await Promise.all([api.logs().then((result) => setLogs(result.logs)), api.metrics().then(setMetrics)]);
  }

  async function handleAuthenticated(nextUser) {
    setUser(nextUser);
    if (nextUser.leetcode_username) {
      await loadApp();
    }
  }

  async function handleProfileSaved(nextUser) {
    setUser(nextUser);
    await loadApp();
  }

  async function saveLeetcodeUsername(event) {
    event.preventDefault();
    setError("");
    setIsSavingLeetcode(true);
    try {
      const result = await api.updateProfile({ leetcodeUsername: leetcodeDraft });
      setUser(result.user);
      setIsEditingLeetcode(false);
      await loadApp();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingLeetcode(false);
    }
  }

  async function logout() {
    setError("");
    try {
      await api.logout();
      setUser(null);
      setMetrics(null);
      setRoadmap([]);
      setWeeklyPlan([]);
      setLogs([]);
      setQuestions([]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("switch-os-theme", theme);
  }, [theme]);

  const shell = (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>FS</span>
          <div>
            <h1>Switch OS</h1>
            <p>React + Node + Postgres</p>
          </div>
        </div>

        <nav className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={activeTab === tab.id ? "active" : ""}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section className="sidebar-panel">
          <p className="label">Target</p>
          <h2>Senior Frontend</h2>
          <p>Four-month switch plan with DSA tracking, mocks, and study analytics.</p>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Frontend interview control center</p>
            <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
          </div>
          <div className="topbar-actions">
            {user ? (
              isEditingLeetcode ? (
                <form className="profile-inline-form" onSubmit={saveLeetcodeUsername}>
                  <label>
                    LeetCode
                    <input
                      autoComplete="username"
                      onChange={(event) => setLeetcodeDraft(event.target.value)}
                      placeholder="LeetCode username"
                      required
                      value={leetcodeDraft}
                    />
                  </label>
                  <button disabled={isSavingLeetcode} type="submit">
                    {isSavingLeetcode ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="muted"
                    disabled={isSavingLeetcode}
                    onClick={() => setIsEditingLeetcode(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  className="user-chip"
                  onClick={() => {
                    setLeetcodeDraft(user.leetcode_username || "");
                    setIsEditingLeetcode(true);
                  }}
                  title="Edit LeetCode username"
                  type="button"
                >
                  {user.email} · LC: {user.leetcode_username}
                </button>
              )
            ) : null}
            <button
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-pressed={theme === "dark"}
              className="icon-button"
              onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              type="button"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="ghost-button" onClick={loadApp} type="button">
              <RefreshCcw size={18} />
              Refresh
            </button>
            {user ? (
              <button className="muted" onClick={logout} type="button">
                Logout
              </button>
            ) : null}
          </div>
        </header>

        {error ? <div className="banner">API connection issue: {error}</div> : null}
        {isLoading ? <div className="banner neutral">Loading tracker data...</div> : null}

        {activeTab === "plan" ? <WeeklyPlan weeks={weeklyPlan} onMilestoneUpdate={updateMilestone} onUpdate={updateQuestion} /> : null}
        {activeTab === "dashboard" ? <Dashboard metrics={metrics} logs={logs} questions={questions} /> : null}
        {activeTab === "questions" ? (
          <QuestionBank
            filters={filters}
            onFilter={loadQuestions}
            onUpdate={updateQuestion}
            patterns={patterns}
            questions={questions}
          />
        ) : null}
        {activeTab === "companies" ? <CompanyTargets /> : null}
        {activeTab === "logs" ? <Logs logs={logs} onAdd={addLog} /> : null}
        {activeTab === "roadmap" ? <Roadmap roadmap={roadmap} /> : null}
      </section>
    </main>
  );

  if (!authChecked) {
    return <div className="auth-shell"><div className="banner neutral">Checking session...</div></div>;
  }

  if (!user) {
    return (
      <AuthScreen
        error={error}
        onAuthenticated={handleAuthenticated}
        theme={theme}
        onThemeChange={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
      />
    );
  }

  if (!user.leetcode_username) {
    return (
      <ProfileSetup
        error={error}
        onLogout={logout}
        onSaved={handleProfileSaved}
        theme={theme}
        onThemeChange={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
        user={user}
      />
    );
  }

  return shell;
}

function AuthScreen({ error, onAuthenticated, theme, onThemeChange }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError("");
    setMessage("");
    try {
      const result = await api.requestOtp({ email });
      setMessage(result.message);
      setStep("otp");
    } catch (requestError) {
      setAuthError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError("");
    try {
      const result = await api.verifyOtp({ email, otp });
      await onAuthenticated(result.user);
    } catch (requestError) {
      setAuthError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-topline">
          <div className="brand auth-brand">
            <span>FS</span>
            <div>
              <h1>Switch OS</h1>
              <p>Senior frontend prep tracker</p>
            </div>
          </div>
          <button
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-pressed={theme === "dark"}
            className="icon-button"
            onClick={onThemeChange}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            type="button"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="auth-copy">
          <p className="label">Passwordless login</p>
          <h2>Continue with Gmail OTP</h2>
          <p>Use your Gmail address and a 6-digit code. No password is stored.</p>
        </div>

        {error ? <div className="banner">API connection issue: {error}</div> : null}
        {authError ? <div className="banner">{authError}</div> : null}
        {message ? <div className="banner neutral">{message}</div> : null}

        {step === "email" ? (
          <form className="auth-form" onSubmit={requestOtp}>
            <label>
              Gmail address
              <input
                autoComplete="email"
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@gmail.com"
                required
                type="email"
                value={email}
              />
            </label>
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={verifyOtp}>
            <label>
              Gmail address
              <input autoComplete="email" readOnly type="email" value={email} />
            </label>
            <label>
              6-digit OTP
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength="6"
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                required
                value={otp}
              />
            </label>
            <div className="auth-actions">
              <button disabled={isSubmitting || otp.length !== 6} type="submit">
                {isSubmitting ? "Verifying..." : "Verify and enter"}
              </button>
              <button className="muted" disabled={isSubmitting} onClick={() => setStep("email")} type="button">
                Change email
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

function ProfileSetup({ error, onLogout, onSaved, theme, onThemeChange, user }) {
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function saveProfile(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setProfileError("");
    try {
      const result = await api.updateProfile({ leetcodeUsername });
      await onSaved(result.user);
    } catch (requestError) {
      setProfileError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-topline">
          <div className="brand auth-brand">
            <span>FS</span>
            <div>
              <h1>Switch OS</h1>
              <p>{user.email}</p>
            </div>
          </div>
          <button
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-pressed={theme === "dark"}
            className="icon-button"
            onClick={onThemeChange}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            type="button"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="auth-copy">
          <p className="label">One-time setup</p>
          <h2>Add your LeetCode username</h2>
          <p>This lets Switch OS verify accepted submissions before marking linked DSA problems as solved.</p>
        </div>

        {error ? <div className="banner">API connection issue: {error}</div> : null}
        {profileError ? <div className="banner">{profileError}</div> : null}

        <form className="auth-form" onSubmit={saveProfile}>
          <label>
            LeetCode username
            <input
              autoComplete="username"
              onChange={(event) => setLeetcodeUsername(event.target.value)}
              placeholder="Rohan108"
              required
              value={leetcodeUsername}
            />
          </label>
          <div className="auth-actions">
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save and continue"}
            </button>
            <button className="muted" disabled={isSubmitting} onClick={onLogout} type="button">
              Logout
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ metrics, logs, questions }) {
  const solvedPercent = metrics?.core_total ? Math.round((metrics.core_solved / metrics.core_total) * 100) : 0;
  const milestonePercent = metrics?.milestone_total ? Math.round((metrics.milestone_done / metrics.milestone_total) * 100) : 0;
  const reviseQueue = questions.filter((question) => question.status === "Revise").slice(0, 5);

  return (
    <div className="view-stack">
      <section className="metrics-grid">
        <Metric label="Core DSA" value={`${metrics?.core_solved || 0}/${metrics?.core_total || 0}`} helper={`${solvedPercent}% of Core 100`} />
        <Metric label="Revise" value={metrics?.core_revise || 0} helper={`${metrics?.revise || 0} across full bank`} />
        <Metric label="Study" value={`${metrics?.minutes || 0}m`} helper={`${metrics?.sessions || 0} logged sessions`} />
        <Metric label="Plan" value={`${metrics?.milestone_done || 0}/${metrics?.milestone_total || 0}`} helper={`${milestonePercent}% milestones done`} />
      </section>

      <section className="split">
        <article className="panel">
          <div className="panel-heading">
            <h3>Revision Queue</h3>
            <CheckCircle2 size={20} />
          </div>
          <div className="list">
            {reviseQueue.length ? (
              reviseQueue.map((question) => (
                <a href={question.namaste_url || question.url} key={question.id} rel="noreferrer" target="_blank">
                  <strong>{question.title}</strong>
                  <span>{question.pattern} · {question.difficulty}</span>
                </a>
              ))
            ) : (
              <p className="quiet">No revision items yet. Mark tough problems as Revise instead of letting them vanish.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h3>Recent Work</h3>
          </div>
          <div className="list">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id}>
                <strong>{new Date(log.log_date).toLocaleDateString()} · {log.focus}</strong>
                <span>{log.minutes} min · {log.notes || "Progress logged"}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function Metric({ label, value, helper }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  );
}

function StatusControl({ onChange, options, value, verified = false }) {
  return (
    <div className="status-control">
      {verified ? <span className="verified">LeetCode verified</span> : null}
      <label className={`status-select ${value.toLowerCase()}`}>
        <span>Status</span>
        <select
          aria-label="Update status"
          onChange={(event) => {
            if (event.target.value !== value) {
              onChange(event.target.value);
            }
          }}
          value={value}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function QuestionBank({ filters, onFilter, onUpdate, patterns, questions }) {
  function updateFilter(changes) {
    onFilter({ ...filters, ...changes });
  }

  return (
    <div className="view-stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Full Question Bank</h3>
            <p className="quiet compact">Showing {questions.length} questions. Use topic filters and sort controls for reference mode.</p>
          </div>
        </div>
        <div className="toolbar">
          <label>
            Search
            <div className="input-icon">
              <Search size={17} />
              <input
                onChange={(event) => updateFilter({ search: event.target.value })}
                placeholder="Problem, section, pattern"
                value={filters.search}
              />
            </div>
          </label>
          <label>
            Topic
            <select onChange={(event) => updateFilter({ pattern: event.target.value })} value={filters.pattern}>
              {patterns.map((pattern) => (
                <option key={pattern}>{pattern}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select onChange={(event) => updateFilter({ status: event.target.value })} value={filters.status}>
              <option>All</option>
              <option>Todo</option>
              <option>Solved</option>
              <option>Revise</option>
            </select>
          </label>
          <label>
            Priority
            <select onChange={(event) => updateFilter({ priority: event.target.value })} value={filters.priority}>
              <option>All</option>
              <option>Core 100</option>
              <option>Supplemental</option>
              <option>Course-only</option>
            </select>
          </label>
          <label>
            Sort by
            <select onChange={(event) => updateFilter({ sort: event.target.value })} value={filters.sort}>
              <option value="source_order">Course order</option>
              <option value="pattern">Topic</option>
              <option value="difficulty">Difficulty</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
          </label>
          <label>
            Direction
            <select onChange={(event) => updateFilter({ direction: event.target.value })} value={filters.direction}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </section>

      <section className="question-grid">
        {questions.map((question) => (
          <article className="question-card" key={question.id}>
            <div>
              <strong>{question.source_order}. {question.title}</strong>
              <p>{question.section} · {question.pattern} · {question.difficulty} · {question.duration || "self-paced"}</p>
              <div className="resource-links">
                <span className={`priority-chip ${question.dsa_priority?.toLowerCase().replaceAll(" ", "-")}`}>{question.dsa_priority}</span>
                <a href={question.namaste_url || question.url} rel="noreferrer" target="_blank">
                  <ExternalLink size={14} />
                  NamasteDev
                </a>
                {question.leetcode_url ? (
                  <a href={question.leetcode_url} rel="noreferrer" target="_blank">
                    <ExternalLink size={14} />
                    LeetCode
                  </a>
                ) : (
                  <span>No LeetCode link</span>
                )}
              </div>
            </div>
            <StatusControl
              onChange={(status) => onUpdate(question.id, status)}
              options={["Todo", "Solved", "Revise"]}
              value={question.status}
              verified={Boolean(question.leetcode_verified_at)}
            />
          </article>
        ))}
      </section>
    </div>
  );
}

function WeeklyPlan({ weeks, onMilestoneUpdate, onUpdate }) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const currentWeek = weeks.find((week) => week.week === selectedWeek) || weeks[0];
  const grouped = useMemo(() => {
    if (!currentWeek) return {};
    return currentWeek.questions.reduce((groups, question) => {
      const key = question.plan_stage || question.difficulty || "Medium";
      return { ...groups, [key]: [...(groups[key] || []), question] };
    }, {});
  }, [currentWeek]);
  const milestonesByDay = useMemo(() => {
    if (!currentWeek) return [];
    const days = currentWeek.milestones.reduce((groups, milestone) => {
      const existing = groups[milestone.day_index] || {
        dayIndex: milestone.day_index,
        dayLabel: milestone.day_label,
        minutes: 0,
        milestones: []
      };
      return {
        ...groups,
        [milestone.day_index]: {
          ...existing,
          minutes: existing.minutes + milestone.estimated_minutes,
          milestones: [...existing.milestones, milestone]
        }
      };
    }, {});
    return Object.values(days).sort((a, b) => a.dayIndex - b.dayIndex);
  }, [currentWeek]);

  if (!currentWeek) {
    return <div className="banner neutral">Loading weekly plan...</div>;
  }

  const progressPercent = currentWeek.total ? Math.round((currentWeek.solved / currentWeek.total) * 100) : 0;
  const milestonePercent = currentWeek.milestone_total
    ? Math.round((currentWeek.milestone_done / currentWeek.milestone_total) * 100)
    : 0;

  return (
    <div className="view-stack">
      <section className="week-selector">
        {weeks.map((week) => (
          <button
            className={week.week === selectedWeek ? "active" : ""}
            key={week.week}
            onClick={() => setSelectedWeek(week.week)}
            type="button"
          >
            W{week.week}
          </button>
        ))}
      </section>

      <section className="panel commitment-panel">
        <div>
          <p className="label">Week {currentWeek.week}</p>
          <h3>{currentWeek.theme}</h3>
          <p>{currentWeek.commitment}</p>
          <p className="quiet">Frontend: {currentWeek.frontend}</p>
        </div>
        <div className="commitment-score">
          <strong>{currentWeek.milestone_done}/{currentWeek.milestone_total}</strong>
          <span>{milestonePercent}% weekly milestones · {currentWeek.milestone_revise} revise</span>
          <small>{currentWeek.solved}/{currentWeek.total} DSA solved · {progressPercent}%</small>
        </div>
      </section>

      <section className="day-plan-grid">
        {milestonesByDay.map((day) => (
          <article className="panel day-plan" key={day.dayIndex}>
            <div className="day-heading">
              <div>
                <p className="label">{day.dayLabel}</p>
                <h3>{day.dayIndex === 5 ? "Revision and catch-up" : "Focused commitment"}</h3>
              </div>
              <span className="time-chip">
                <Clock3 size={15} />
                {day.minutes}m
              </span>
            </div>

            <div className="milestone-list">
              {day.milestones.map((milestone) => (
                <div className="milestone" key={milestone.id}>
                  <div className="milestone-copy">
                    <span className={`track-chip ${milestone.track.toLowerCase().replaceAll(" ", "-")}`}>{milestone.track}</span>
                    <strong>{milestone.title}</strong>
                    <span>{milestone.difficulty} · {milestone.source}</span>
                    <div className="resource-links compact-links">
                      {(milestone.links?.length ? milestone.links : [{ label: "Open source", url: milestone.source_url }]).map((link) => (
                        <a href={link.url} key={`${milestone.id}-${link.label}-${link.url}`} rel="noreferrer" target="_blank">
                          <ExternalLink size={14} />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                  <StatusControl
                    onChange={(status) => onMilestoneUpdate(milestone.id, status)}
                    options={["Todo", "Done", "Revise"]}
                    value={milestone.status}
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="panel core-list-panel">
        <div className="panel-heading">
          <div>
            <p className="label">Core 100</p>
            <h3>Week {currentWeek.week} Problems</h3>
            <p className="quiet compact">Open each problem directly from here. Mark `Solved` only when LeetCode verification passes.</p>
          </div>
        </div>
        {currentWeek.levels.map((level) => (
          <details className="question-accordion" key={level.name} open={level.name !== "Hard"}>
            <summary>
              <span>{level.name}</span>
              <strong>{level.target}</strong>
              <small>{(grouped[level.name] || []).length} items</small>
            </summary>
            {(grouped[level.name] || []).length ? (
              <div className="mini-question-list">
              {(grouped[level.name] || []).map((question) => (
                <div className="mini-question" key={question.id}>
                  <div>
                    <strong>{question.title}</strong>
                    <span>{question.pattern} · {question.difficulty} · {question.dsa_priority}</span>
                    <div className="resource-links compact-links">
                      <a href={question.namaste_url || question.url} rel="noreferrer" target="_blank">
                        <ExternalLink size={14} />
                        Namaste
                      </a>
                      {question.leetcode_url ? (
                        <a href={question.leetcode_url} rel="noreferrer" target="_blank">
                          <ExternalLink size={14} />
                          LeetCode
                        </a>
                      ) : (
                        <span>No LeetCode link</span>
                      )}
                    </div>
                  </div>
                  <StatusControl
                    onChange={(status) => onUpdate(question.id, status)}
                    options={["Todo", "Solved", "Revise"]}
                    value={question.status}
                    verified={Boolean(question.leetcode_verified_at)}
                  />
                </div>
              ))}
              </div>
            ) : (
              <p className="quiet compact">No new problems here. Use this slot for revision, missed items, or rest.</p>
            )}
          </details>
        ))}
      </section>

      {currentWeek.bonus ? (
        <section className="panel bonus-panel">
          <div className="panel-heading">
            <div>
              <p className="label">Optional bonus</p>
              <h3>Performance, accessibility, and security</h3>
              <p className="quiet compact">{currentWeek.bonus.summary}</p>
            </div>
          </div>
          <div className="bonus-grid">
            {currentWeek.bonus.items.map((item) => (
              <article className="bonus-card" key={`${currentWeek.week}-${item.track}-${item.title}`}>
                <span className={`track-chip ${item.track.toLowerCase()}`}>{item.track}</span>
                <strong>{item.title}</strong>
                <div className="resource-links compact-links">
                  <a href={item.source_url} rel="noreferrer" target="_blank">
                    <ExternalLink size={14} />
                    {item.source}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Logs({ logs, onAdd }) {
  return (
    <div className="view-stack">
      <section className="panel">
        <form className="log-form" onSubmit={onAdd}>
          <label>
            Date
            <input defaultValue={today()} name="logDate" required type="date" />
          </label>
          <label>
            Focus
            <select name="focus">
              <option>DSA</option>
              <option>Frontend</option>
              <option>System Design</option>
              <option>Mock</option>
              <option>Career</option>
            </select>
          </label>
          <label>
            Minutes
            <input defaultValue="45" min="5" name="minutes" required step="5" type="number" />
          </label>
          <label className="wide">
            Notes
            <textarea name="notes" placeholder="Solved two binary-search problems, revised render pipeline..." rows="4" />
          </label>
          <button type="submit">Add Entry</button>
        </form>
      </section>

      <section className="panel">
        <div className="list">
          {logs.map((log) => (
            <div key={log.id}>
              <strong>{new Date(log.log_date).toLocaleDateString()} · {log.focus}</strong>
              <span>{log.minutes} min · {log.notes || "Progress logged"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CompanyTargets() {
  return (
    <div className="view-stack">
      <section className="panel company-hero">
        <div>
          <p className="label">Company-specific prep</p>
          <h3>Target company loops without losing the weekly plan</h3>
          <p>
            Use this tab as a shortcut layer after finishing weekly commitments. Company tags are strongest for DSA;
            frontend rounds should be practiced through GreatFrontend, devtools, LearnersBucket, Namaste FSD, and focused mock topics.
          </p>
        </div>
        <div className="company-score">
          <strong>{companyTargets.reduce((count, group) => count + group.companies.length, 0)}</strong>
          <span>companies mapped</span>
        </div>
      </section>

      <section className="source-grid">
        {companyPrepSources.map((source) => (
          <article className="panel source-card" key={source.title}>
            <h3>{source.title}</h3>
            <p className="quiet compact">{source.description}</p>
            <div className="resource-links">
              {source.links.map((link) => (
                <a href={link.url} key={link.label} rel="noreferrer" target="_blank">
                  <ExternalLink size={14} />
                  {link.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>

      {companyTargets.map((group) => (
        <section className="panel company-section" key={group.group}>
          <div className="panel-heading">
            <div>
              <p className="label">Target group</p>
              <h3>{group.group}</h3>
              <p className="quiet compact">{group.helper}</p>
            </div>
          </div>
          <div className="company-grid">
            {group.companies.map((company) => (
              <article className="company-card" key={company.name}>
                <div>
                  <strong>{company.name}</strong>
                  <p>{company.focus}</p>
                </div>
                <div className="resource-links compact-links">
                  {company.links.map((link) => (
                    <a href={link.url} key={`${company.name}-${link.label}`} rel="noreferrer" target="_blank">
                      <ExternalLink size={14} />
                      {link.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Roadmap({ roadmap }) {
  return (
    <section className="roadmap">
      {roadmap.map((week) => (
        <article className="panel" key={week.week}>
          <p className="label">Week {week.week}</p>
          <h3>{week.theme}</h3>
          <p>{week.focus}</p>
        </article>
      ))}
    </section>
  );
}
