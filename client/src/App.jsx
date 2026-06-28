import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, CalendarDays, CheckCircle2, Database, ExternalLink, RefreshCcw, Search } from "lucide-react";
import { api } from "./lib/api.js";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "questions", label: "DSA Bank", icon: Database },
  { id: "logs", label: "Daily Log", icon: CalendarDays },
  { id: "roadmap", label: "Roadmap", icon: BookOpen }
];

const today = () => new Date().toISOString().slice(0, 10);

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [metrics, setMetrics] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [logs, setLogs] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ search: "", pattern: "All", status: "All", limit: "120" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadApp() {
    setIsLoading(true);
    setError("");
    try {
      const [metricsResult, roadmapResult, logsResult, questionsResult] = await Promise.all([
        api.metrics(),
        api.roadmap(),
        api.logs(),
        api.questions(filters)
      ]);
      setMetrics(metricsResult);
      setRoadmap(roadmapResult.roadmap);
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
      await Promise.all([loadQuestions(), api.metrics().then(setMetrics)]);
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
          <p>Three-month switch plan with DSA tracking, mocks, and study analytics.</p>
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
  const solvedPercent = metrics?.total ? Math.round((metrics.solved / metrics.total) * 100) : 0;
  const reviseQueue = questions.filter((question) => question.status === "Revise").slice(0, 5);

  return (
    <div className="view-stack">
      <section className="metrics-grid">
        <Metric label="Solved" value={`${metrics?.solved || 0}/${metrics?.total || 0}`} helper={`${solvedPercent}% complete`} />
        <Metric label="Revise" value={metrics?.revise || 0} helper="items needing another pass" />
        <Metric label="Study" value={`${metrics?.minutes || 0}m`} helper={`${metrics?.sessions || 0} logged sessions`} />
        <Metric label="Mocks" value={metrics?.mocks || 0} helper="interview simulations" />
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
        </div>
      </section>

      <section className="question-grid">
        {questions.map((question) => (
          <article className="question-card" key={question.id}>
            <div>
              <strong>{question.source_order}. {question.title}</strong>
              <p>{question.section} · {question.pattern} · {question.difficulty} · {question.duration || "self-paced"}</p>
              <div className="resource-links">
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
