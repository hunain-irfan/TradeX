# TradeX

**Paper trading platform** — virtual $10,000 wallet, 100 US stocks, live Finnhub quotes, TradingView charts, leaderboard, and admin panel. Built as a modern React SPA on Supabase (auth + Postgres + RLS).

<p align="center">
  <img src="public/logo.png" alt="TradeX" width="200" />
</p>

---

## Features

| Area | Highlights |
|------|------------|
| **Trading** | Buy/sell at live prices, portfolio P&L, transaction history with undo & CSV export |
| **Market data** | Finnhub REST + WebSocket (watchlist), TradingView embeds (chart, tape, news, overview) |
| **Account** | Email signup, verification, password reset, profile & settings pages |
| **Social** | Leaderboard ranked by total account value |
| **Admin** | User ban/freeze, fund requests, analytics, audit logs |

---

## Tech stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, React Router 7, Recharts, Lucide icons
- **Backend:** Supabase (Auth, PostgreSQL, Row Level Security, RPC)
- **Market data:** Finnhub API + WebSocket
- **Charts:** TradingView external embeds

---

## Quick start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd TradeX
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in:

| Variable | Where to get it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Same (anon / publishable key) |
| `VITE_FINNHUB_KEY` | [finnhub.io](https://finnhub.io) dashboard |

### 3. Supabase (required)

**All database and auth setup is in one guide:**

👉 **[supabase/SUPABASE_SETUP.md](supabase/SUPABASE_SETUP.md)**

Summary: run 4 SQL files in order, configure Auth URLs, paste email templates, promote admin.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

---

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing |
| `/login` | Public | Sign in / sign up |
| `/verify-email` | Public | Post-signup verification |
| `/forgot-password` | Public | Request reset email |
| `/reset-password` | Public | Set new password |
| `/dashboard` | User | Overview & widgets |
| `/search` | User | Stock search |
| `/portfolio` | User | Holdings |
| `/watchlist` | User | Watchlist + live prices |
| `/history` | User | Transactions |
| `/wallet` | User | Balance & fund requests |
| `/leaderboard` | User | Rankings |
| `/profile` | User | Account overview |
| `/settings` | User | Name, password, preferences |
| `/stock/:symbol` | User | Stock detail |
| `/admin/*` | Admin | Admin panel |

---

## Project structure

```
TradeX/
├── public/logo.png          # Brand asset & favicon
├── supabase/
│   ├── SUPABASE_SETUP.md    # ← Start here for Supabase
│   ├── *.sql                # Migrations (run in SQL Editor)
│   └── email-templates/     # HTML for Supabase Auth emails
├── src/
│   ├── pages/               # Routes (user, admin, auth)
│   ├── components/          # UI, layout, TradingView, charts
│   ├── hooks/               # Auth, portfolio, Finnhub, etc.
│   └── lib/                 # Supabase, trading, DSA helpers
├── README.md
└── PROJECT_SUMMARY.txt      # Deep codebase reference
```

---

## Deploy

1. Complete [supabase/SUPABASE_SETUP.md](supabase/SUPABASE_SETUP.md) on your **production** Supabase project.
2. Set the three `VITE_*` variables on your static host (Vercel, Netlify, Cloudflare Pages, etc.).
3. `npm run build` and deploy the `dist/` folder.
4. Update Supabase **Site URL** and **Redirect URLs** to your production domain.

---

## Documentation

| File | Purpose |
|------|---------|
| [supabase/SUPABASE_SETUP.md](supabase/SUPABASE_SETUP.md) | **Single Supabase setup guide** (SQL, Auth, emails, admin) |
| [PROJECT_SUMMARY.txt](PROJECT_SUMMARY.txt) | Full architecture, theme, phases, limitations |

---

## Security notes

- Only the Supabase **anon** key belongs in the frontend; RLS protects data.
- Never commit `.env` or expose the **service_role** key.
- `VITE_FINNHUB_KEY` is visible in the client bundle — acceptable for demos; use an Edge Function proxy for strict production.

---

## License

Private / academic use unless otherwise specified by the repository owner.
