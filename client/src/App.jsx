import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock3, Database, ExternalLink, Moon, RefreshCcw, Search, Sun } from "lucide-react";
import { api } from "./lib/api.js";

const tabs = [
  { id: "plan", label: "Weekly Plan", icon: ClipboardList },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "questions", label: "DSA Bank", icon: Database },
  { id: "logs", label: "Daily Log", icon: CalendarDays },
  { id: "roadmap", label: "Roadmap", icon: BookOpen }
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
