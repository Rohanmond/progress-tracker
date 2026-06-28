import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock3, Database, ExternalLink, RefreshCcw, Search } from "lucide-react";
import { api } from "./lib/api.js";

const tabs = [
  { id: "plan", label: "Weekly Plan", icon: ClipboardList },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "questions", label: "DSA Bank", icon: Database },
  { id: "logs", label: "Daily Log", icon: CalendarDays },
  { id: "roadmap", label: "Roadmap", icon: BookOpen }
];

const today = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [activeTab, setActiveTab] = useState("plan");
  const [metrics, setMetrics] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [logs, setLogs] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ search: "", pattern: "All", status: "All", priority: "All", limit: "500" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    loadApp();
  }, []);

  const patterns = useMemo(() => {
    const unique = new Set(questions.map((question) => question.pattern).filter(Boolean));
    return ["All", ...Array.from(unique).sort()];
  }, [questions]);

  return (
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
          <button className="ghost-button" onClick={loadApp} type="button">
            <RefreshCcw size={18} />
            Refresh
          </button>
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

function QuestionBank({ filters, onFilter, onUpdate, patterns, questions }) {
  return (
    <div className="view-stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Full Question Bank</h3>
            <p className="quiet compact">Showing {questions.length} questions. Use this as reference; follow Weekly Plan for commitment.</p>
          </div>
        </div>
        <div className="toolbar">
          <label>
            Search
            <div className="input-icon">
              <Search size={17} />
              <input
                onChange={(event) => onFilter({ ...filters, search: event.target.value })}
                placeholder="Problem, section, pattern"
                value={filters.search}
              />
            </div>
          </label>
          <label>
            Pattern
            <select onChange={(event) => onFilter({ ...filters, pattern: event.target.value })} value={filters.pattern}>
              {patterns.map((pattern) => (
                <option key={pattern}>{pattern}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select onChange={(event) => onFilter({ ...filters, status: event.target.value })} value={filters.status}>
              <option>All</option>
              <option>Todo</option>
              <option>Solved</option>
              <option>Revise</option>
            </select>
          </label>
          <label>
            Priority
            <select onChange={(event) => onFilter({ ...filters, priority: event.target.value })} value={filters.priority}>
              <option>All</option>
              <option>Core 100</option>
              <option>Supplemental</option>
              <option>Course-only</option>
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
            <div className="status-actions">
              <span className={`pill ${question.status.toLowerCase()}`}>{question.status}</span>
              {question.leetcode_verified_at ? <span className="verified">LeetCode verified</span> : null}
              <button onClick={() => onUpdate(question.id, "Solved")} type="button">Solved</button>
              <button className="warning" onClick={() => onUpdate(question.id, "Revise")} type="button">Revise</button>
              <button className="muted" onClick={() => onUpdate(question.id, "Todo")} type="button">Todo</button>
            </div>
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
                <h3>{day.dayIndex === 7 ? "Buffer and review" : "Focused commitment"}</h3>
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
                  <div className="mini-actions">
                    <span className={`pill ${milestone.status.toLowerCase()}`}>{milestone.status}</span>
                    <button onClick={() => onMilestoneUpdate(milestone.id, "Done")} type="button">Done</button>
                    <button className="warning" onClick={() => onMilestoneUpdate(milestone.id, "Revise")} type="button">Revise</button>
                    <button className="muted" onClick={() => onMilestoneUpdate(milestone.id, "Todo")} type="button">Todo</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="level-grid">
        {currentWeek.levels.map((level) => (
          <article className="panel" key={level.name}>
            <p className="label">{level.name}</p>
            <h3>{level.target}</h3>
            <div className="mini-question-list">
              {(grouped[level.name] || []).map((question) => (
                <div className="mini-question" key={question.id}>
                  <div>
                    <strong>{question.title}</strong>
                    <span>{question.pattern} · {question.difficulty} · {question.dsa_priority}</span>
                  </div>
                  <div className="mini-actions">
                    <span className={`pill ${question.status.toLowerCase()}`}>{question.status}</span>
                    <button onClick={() => onUpdate(question.id, "Solved")} type="button">Solved</button>
                    <button className="warning" onClick={() => onUpdate(question.id, "Revise")} type="button">Revise</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
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
