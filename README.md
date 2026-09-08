# Final Say — 2026 WNBA Champion & MVP Predictor

An interactive site for building a 2026 WNBA playoff bracket and voting for MVP,
with live community results. Built with Next.js (App Router), shadcn/ui, and
Supabase.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **shadcn/ui** (Nova preset, Radix primitives)
- **Supabase** (Postgres + RLS) for reference data (teams/players) and
  anonymous, no-login predictions
- Deployed on **Vercel**

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm run dev
```

The site renders fine with no `.env.local` at all — team/player data falls
back to the bundled seed data in `src/lib/data`, you just won't be able to
save predictions until Supabase is connected.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.
   This creates the `teams`, `players`, `champion_predictions`, and
   `mvp_predictions` tables, the RLS policies, the vote-count views, and
   seeds the 2026-season data.
3. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public key** into `.env.local` (see `.env.example`).

## Team logos & player photos

Team badges and player avatars fall back to a colored monogram in each
team's brand colors if no image file is present, so the site always looks
complete. Real images live in `public/` named by each entity's `id` (see
`src/lib/data/teams.ts` / `players.ts` for the exact ids) — drop in a
replacement with the same filename and it's picked up automatically, no
code changes needed:

- `public/logos/{team-id}.png` — e.g. `public/logos/lva.png` for the Aces
  (sourced from each team's official Wikipedia infobox logo)
- `public/players/{player-id}.jpg` — e.g. `public/players/aja-wilson.jpg`

Team logos are trademarks, used here for identification only (nominative
fair use), which is standard practice for fan/stat sites. Player photos
are copyrighted images of real people — the ones currently in the repo
were supplied directly rather than pulled from the web; if you swap in
your own, make sure you have the rights to use them, especially before
deploying this publicly.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New Project** → import the GitHub repo.
3. Add the two env vars from `.env.local` under **Project Settings →
   Environment Variables**.
4. Deploy.

## Project structure

```
src/app/            # routes: / (home), /bracket, /mvp
src/components/site  # app-specific components (bracket, MVP cards, vote bars…)
src/components/ui    # shadcn/ui primitives
src/lib/data          # static 2026 season seed data (teams, MVP candidates)
src/lib/supabase       # Supabase client + row types
supabase/schema.sql     # full DDL, RLS policies, and seed data
```
