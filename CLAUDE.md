# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `AGENTS.md` for the full project guide (architecture, data model, coding conventions, and non-obvious decisions) — read it before making changes. Key points repeated here for quick reference:

## Commands

- `npm install` — install dependencies
- `netlify dev --port 8889` — run frontend + Netlify Functions + Netlify Database together (recommended for local dev; the app needs `/api/items` and `/api/products/:query` to function)
- `npm run dev` — Vite dev server only (port 3000, functions unavailable)
- `npm run build` — production build (`vite build`, outputs to `dist/client`)
- `npx drizzle-kit generate` — generate a migration after editing `db/schema.ts`; Netlify applies migrations from `netlify/database/migrations/` during deploy

There is no configured lint or test script in `package.json`.

## Architecture

- TanStack Start (React 19) frontend in `src/routes/`; `src/routes/index.tsx` holds the entire single-page grocery experience.
- Two Netlify Functions provide the server API: `netlify/functions/items.mts` (CRUD for `/api/items`) and `netlify/functions/products.mts` (proxies Open Food Facts at `/api/products/:query`).
- `db/schema.ts` is the source of truth for the Drizzle schema; `db/index.ts` builds the Netlify Database Drizzle client. All persistent data lives in the single `grocery_items` Postgres table, with `list_type` distinguishing pantry stock from manual shopping-list entries.
- Shopping suggestions (low-stock, expired) are derived client-side from pantry records rather than stored, so they always reflect current quantities/dates.
- No authentication exists; a deployed instance represents one shared household pantry.
