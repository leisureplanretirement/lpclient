# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

lpclient is the React + Vite frontend for LeisurePlan.app, built with Material UI 3.
All source code lives in `ux/src/`. Components are in `ux/src/components/`, API calls in `ux/src/api.js`.

## Build and Development Commands

- **Install dependencies**: `cd ux && npm install`
- **Start dev server**: `cd ux && npm run dev` (http://localhost:5173)
- **Build for production**: `cd ux && npm run build`
- **Deploy to GitHub Pages**: `cd ux && npm run deploy` (run on main branch only)
- **Run tests**: `cd ux && npm test`

## Pointing to local backend

By default, lpclient points to production (`hra6235cvu.us-east-2.awsapprunner.com`).
To use a local backend, change references in `src/api.js` and `.env` to `localhost:8080` (Docker) or `localhost:7299` (VS Code).

## Code Conventions

- React functional components with hooks
- Material UI 3 components and theme (`src/theme.js`)
- All API calls go through `src/api.js` — do not call fetch/axios directly in components
- State is managed locally in components or lifted to App.jsx; no Redux/Zustand

---

## Current Task: Billing System Implementation

Read `~/lpcode/BILLING_API.md` for the full contract before writing any code.
The backend endpoints are being built in parallel — use the contract as the source of truth.

### What to build

1. **`BalanceDisplay` component** (`src/components/BalanceDisplay.jsx`)
   - Shows the user's balance as a formatted dollar amount (e.g., `$12.45`)
   - On login/mount: fetches `GET /api/Billing/Balance` and stores result
   - After each simulation: reads `balanceUsd` from the simulation response and updates display — no extra fetch needed
   - Add to the Banner/top bar so it's always visible

2. **`AddFundsButton` component** (`src/components/AddFundsButton.jsx`)
   - Presents three options: $10, $25, $50 (map each to its Stripe priceId from `.env`)
   - On selection: calls `POST /api/Billing/TopUp` with `{ priceId }`, then does `window.location.href = checkoutUrl`

3. **`BillingPage` component** (`src/pages/Billing.jsx`) — route `/billing`
   - This is where ALL payment UI lives. Nothing payment-related is shown on the main chat page.
   - Contents:
     - Current balance (large, prominent; shown in warning colour if negative)
     - `AddFundsButton` with $10 / $25 / $50 options
     - On mount, detect `?payment=success` in the URL: call `GET /api/Billing/Balance`, refresh `BalanceDisplay`, show a MUI `Snackbar` confirmation, then remove the query param from the URL
   - Add `/billing` to the React Router config and add a "Billing" link in the navigation Menu

4. **`AddFundsButton` component** (`src/components/AddFundsButton.jsx`)
   - Used inside `BillingPage` only
   - Presents three options: $10, $25, $50 (map to Stripe priceIds from `.env`)
   - On selection: calls `POST /api/Billing/TopUp` with `{ priceId }`, then `window.location.href = checkoutUrl`
   - Stripe success_url should return to `/billing?payment=success`

5. **Updates to `src/api.js`**
   - Add `getBillingBalance()` — `GET /api/Billing/Balance`
   - Add `createTopUpSession(priceId)` — `POST /api/Billing/TopUp`
   - Update the simulation call to read and return `balanceUsd` and `queryUsd` from the response

6. **Updates to existing chat flow (App.jsx)**
   - Pass `balanceUsd` and `queryUsd` from simulation response up to `BalanceDisplay`
   - Intercept 402 responses from `POST /api/Chat`: show a brief MUI `Snackbar` or `Alert` that includes both `balanceUsd` and `estimatedQueryUsd` from the 402 body (e.g. "Your balance is $1.23 but this query needs approx. $2.50.") with a **"Go to Billing"** button navigating to `/billing`. Do **not** show payment UI inline. The chat input should be disabled until the user returns with sufficient balance.

### Balance display rules
- Balance sufficient: show normally
- 402 received: show balance in warning colour (red/amber) alongside the estimated shortfall

### Environment variables (add to `ux/.env`)
```
VITE_STRIPE_PRICE_10=price_xxx
VITE_STRIPE_PRICE_25=price_xxx
VITE_STRIPE_PRICE_50=price_xxx
```
