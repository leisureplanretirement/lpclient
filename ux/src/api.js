// API utility for chat backend
const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

// Custom error for 500 responses with details
export class ApiError extends Error {
  constructor(message, details) {
    super(message);
    this.details = details;
    this.name = 'ApiError';
  }
}

// Helper to build headers with optional auth token and impersonation
function buildHeaders(token, includeImpersonation = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (includeImpersonation) {
    try {
      const stored = localStorage.getItem('impersonation');
      if (stored) {
        const { enabled, subject } = JSON.parse(stored);
        if (enabled && subject && subject.trim()) {
          headers['X-Impersonate-Subject'] = subject.trim();
        }
      }
    } catch {}
  }
  return headers;
}

// POST /api/chat
export async function sendMessage(message, sessionId, token) {
  const payload = { message };
  if (sessionId) payload.sessionId = sessionId;
  const res = await fetch(`${API_BASE}/Chat`, {
    method: 'POST',
    headers: buildHeaders(token, false),
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 500) {
      const firstLine = text.split('\n')[0];
      const details = text.includes('\n') ? text : null;
      throw new ApiError(firstLine, details);
    }
    throw new Error(text);
  }
  return JSON.parse(text);
}

// GET /api/chat/History
export async function fetchChatHistory(token) {
  const res = await fetch(`${API_BASE}/Chat/History`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load chat history');
  return JSON.parse(text);
}

// GET /api/chat/Dialog?sessionId=...
// Returns structured JSON array with { sender, text, timestamp, queryId } objects
export async function fetchChatDialog(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/Dialog?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load chat dialog');
  return JSON.parse(text);
}

// GET /api/chat/RetirementCalculatorInputs?sessionId=...&queryId=...
export async function fetchRetirementInputs(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/RetirementCalculatorInputs?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load retirement inputs');
  return JSON.parse(text);
}

// GET /api/chat/Chart?sessionId=...&queryId=...&chartType=...
export async function fetchChart(sessionId, queryId, chartType, token) {
  const res = await fetch(`${API_BASE}/Chat/Chart?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}&chartType=${encodeURIComponent(chartType)}`, {
    headers: buildHeaders(token)
  });
  const blob = await res.blob();
  if (!res.ok) throw new Error('Failed to load chart');
  return blob;
}

// GET /api/Chat/LatestChart?sessionId=...&chartType=...
export async function fetchLatestChart(sessionId, chartType, token) {
  const res = await fetch(`${API_BASE}/Chat/LatestChart?sessionId=${encodeURIComponent(sessionId)}&chartType=${encodeURIComponent(chartType)}`, {
    headers: buildHeaders(token)
  });
  const blob = await res.blob();
  if (!res.ok) throw new Error('Failed to load latest chart');
  return blob;
}

// GET /api/chat/QueryStatus?sessionId=...&queryId=...
export async function fetchQueryStatus(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/QueryStatus?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  const trimmedText = text.trim();
  if (!res.ok) throw new Error('Failed to fetch query status');
  return trimmedText;
}

// GET /api/chat/FlowsTable?sessionId=...&queryId=...
export async function fetchFlowsTable(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/FlowsTable?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throw new Error('Failed to load flows table');
  return html;
}

// GET /api/Chat/LatestFlowsTable?sessionId=...
export async function fetchLatestFlowsTable(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/LatestFlowsTable?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throw new Error('Failed to load latest flows table');
  return html;
}

// GET /api/Chat/AnnualTable?sessionId=...&queryId=...
export async function fetchAnnualTable(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/AnnualTable?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throw new Error('Failed to load annual table');
  return html;
}

// GET /api/Chat/SummaryTable?sessionId=...&queryId=...
export async function fetchSummaryTable(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/SummaryTable?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load summary table');
  return text;
}

// GET /api/Chat/LatestSummaryTable?sessionId=...
export async function fetchLatestSummaryTable(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/LatestSummaryTable?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load latest summary table');
  return text;
}

// GET /api/Chat/LatestAnnualTable?sessionId=...
export async function fetchLatestAnnualTable(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/LatestAnnualTable?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throw new Error('Failed to load latest annual table');
  return html;
}

// GET /api/Chat/SubAgentContext?sessionId=...&queryId=...&task=...
export async function fetchSubAgentContext(sessionId, queryId, task, token) {
  const res = await fetch(`${API_BASE}/Chat/SubAgentContext?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}&task=${encodeURIComponent(task)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load sub-agent context');
  return JSON.parse(text);
}

// GET /api/Chat/SubAgentResponse?sessionId=...&queryId=...&task=...
export async function fetchSubAgentResponse(sessionId, queryId, task, token) {
  const res = await fetch(`${API_BASE}/Chat/SubAgentResponse?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}&task=${encodeURIComponent(task)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load sub-agent response');
  return JSON.parse(text);
}

// GET /api/Chat/IsAdministrator
export async function fetchIsAdministrator(token) {
  const res = await fetch(`${API_BASE}/Chat/IsAdministrator`, {
    headers: buildHeaders(token, false)
  });
  const text = await res.text();
  if (!res.ok) return false;
  return text.trim().toLowerCase() === 'true';
}

// GET /api/Session/List
export async function fetchSessionList(token) {
  const res = await fetch(`${API_BASE}/Session/List`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load session list');
  return JSON.parse(text);
}

// GET /api/Chat/Session?sessionId=...
export async function fetchSession(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/Session?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load session');
  return JSON.parse(text);
}

// DELETE /api/Session/{sessionId}
export async function deleteSession(sessionId, token) {
  const res = await fetch(`${API_BASE}/Session/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    headers: buildHeaders(token, false)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to delete session');
  }
}

// GET /api/Billing/Records?from=...&to=...
export async function fetchBillingRecords(token, from, to) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/Billing/Records${query}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throw new Error('Failed to load billing records');
  return JSON.parse(text);
}

// PUT /api/Session/Update
export async function updateSession(sessionId, name, token) {
  const res = await fetch(`${API_BASE}/Session/Update`, {
    method: 'PUT',
    headers: buildHeaders(token, false),
    body: JSON.stringify({ sessionId, name })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to update session');
  }
}
