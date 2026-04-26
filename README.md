# Sorry, Looks Like Something Went Wrong

Session scheduler for the *Mummy's Mask* Pathfinder campaign — **The Fellowship of the Dice**.

Live: [camouf1age.github.io/sorry_looks_like_something_went_wrong](https://camouf1age.github.io/sorry_looks_like_something_went_wrong/)

## What it does

- Each player picks their character and marks availability (Ready / Maybe / Cannot Come) for upcoming bi-weekly sessions
- Automatically highlights the best candidate date based on who can make it (DM availability weighted more heavily)
- Data is shared in real time — all players see each other's responses

## Tech

- **Frontend**: React + Vite, deployed to GitHub Pages via GitHub Actions
- **Storage**: Supabase (PostgreSQL) — one shared JSON blob per storage key

## Local development

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
2. `npm install`
3. `npm run dev`

## Deployment

Pushing to `main` triggers the GitHub Actions workflow which builds and deploys to GitHub Pages automatically. The Supabase credentials are stored as repository secrets (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

## The Party

| Player | Character | Race | Class |
|--------|-----------|------|-------|
| Mads | Aki | Kitsune | Rogue |
| Tobbi | Bunnon | Human | Bard |
| Sigurd | Baz | Half-orc | Cleric |
| Gee | Gruurd | Dwarf | Fighter |
| Kim | Aryan | Tiefling | Alchemist |
