const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  metrics: () => request("/metrics"),
  roadmap: () => request("/roadmap"),
  weeklyPlan: () => request("/weekly-plan"),
  questions: (params) => request(`/questions?${new URLSearchParams(params)}`),
  updateQuestion: (id, payload) =>
    request(`/questions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  logs: () => request("/logs"),
  addLog: (payload) =>
    request("/logs", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
