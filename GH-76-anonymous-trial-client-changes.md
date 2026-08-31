# GH-76: Anonymous Trial Queries — Client Changes

Tracks the `lpclient` side of GH-76 ("Allow user to run 5 queries before forcing them to log in"). The backend piece (anon identity, quota enforcement) is being implemented in `lpserver`. This document covers what changes on the client once that backend contract exists. Not yet implemented — reference for when this work starts.

## Background

Today, `ChatWindow.jsx` fully disables the chat input unless `isAuthenticated` is `true` (Auth0 React SDK's `useAuth0().isAuthenticated`). There is no anonymous access path at all. GH-76 introduces one: an unauthenticated visitor can send up to 5 chat queries before being required to log in.

## How auth currently works (context, unchanged by this ticket)

- `Auth0Provider` (`main.jsx`) wraps the app; `useAuth0()` exposes `isAuthenticated` as a client-side signal.
- Authenticated API calls attach a JWT via `getAccessTokenSilently()` as `Authorization: Bearer <token>` (`api.js`).
- The server independently validates that JWT and derives a deterministic `userId` from its `sub` claim — the client's `isAuthenticated` flag is never trusted by the server on its own.

## Server contract this client work depends on

- **Anonymous visitors are identified by an opaque token carried in a custom `X-Anon-Id` request/response header — not a cookie.** A cookie was the original plan, but it turned out to be a third-party cookie (frontend and API are on different origins), which Chrome blocks by default regardless of `SameSite`/`Secure` attributes — confirmed by testing. The client is responsible for persisting this token itself (e.g. `localStorage`) and attaching it explicitly; nothing about it is automatic the way a cookie would be.
  - On any anon-eligible call with no `X-Anon-Id` request header (or one the server can't validate), the server mints a new identity and returns it via an `X-Anon-Id` **response** header.
  - The client should check every response from an anon-eligible call for that header and persist it (it may not be present if the client already sent a valid one — nothing changed — but should always be captured when it is present).
- **Precedence:** if a request carries a valid JWT, the server treats the caller as the authenticated user and ignores any `X-Anon-Id` header present. The anon header only matters when there's no valid JWT. (Relevant if someone uses free queries, then logs in in the same browser without a refresh — both could be present on a request; server-side JWT always wins.)
- Once the anon quota (5, server-side constant) is exhausted, the chat endpoint responds `HTTP 429` with a JSON body `{ "error": "anonymous_quota_exceeded" }` instead of processing the query. **Deliberately not 403** — `api.js`'s `throwOnError` already hard-codes `res.status === 403` to mean "account canceled" (`CanceledAccountError`), unconditionally, before it even looks at the response body. Reusing 403 for the quota case would get misclassified as a canceled account. 429 (Too Many Requests) is also the more semantically correct code for a spent quota.
- On successful login, there's nothing for the server to clear — there's no server-held cookie any more. **This is now purely a client-side step:** clear the stored `X-Anon-Id` token from `localStorage` once login succeeds, so it doesn't keep getting sent (and ignored) on requests from a now-known user.

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

### 2. Persist and attach the anon token via a header, not credentials
No `credentials: 'include'` needed — this isn't cookie-based. Instead:
- Add a small helper to read/write the anon token in `localStorage` (e.g. under a key like `lp_anon_id`).
- On every anon-eligible call (`sendMessage`, `fetchQueryStatus`, `fetchChatDialog`, `fetchSession`, the chart/table fetchers), attach the stored token as an `X-Anon-Id` request header when present — likely via `buildHeaders()`, alongside how it already conditionally adds `Authorization`.
- After each such call, read `res.headers.get('X-Anon-Id')` and persist it to `localStorage` if present (it will be on the first anonymous call, and any time the server had to re-mint one; typically absent otherwise).
- No CORS/credentials prerequisite on the backend for this — the header approach doesn't need `AllowCredentials()`, just `Access-Control-Expose-Headers` to include `X-Anon-Id` (already handled server-side), since custom response headers aren't readable via `fetch()` by default.

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

### 4. Nothing needed for anon-header/JWT precedence itself
No client-side branching is required to choose between the anon token and the JWT — send whichever is available (`Authorization` when logged in, `X-Anon-Id` when not; both could technically go out if a stale anon token wasn't cleared yet, and the server resolves precedence in that case). The client's job is just to attach the header and clear the stored token on login (see above).

## Open UX decisions (not yet settled — flag before/during implementation)

- Should remaining query count ("3 free questions left") be surfaced in the UI, and if so, is that count client-tracked (simple, but can drift from server truth) or read back from a server response header/field on each chat call (authoritative, needs a small server addition beyond the current 429-only contract)?
- Exact copy/wording for the trial-mode placeholder, empty state, and the login-prompt dialog triggered by quota exhaustion.
- Whether the login-prompt dialog should auto-trigger the Auth0 login redirect, or just present a "Log In" button for the visitor to click.

## Out of scope for this document

- Anon identity generation, quota storage, and enforcement — all server-side (`lpserver`).
- Cost/billing tracking for anonymous queries — explicitly dropped from GH-76's scope.
- Any migration of anonymous session data into a real account after login — explicitly not happening; visitors start fresh after logging in.
