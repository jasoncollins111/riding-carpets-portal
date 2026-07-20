# Riding Carpets Portal

Track shows, songs, and setlists for Riding Carpets.

## Development

```bash
npm install
vercel env pull .env.local   # requires vercel link
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run Vitest tests |
| `npm run db:migrate` | Create/update database tables |
| `npm run db:import` | Import shows/songs/setlists from Google Sheets |
| `npm run db:cleanup-songs` | Remove orphan songs not in any setlist |
| `npm run db:merge-duplicates` | Merge duplicate song catalog entries |

## Deployment

See [DEPLOY.md](DEPLOY.md) for Vercel deployment, environment variables, and post-deploy verification.

## Admin pages

These routes are not linked in the nav but are available for manual data entry:

- `/add-show` — add a show and setlist
- `/add-song` — add a song to the catalog
