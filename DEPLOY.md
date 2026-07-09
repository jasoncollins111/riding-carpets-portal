# Deploying Setlist Manager

This app is a Next.js 15 project backed by Vercel Postgres. Production is hosted at **https://setlist-manager.vercel.app**.

## Prerequisites

- **Node.js 20+** (required — Node 18 causes stuck deploys with current Vercel CLI)
- **Vercel CLI 47+** (required — older global installs are rejected by the API)
- [Vercel CLI](https://vercel.com/docs/cli) installed and authenticated (`vercel login`)
- This repo linked to the Vercel project (`.vercel/project.json` is created by `vercel link`)

Verify your tooling before deploying:

```bash
node -v          # must be v20+
vercel --version # must be 47+
```

If either check fails:

```bash
# Upgrade Node (Homebrew example)
brew install node@20
export PATH="$(brew --prefix node@20)/bin:$PATH"

# Upgrade Vercel CLI
npm i -g vercel@latest
```

## Environment Variables

| Variable | Required | Set by | Purpose |
|----------|----------|--------|---------|
| `POSTGRES_URL` | Yes | Vercel Postgres (auto) | Database connection for all API routes |
| `IMPORT_SECRET` | No | Manual | Bearer token for `POST /api/import-sheets` |
| `GOOGLE_SHEETS_ID` | No | Manual | Overrides default spreadsheet in `src/scripts/sheets-config.json` |

Postgres vars (`POSTGRES_HOST`, `POSTGRES_USER`, etc.) are provisioned automatically when you attach a Vercel Postgres store to the project.

## First-Time Setup

### 1. Link the project (if not already linked)

```bash
vercel link
```

### 2. Pull environment variables locally

```bash
vercel env pull .env.local
```

### 3. Run database migrations

```bash
npm run db:migrate
```

Migrations are idempotent — safe to re-run after schema changes.

### 4. (Optional) Import Google Sheets data

The sheet must be publicly readable (uses the unauthenticated gviz API).

```bash
npm run db:import
```

Or trigger via the protected API endpoint after setting `IMPORT_SECRET` in Vercel:

```bash
curl -X POST https://setlist-manager.vercel.app/api/import-sheets \
  -H "Authorization: Bearer YOUR_IMPORT_SECRET"
```

## Deploy

### Recommended: Git push (most reliable)

Push to `main` on GitHub. Vercel builds on their servers and avoids local CLI hang issues.

```bash
git push origin main
```

Monitor the build at https://vercel.com/jasons-projects-b167f2fc/setlist-manager

### Alternative: CLI deploy (from local working tree)

Requires Node 20+ and Vercel CLI 47+. If deploys get stuck on `Building…` with status `UNKNOWN` and 0ms build time, use Git push instead.

```bash
export PATH="$(brew --prefix node@20)/bin:$PATH"
npx vercel@latest --prod
```

Prebuilt deploy (build locally, upload artifacts):

```bash
export PATH="$(brew --prefix node@20)/bin:$PATH"
npx vercel@latest build --prod
npx vercel@latest deploy --prebuilt --prod
```

## Post-Deploy Verification

```bash
curl -sS -o /dev/null -w "homepage: %{http_code}\n" https://setlist-manager.vercel.app
curl -sS -o /dev/null -w "api/shows: %{http_code}\n" https://setlist-manager.vercel.app/api/shows
curl -sS -o /dev/null -w "setlists: %{http_code}\n" https://setlist-manager.vercel.app/setlists
curl -sS -o /dev/null -w "songs: %{http_code}\n" https://setlist-manager.vercel.app/songs
```

All should return `200`. Also test adding a show at `/add-show` and a song at `/add-song`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `requires version 47.2.2 or later` | Upgrade Vercel CLI: `npm i -g vercel@latest` |
| Deploy stuck on `Building…` / status `UNKNOWN` | Kill hung CLI processes (`pkill -f vercel@latest`). Use **Git push** instead — CLI deploys may never start remote builds (0ms). Requires Node 20+ if retrying CLI |
| `Missing POSTGRES_URL` | Attach Vercel Postgres storage; run `vercel env pull` |
| API returns 500 | Run `npm run db:migrate` against production DB |
| Import times out via API | Run `npm run db:import` locally instead (Hobby plan has 60s function limit) |
| Import returns 401 | Set `IMPORT_SECRET` in Vercel env vars |
| Build fails | Run `npm run build` locally to reproduce; fix TypeScript/lint errors |

## Architecture

```
Browser → Next.js (Vercel) → API Routes → Vercel Postgres
                              ↓
                    /api/import-sheets → import-sheets.js → Google Sheets
```

## Security Note

The app has no user authentication. Anyone with the URL can read and write data. Keep the production URL private, or add auth before sharing publicly.
