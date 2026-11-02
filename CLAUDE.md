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

### Balance display rules
- Balance sufficient: show normally
- 402 received: show balance in warning colour (red/amber) alongside the estimated shortfall

### Math rendering in ChatWindow
Assistant messages are rendered via `ReactMarkdown` with `remark-math` and `rehype-katex`. The LLM backend outputs LaTeX using `\[...\]` (display) and `\(...\)` (inline) delimiters, but `remark-math` expects `$$...$$` and `$...$`. A `normalizeLatexDelimiters` function in [ChatWindow.jsx](ux/src/components/ChatWindow.jsx) preprocesses `msg.text` before rendering:
- Converts `\[...\]` → `$$...$$` and `\(...\)` → `$...$`
- Within those blocks, replaces `\$` and `$` (currency amounts the LLM writes as e.g. `\$479`) with the fullwidth `＄` so they don't terminate the math expression early
- Outside math blocks, also replaces `$NNN` currency patterns with `＄` to prevent stray dollar signs from being paired as math delimiters

`singleDollarTextMath` is left at its default (enabled) so `$...$` inline math works.

### Environment variables (add to `ux/.env`)
```
VITE_STRIPE_PRICE_10=price_xxx
VITE_STRIPE_PRICE_25=price_xxx
VITE_STRIPE_PRICE_50=price_xxx
```

## Audience and look (youth-reskin)

The app now targets 20–30 year olds who want budgeting help, financial education and, above all, emotional security; copy should be warm, plain and never judgmental. The "Gilded Calm" theme lives in `src/theme.js`: use `theme.palette.brand` tokens (teal, coral, gold, plum, parchment, surface, line, ink, inkSoft…) and `fonts.display` (Fraunces) for headings instead of hardcoded colours, so light and dark mode both work.

### Portraits and wins
- `src/avatar/avatarSchema.js` is the avatar vocabulary; it must match lpserver's `Community/Avatar/AvatarCatalog.cs`. `AvatarPortrait.jsx` renders a spec as SVG; `AvatarGallery.jsx` is an unrouted visual-QA grid.
- `src/pages/PortraitStudio.jsx` (`/portrait`) builds the avatar through conversation: the server painter (`POST /api/Profile/AvatarChat`) when logged in, the offline `src/avatar/localPainter.js` otherwise or on failure.
- The coach marks prudent decisions with `🏅 **Win:** … {win:<key>}`. `src/wins.js` strips the marker (ChatWindow renders a badge instead) and records the win — server for members, local storage for visitors. Wins are only claimed for fresh replies, never when reloading history.

### Community
`src/pages/Community.jsx` (`/community`) and `CommunityThread.jsx` (`/community/:postId`), with shared pieces in `src/components/community/`. Moderation rejections arrive as `ModerationError` (HTTP 422) and are shown gently next to the draft; post bodies are rendered as plain text, never HTML/markdown.

### Running against a local server
`scripts/start-local.sh` runs the dev server on :5173 against a local Web.Api (default `http://127.0.0.1:7299`). Start the server side first with lpserver's `scripts/local-test/start-model.sh` and `start-server.sh`; full instructions in lpserver `Documents/LocalDevelopment.md`.

### Installing
`npm install` fails on the `node` package's install script; use `npm install --ignore-scripts`.
