# Shelfie

Shelfie is an interactive grocery manager for keeping a pantry organized and a shopping list current. It highlights food that is expiring, suggests low-stock items for the next shop, and provides a large-format mobile shopping mode for checking items off in the store.

## Features

- Pantry quantities, restock thresholds, and expiration tracking
- Automatic low-stock and expired-item shopping suggestions
- Persistent manual shopping list with check-off state
- Mobile-first shopping mode with progress feedback
- Camera barcode scanning with manual barcode fallback
- Product-name and barcode lookup through Open Food Facts
- Responsive empty, loading, error, and first-run states

## Technology

- React 19 and TanStack Start
- TypeScript and Vite
- Netlify Functions for server-side APIs
- Netlify Database with Drizzle ORM and managed Postgres
- Open Food Facts for product metadata
- Lucide React icons and a custom responsive CSS system

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app with Netlify’s local runtime:

   ```bash
   netlify dev --port 8889
   ```

3. Open `http://localhost:8889`.

Using Netlify Dev is recommended because it runs the TanStack frontend and the `/api/items` and `/api/products/:query` functions together. Netlify Database is provisioned automatically when the application first connects.

Camera barcode scanning requires a supported browser and camera permission. When live scanning is unavailable, the add-item flow accepts a barcode number or product name instead.

## Database Changes

The database schema lives in `db/schema.ts`. After changing it, generate a deployable migration with:

```bash
npx drizzle-kit generate
```

Netlify applies migrations from `netlify/database/migrations/` during deployment.
