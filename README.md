# TradeX — Paper Trading Platform

React + Vite frontend with Supabase (auth/database) and Finnhub (market data).

## Quick start

```bash
npm install
cp .env.example .env   # fill in keys
npm run dev
```

Open http://localhost:5173

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable (anon) key |
| `VITE_FINNHUB_KEY` | Finnhub API key |

## Supabase

See [supabase/README.md](supabase/README.md) for SQL scripts.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Deploy

1. Run all Supabase SQL scripts on production project
2. Set env vars in host (Vercel/Netlify/etc.)
3. `npm run build` and deploy `dist/`
4. Supabase Auth → URL Configuration: add your production site URL

See `PROJECT_SUMMARY.txt` for full feature list and production checklist.
