# Shelfie Project Guide

## Overview

Shelfie is a responsive pantry and grocery-list application built with TanStack Start, React, Netlify Functions, and Netlify Database. It tracks pantry quantities and expiration dates, derives shopping suggestions, supports a focused in-store mode, and can identify products with a device camera or manual Open Food Facts search.

## Architecture

- `src/routes/__root.tsx` defines the document shell and site metadata.
- `src/routes/index.tsx` contains the interactive single-page grocery experience and its feature components.
- `src/styles.css` contains the global visual system, responsive layouts, and component states.
- `netlify/functions/items.mts` exposes persistent grocery-item CRUD routes at `/api/items`.
- `netlify/functions/products.mts` proxies barcode and name searches to Open Food Facts at `/api/products/:query`.
- `db/schema.ts` is the source of truth for the Drizzle database schema.
- `db/index.ts` creates the Netlify Database Drizzle client.
- `netlify/database/migrations/` contains generated migrations applied by Netlify during deploys.

## Data Model

All persistent grocery records live in the `grocery_items` Postgres table. `list_type` distinguishes pantry stock from manually entered shopping-list items. Low-stock and expired shopping suggestions are derived from pantry records in the client so they always reflect current quantities and dates.

The items API inserts a small starter pantry only when the database is completely empty. These records make the first-run experience immediately understandable and can be edited or deleted like any other item.

## Coding Conventions

- Use TypeScript with strict typing and type-only imports where applicable.
- Use PascalCase for React components and camelCase for functions, hooks, and state.
- Keep route-specific UI in `src/routes/` unless a component becomes reusable across routes.
- Use the existing CSS custom properties and organic visual language instead of introducing a second styling system.
- Use Lucide icons rather than hand-authored interface SVGs.
- Keep all persistent application data in Netlify Database; do not add local JSON or in-memory storage.
- Define database changes in `db/schema.ts`, then generate a migration with `npx drizzle-kit generate`.
- Keep Open Food Facts requests server-side through the existing Netlify Function.

## Non-Obvious Decisions

- Camera scanning uses the browser `BarcodeDetector` and `getUserMedia` APIs. Unsupported browsers fall back to barcode entry and product-name search.
- Shopping suggestions are intentionally computed from pantry state rather than duplicated in the database.
- Camera access requires HTTPS in production; Netlify-hosted deployments provide this automatically.
- The application has no authentication, so the deployed site currently represents one shared household pantry.

## Local Development

Use `netlify dev --port 8889` from the project root so the frontend, functions, and Netlify Database integration are available together.
