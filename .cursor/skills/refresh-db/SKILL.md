---
name: refresh-db
description: Refresh the Riding Carpets Portal Postgres database from Google Sheets. Use when the user asks to refresh, sync, repopulate, or import the database, or after updating the band spreadsheet.
---

# Refresh Database from Google Sheets

## When to use

Run this workflow when the user updates the Google Sheet and wants the portal database updated. Do not use the API route for routine refreshes — local import avoids Vercel's function timeout (~6 minutes typical).

## Prerequisites

1. `.env.local` in the project root with `POSTGRES_URL` (or `DATABASE_URL`).
2. If missing, pull from Vercel: `vercel env pull .env.local` (requires `vercel link`).
3. Google Sheet must be **publicly readable** (Share → Anyone with the link → Viewer).

## Refresh workflow

Execute these steps — do not just tell the user to run them:

```
Task Progress:
- [ ] Step 1: Confirm `.env.local` exists (pull if missing)
- [ ] Step 2: Run `npm run db:import`
- [ ] Step 3: Report per-tab counts and total from script output
- [ ] Step 4: (Optional) Verify API returns data
```

**Step 1 — Environment**

```bash
test -f .env.local || vercel env pull .env.local
```

**Step 2 — Import**

```bash
npm run db:import
```

The script reads `src/scripts/sheets-config.json` (tabs 2020–2026). Override the spreadsheet with `GOOGLE_SHEETS_ID` in `.env.local` if needed.

**Step 3 — Report results**

Summarize output like: `Import complete. N shows total.` plus per-tab breakdown. Note any skipped rows or tab errors.

**Step 4 — Verify (optional)**

```bash
curl -sS https://riding-carpets-portal.vercel.app/api/shows | head -c 200
```

Expect JSON show rows, not `Internal server error`.

## First-time / empty database

If tables do not exist yet, run migrations before import:

```bash
npm run db:migrate
npm run db:import
```

## Optional maintenance (only when asked)

| Command | Purpose |
|---------|---------|
| `npm run db:cleanup-songs` | Remove orphan songs not in any setlist |
| `npm run db:merge-duplicates` | Merge duplicate song names |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing POSTGRES_URL` | Run `vercel env pull .env.local` |
| `Failed to fetch sheet` | Confirm sheet is public; check tab names in `sheets-config.json` |
| Tab error in output | Report the tab and error; other tabs may still succeed |
| Import via API fails / times out | Use local `npm run db:import` instead |

## Key files

- `src/scripts/import-sheets.js` — import logic
- `src/scripts/sheets-config.json` — spreadsheet ID, year tabs, column mapping
- `DEPLOY.md` — full deploy and repopulate documentation
