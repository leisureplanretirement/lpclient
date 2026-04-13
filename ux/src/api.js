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

// Custom error for 402 Payment Required
export class InsufficientBalanceError extends Error {
  constructor(balanceUsd, message) {
    super(message || 'Insufficient balance');
    this.balanceUsd = balanceUsd;
    this.name = 'InsufficientBalanceError';
  }
}

// Custom error for 403 with userStatus: Canceled
export class CanceledAccountError extends Error {
  constructor() {
    super('Account canceled');
    this.name = 'CanceledAccountError';
  }
}

// Shared error handler for non-ok text responses
function throwOnError(res, text) {
  if (res.status === 403) throw new CanceledAccountError();
  let body;
  try { body = JSON.parse(text); } catch { body = {}; }
  if (res.status === 402) throw new InsufficientBalanceError(body.balanceUsd ?? null, body.message);
  if (res.status === 500) {
    const firstLine = text.split('\n')[0];
    const details = text.includes('\n') ? text : null;
    throw new ApiError(firstLine, details);
  }
  throw new Error(text);
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
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/chat/History
export async function fetchChatHistory(token) {
  const res = await fetch(`${API_BASE}/Chat/History`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/chat/Dialog?sessionId=...
// Returns structured JSON array with { sender, text, timestamp, queryId } objects
export async function fetchChatDialog(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/Dialog?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/chat/RetirementCalculatorInputs?sessionId=...&queryId=...
export async function fetchRetirementInputs(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/RetirementCalculatorInputs?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
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
// Returns { status, balanceUsd?, queryCostUsd? }
export async function fetchQueryStatus(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/QueryStatus?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/chat/FlowsTable?sessionId=...&queryId=...
export async function fetchFlowsTable(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/FlowsTable?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throwOnError(res, html);
  return html;
}

// GET /api/Chat/LatestFlowsTable?sessionId=...
export async function fetchLatestFlowsTable(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/LatestFlowsTable?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throwOnError(res, html);
  return html;
}

// GET /api/Chat/AnnualTable?sessionId=...&queryId=...
export async function fetchAnnualTable(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/AnnualTable?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throwOnError(res, html);
  return html;
}

// GET /api/Chat/SummaryTable?sessionId=...&queryId=...
export async function fetchSummaryTable(sessionId, queryId, token) {
  const res = await fetch(`${API_BASE}/Chat/SummaryTable?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return text;
}

// GET /api/Chat/LatestSummaryTable?sessionId=...
export async function fetchLatestSummaryTable(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/LatestSummaryTable?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return text;
}

// GET /api/Chat/LatestAnnualTable?sessionId=...
export async function fetchLatestAnnualTable(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/LatestAnnualTable?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const html = await res.text();
  if (!res.ok) throwOnError(res, html);
  return html;
}

// GET /api/Chat/SubAgentContext?sessionId=...&queryId=...&task=...
export async function fetchSubAgentContext(sessionId, queryId, task, token) {
  const res = await fetch(`${API_BASE}/Chat/SubAgentContext?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}&task=${encodeURIComponent(task)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/Chat/SubAgentResponse?sessionId=...&queryId=...&task=...
export async function fetchSubAgentResponse(sessionId, queryId, task, token) {
  const res = await fetch(`${API_BASE}/Chat/SubAgentResponse?sessionId=${encodeURIComponent(sessionId)}&queryId=${encodeURIComponent(queryId)}&task=${encodeURIComponent(task)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/Chat/IsAdministrator
export async function postUserLogin(token) {
  const res = await fetch(`${API_BASE}/User/Login`, {
    method: 'POST',
    headers: buildHeaders(token, false),
  });
  if (!res.ok) {
    if (res.status === 403) throw new CanceledAccountError();
    return null;
  }
  return res.json();
}

export async function fetchIsAdministrator(token) {
  const res = await fetch(`${API_BASE}/Chat/IsAdministrator`, {
    headers: buildHeaders(token, false)
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 403) throw new CanceledAccountError();
    return false;
  }
  return text.trim().toLowerCase() === 'true';
}

// GET /api/Session/List
export async function fetchSessionList(token) {
  const res = await fetch(`${API_BASE}/Session/List`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/Chat/Session?sessionId=...
export async function fetchSession(sessionId, token) {
  const res = await fetch(`${API_BASE}/Chat/Session?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
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
    throwOnError(res, text);
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
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// POST /api/billing/Cancel
export async function cancelAccount(token) {
  const res = await fetch(`${API_BASE}/billing/Cancel`, {
    method: 'POST',
    headers: buildHeaders(token),
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/billing/DiscountCodes
export async function getDiscountCodes(token) {
  const res = await fetch(`${API_BASE}/billing/DiscountCodes`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// PUT /api/billing/DiscountCodes
export async function putDiscountCodes(codes, token) {
  const res = await fetch(`${API_BASE}/billing/DiscountCodes`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({ codes }),
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// GET /api/billing/Balance
export async function getBillingBalance(token) {
  const res = await fetch(`${API_BASE}/billing/Balance`, {
    headers: buildHeaders(token)
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
  return JSON.parse(text);
}

// POST /api/billing/TopUp
export async function createTopUpSession(priceId, token) {
  const res = await fetch(`${API_BASE}/billing/TopUp`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({ priceId }),
  });
  const text = await res.text();
  if (!res.ok) throwOnError(res, text);
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
    throwOnError(res, text);
  }
}
