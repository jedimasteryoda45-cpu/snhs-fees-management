# SNHS · School Fee Management

A polished, responsive school fee management demo built with React, TypeScript, Tailwind CSS, Recharts, Lucide, and Vite. No backend, authentication server, database, or external APIs.

School: **Shanthinikethan High School**.

## Deploy to Vercel

1. Commit and push this project, including `package-lock.json` and `vercel.json`, to your GitHub repository.
2. In Vercel, select **Add New → Project** and import `snhs-fees-management`.
3. Keep **Root Directory** at the repository root (`./`). The checked-in configuration supplies:

   | Setting | Value |
   | --- | --- |
   | Framework Preset | Vite |
   | Node.js Version | 24.x |
   | Install Command | `npm ci` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Environment Variables | None required |

4. Click **Deploy**.

For a CLI deployment, run `npx vercel --prod` from this project directory and follow Vercel's login/project prompts.

Navigation uses URL hashes (for example, `/#students`), so page links and refreshes work on static hosting without SPA rewrite rules. Vercel builds the frontend from source; do not commit `node_modules`, `dist`, or `.vercel`.

The deployed URL starts with the sample dataset. Data saved on localhost does not transfer to Vercel; each browser and origin has its own localStorage. Deployment retains the frontend-only demo behavior.

## Run locally

Use Node.js 24 (also specified in `.nvmrc` and `package.json`).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

```sh
npm run build   # Type-check and create dist/
npm run preview # Preview the production build
npm test        # Verify financial ledger invariants
```

## Features

- Dashboard with six dynamic KPIs, monthly trends, class comparisons, payment distribution, collection target, and recent transactions.
- 480 fictional students in Classes 1–10, 48 per class, with realistic fee structures and payments across April–November.
- Searchable, sortable, paginated student list; class/status filters; add/edit forms; student details and payment history.
- Class cards link directly to filtered student records.
- Pending fees with class breakdown, minimum amount, status, and overdue duration filters.
- Simulated payments by Cash, UPI, and Bank Transfer, with balance validation, receipt preview, CSV download, and printing.
- Transaction search, class/method/month filters, and CSV export.
- Daily/monthly/annual collections, class fees, outstanding balances, and payment method reports.
- Editable school profile, global search (Ctrl/Cmd K), responsive navigation, accessible dialogs, and reset demo controls.

## Data and calculations

The demo reference date is **6 November 2026**, within the **2026–27 academic year** (April–March). This is intentionally fixed for a reproducible demonstration.

Annual expected fees are the sum of student fees. Collected fees come exclusively from the transaction ledger. Outstanding is expected minus collected. A defaulter has a positive balance with a due date before the reference date. Partially paid and unpaid students with future due dates are pending but not overdue. All charts and pages use these same records.

Dashboard comparisons use the end of October, with monthly collection pace compared against the first six days of October. Enrollment and expected fee comparisons use admission dates; fee edits are corrections to the current annual fee rather than historical revisions. Reports explicitly separate period collections from annual expected/outstanding balances. Receipts show the balance after the selected transaction using the current annual fee.

Changes are saved under `snhs-fees-demo-v1` in browser localStorage. Reset through Settings to restore the original sample data. There is no synchronization across browsers/devices. Clearing site data also resets the demo. Receipts are visibly labeled as simulated; no payment is processed.

## Structure

```text
src/
  components/   Shared controls, charts, student dialogs, and receipts
  hooks/        Persistent demo state
  lib/          Deterministic seed, financial calculations, CSV, and tests
  pages/        Dashboard, Students, Classes, Payments, Reports, Settings
  App.tsx       Navigation and shared actions
  styles.css    Responsive design system and receipt print styles
```
