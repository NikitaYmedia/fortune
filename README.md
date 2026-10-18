# Neemo Dashboard

Next.js (App Router) · React 19 · TypeScript strict · Tailwind CSS · next-intl (EN/UK) · Recharts · date-fns · Zod.

## Run
```bash
npm install
npm run dev        # http://localhost:3000  (redirects to /en/projects/demo)
```
Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

## Open in VS Code
File → Open Folder → this folder. Terminal → `npm install` → `npm run dev`.

## Demo mode (current)
No keys needed. Data lives in the browser (`localStorage`, key `neemo.data.v1`); language is stored
in the `NEXT_LOCALE` cookie, theme in `neemo.theme`. A badge in the top bar says so.

## Routes
`/{en|uk}/projects` (all projects), `/login`, `/register`, and per project: `/projects/{id}` (overview), `/introduction`, `/tasks` (drag-and-drop board), `/calendar`, `/notes`, `/settings`.

## Structure
- `app/[locale]/…` routes (thin server pages) · `components/*` UI by feature · `messages/{en,uk}.json` translations
- `lib/data/` — `DataAdapter` interface, `local-adapter.ts`, `store.tsx` (React context), `seed.ts` (demo data)
- `lib/validations/schemas.ts` — Zod schemas · `lib/utils/` — dates, stats (progress = completed / total, 0% when empty)
- `supabase/migrations/0001_init.sql` — tables, indexes, constraints, Row Level Security

## Accounts (Supabase)
1. Create a free project at supabase.com.
2. SQL Editor: paste and run `supabase/migrations/0001_init.sql` (tables + Row Level Security: each user sees only their own rows).
3. Project Settings → API: copy the Project URL and the **anon** key into `.env.local` (see `.env.example`).
4. Authentication → Providers → Email: for personal use you can turn off "Confirm email" so sign-up logs you in immediately.
5. Restart `npm run dev`. `/login` and `/register` are now active and every user has separate data.

Without the two variables the app stays in demo mode (localStorage).

## Known limitations
No ordering of cards inside a column, no password reset page, global search opens the page (not the item).
