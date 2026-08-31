# GH-76: Anonymous Trial Queries — Client Changes

Tracks the `lpclient` side of GH-76 ("Allow user to run 5 queries before forcing them to log in"). The backend piece (anon identity, quota enforcement) is being implemented in `lpserver`. This document covers what changes on the client once that backend contract exists. Not yet implemented — reference for when this work starts.

## Background

Today, `ChatWindow.jsx` fully disables the chat input unless `isAuthenticated` is `true` (Auth0 React SDK's `useAuth0().isAuthenticated`). There is no anonymous access path at all. GH-76 introduces one: an unauthenticated visitor can send up to 5 chat queries before being required to log in.

## How auth currently works (context, unchanged by this ticket)

- `Auth0Provider` (`main.jsx`) wraps the app; `useAuth0()` exposes `isAuthenticated` as a client-side signal.
- Authenticated API calls attach a JWT via `getAccessTokenSilently()` as `Authorization: Bearer <token>` (`api.js`).
- The server independently validates that JWT and derives a deterministic `userId` from its `sub` claim — the client's `isAuthenticated` flag is never trusted by the server on its own.

## Server contract this client work depends on

- Anonymous visitors are identified by a signed, `HttpOnly` cookie the server sets on first unauthenticated request. The client does not generate, read, or manage this cookie's value directly — the browser handles it automatically, as long as requests are made with credentials included (see below).
- **Precedence:** if a request carries a valid JWT, the server treats the caller as the authenticated user and ignores any anon cookie present. The anon cookie only matters when there's no valid JWT. (Relevant if someone uses free queries, then logs in in the same browser without a refresh — both could be present on a request; server-side JWT always wins.)
- Once the anon quota (5, server-side constant) is exhausted, the chat endpoint responds `HTTP 429` with a JSON body `{ "error": "anonymous_quota_exceeded" }` instead of processing the query. **Deliberately not 403** — `api.js`'s `throwOnError` already hard-codes `res.status === 403` to mean "account canceled" (`CanceledAccountError`), unconditionally, before it even looks at the response body. Reusing 403 for the quota case would get misclassified as a canceled account. 429 (Too Many Requests) is also the more semantically correct code for a spent quota.
- On successful login (the existing `POST /User/Login` call the client already makes post-auth), the server clears the anon cookie so it doesn't linger once the visitor is a real logged-in user. No client action needed for this beyond continuing to call that endpoint as it already does.

## Required client changes

### 1. Allow chat input before authentication, up to the quota
`ChatWindow.jsx` currently gates the input purely on `isAuthenticated`:
```js
disabled={loading || !isAuthenticated || isImpersonating || lowBalance}
```
This needs to allow sending while unauthenticated, until the server tells the client the quota is spent (see #3). The `isAuthenticated`-only gate becomes something like "authenticated OR still has anonymous attempts remaining" (exact state tracking TBD — could be inferred purely from server responses rather than a client-tracked counter, to avoid the client's count ever drifting from the server's).

Copy changes needed alongside this:
- Placeholder text (`"Please login."` → something like `"Type your question..."` for anon visitors too)
- Empty-state message (`"To start, please login."` → reflect that a trial is available)

### 2. Send credentials on chat API calls
`fetch` calls in `api.js` don't currently need to carry cookies (auth is bearer-token only). For the anon cookie to round-trip, the chat request(s) need `credentials: 'include'`. This also requires the backend's CORS policy to allow credentials with an explicit origin (not `*`) — a backend-side prerequisite, not a client change, but noted here since it'll break silently if missed.

### 3. Handle the quota-exceeded response
When a chat call returns `429` with `{ "error": "anonymous_quota_exceeded" }`, the client should:
- Stop treating this as a generic error toast.
- Prompt the visitor to log in — likely reusing the existing Auth0 login trigger, presented via a dialog similar in spirit to the existing "Login Failed" dialog in `App.jsx`, rather than a generic error message.
- Disable further sends until they authenticate (mirrors today's disabled-input behavior for unauthenticated users, just reached after the trial instead of immediately).

Concretely, this means adding a new error class and branch in `api.js`, following the existing pattern (`InsufficientBalanceError` for 402, `CanceledAccountError` for 403):
```js
export class AnonymousQuotaExceededError extends Error {
  constructor() {
    super('Anonymous quota exceeded');
    this.name = 'AnonymousQuotaExceededError';
  }
}
```
and in `throwOnError`, add an independent branch — `if (res.status === 429) throw new AnonymousQuotaExceededError();` — alongside (not replacing) the existing `403`/`402`/`500` branches.

### 4. Nothing needed for cookie/JWT precedence itself
No client-side branching is required to choose between the anon cookie and the JWT — the browser attaches whichever is present automatically, and the server resolves precedence. The client's job is just to ensure `credentials: 'include'` is set so the cookie is ever sent at all.

## Open UX decisions (not yet settled — flag before/during implementation)

- Should remaining query count ("3 free questions left") be surfaced in the UI, and if so, is that count client-tracked (simple, but can drift from server truth) or read back from a server response header/field on each chat call (authoritative, needs a small server addition beyond the current 403-only contract)?
- Exact copy/wording for the trial-mode placeholder, empty state, and the login-prompt dialog triggered by quota exhaustion.
- Whether the login-prompt dialog should auto-trigger the Auth0 login redirect, or just present a "Log In" button for the visitor to click.

## Out of scope for this document

- Anon identity generation, quota storage, and enforcement — all server-side (`lpserver`).
- Cost/billing tracking for anonymous queries — explicitly dropped from GH-76's scope.
- Any migration of anonymous session data into a real account after login — explicitly not happening; visitors start fresh after logging in.
