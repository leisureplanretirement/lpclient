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
