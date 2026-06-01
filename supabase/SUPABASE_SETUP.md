# TradeX — Supabase setup (complete guide)

Yeh **ek hi file** hai jisme Supabase par sab kuch step-by-step hai: SQL scripts, Auth URLs, email templates, admin user, aur production deploy.

> **Important:** SQL files auto-run nahi hoti. Har nayi Supabase project par in steps ko **ek baar** manually karna zaroori hai (local dev aur production alag projects ho sakte hain).

---

## Table of contents

1. [Create project & env vars](#1-create-project--env-vars)
2. [Run SQL scripts (order matters)](#2-run-sql-scripts-order-matters)
3. [Authentication — URL configuration](#3-authentication--url-configuration)
4. [Authentication — Email provider](#4-authentication--email-provider)
5. [Email templates (HTML paste)](#5-email-templates-html-paste)
6. [Optional — Google OAuth](#6-optional--google-oauth)
7. [Promote your first admin](#7-promote-your-first-admin)
8. [Verify everything works](#8-verify-everything-works)
9. [Production deploy checklist](#9-production-deploy-checklist)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Create project & env vars

1. [supabase.com](https://supabase.com) → **New project**
2. **Project Settings → API** se copy karo:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` / publishable key → `VITE_SUPABASE_ANON_KEY`
3. Project root par `.env` banao (`.env.example` se copy):

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_FINNHUB_KEY=your_finnhub_api_key
```

4. Finnhub key: [finnhub.io](https://finnhub.io) → free API key (market data ke liye; Supabase se alag hai)

```bash
npm install
npm run dev
```

---

## 2. Run SQL scripts (order matters)

**Dashboard → SQL → New query** → file ka poora content paste → **Run**

| Order | File | Kya karta hai |
|-------|------|----------------|
| **1** | `phase5-schema.sql` | Tables, RLS, `is_admin()`, new-user metadata + **$10,000 wallet** trigger |
| **2** | `fix-user-trigger.sql` | Agar signup par "Database error creating new user" aaye — wallet trigger fix |
| **3** | `phase10-leaderboard.sql` | `get_leaderboard()` RPC (Leaderboard page) |
| **4** | `phase11-admin-rpc.sql` | Admin RPCs (users, stats, fund approve, delete user, etc.) |
| **5** | `add-wallet-total-deposited.sql` | `total_deposited` column — seeds count as capital, not fake return % |
| **6** | `add-transaction-buy-price.sql` | `buy_price` on SELL transactions — accurate realized / today P&L |
| **7** | `add-leaderboard-display-name.sql` | Leaderboard shows `display_name` from profile (not email prefix) |
| **8** | `fix-exclude-admins-from-trader-views.sql` | Leaderboard / admin analytics without admin accounts (if not done) |
| **9** | `add-alerts-extended.sql` | Price alerts columns + `alert_email_log` table |

**Price alert emails:** Full step-by-step guide → **`supabase/ALERTS_SUPABASE_SETUP.md`** (SQL + Resend + edge function + test checklist). Short version also in **§11** below.

**Total return %:** Dashboard / Leaderboard use `wallets.total_deposited` ($10k signup + approved fund requests). Manual balance credits without a fund request need a one-time SQL fix (see comments in `add-wallet-total-deposited.sql`).

Agar signup ke baad wallet balance nahi milta:

- Pehle `fix-user-trigger.sql` dubara run karo
- Phir naya account banao (purane broken users ke liye manually wallet insert admin se kar sakte ho)

---

## 3. Authentication — URL configuration

**Authentication → URL Configuration**

### Site URL

| Environment | Site URL |
|-------------|----------|
| Local dev | `http://localhost:5173` |
| Production | `https://your-domain.com` |

### Redirect URLs (sab add karo)

```
http://localhost:5173/
http://localhost:5173/login
http://localhost:5173/reset-password
http://localhost:5173/dashboard
https://your-domain.com/
https://your-domain.com/login
https://your-domain.com/reset-password
https://your-domain.com/dashboard
```

| URL | Kab use hota hai |
|-----|------------------|
| `/` | Landing / default |
| `/login` | Email confirm ke baad (`authRedirect.js`) |
| `/reset-password` | Forgot password email link |
| `/dashboard` | Google OAuth (agar enable ho) |

---

## 4. Authentication — Email provider

**Authentication → Providers → Email**

| Setting | Value |
|---------|--------|
| Email provider | **ON** |
| Confirm email | **ON** (signup verification) |
| Minimum password length | **6** (app ke saath match) |

Optional: **Authentication → Email** → sender name `TradeX`

### Email free tier?

Supabase Free plan par auth emails included hain (rate limited — demo/FYP ke liye theek). Production spam kam karne ke liye baad mein **Custom SMTP** (Resend, SendGrid, etc.) add karo: **Project Settings → Auth → SMTP**.

---

## 5. Email templates (HTML paste)

**Authentication → Email Templates**

| Supabase template | Paste from file | Suggested subject |
|-------------------|-----------------|-------------------|
| **Confirm signup** | `email-templates/confirm-signup.html` | `Confirm your TradeX account` |
| **Reset password** | `email-templates/reset-password.html` | `Reset your TradeX password` |

**Zaroori:** Go template variables mat hatana:

- `{{ .ConfirmationURL }}`
- `{{ .Email }}`

### App flows (already wired)

| Flow | User | After email click |
|------|------|-------------------|
| Sign up | Inbox → Confirm | `/login` → session → `/dashboard` |
| Forgot password | Inbox → Reset | `/reset-password` → new password |

Test: real Gmail/outlook se signup karo; 1–2 min mein na aaye to **spam** check karo.

---

## 6. Optional — Google OAuth

**Authentication → Providers → Google** → Enable → Client ID & secret (Google Cloud Console)

Redirect URLs mein `/dashboard` pehle se honi chahiye (section 3).

App: Login page par Google button agar wired ho to same redirect use karta hai.

---

## 7. Promote your first admin

Pehle app se **sign up** karo (taake `auth.users` mein row ho).

**SQL Editor:**

```sql
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
  || '{"role":"admin","is_banned":false,"is_frozen":false}'::jsonb
WHERE email = 'your-email@example.com';
```

Phir app mein **sign out → sign in** (JWT metadata refresh ke liye).

Admin routes: `/admin`, `/admin/users`, `/admin/wallet`, `/admin/analytics`, `/admin/logs`

---

## 8. Verify everything works

| Check | Expected |
|-------|----------|
| Sign up | User ban jaye + wallet **$10,000** |
| Login | `/dashboard` open ho |
| Buy/sell | `transactions` + `portfolios` update hon |
| Leaderboard | Bina SQL error ke load ho |
| Admin (after promote) | `/admin` stats dikhein |
| Profile / Settings | Display name save ho (`user_metadata`) |

---

## 9. Production deploy checklist

1. **Alag** Supabase production project (recommended) ya same project with production URLs
2. Upar wale **4 SQL files** production project par run karo
3. **URL Configuration** production domain par update
4. Host (Vercel / Netlify / Cloudflare Pages) par **teen** env vars set karo — laptop `.env` deploy par nahi jati
5. `npm run build` → `dist/` deploy
6. Admin user promote + re-login
7. Email templates production domain ke saath test karo
8. Optional: Custom SMTP

---

## 11. Price alert emails (Resend)

Alerts **create** hone par turant email nahi jati — jab **live price** aapki condition match kare (Dashboard ya Portfolio open hon), tab email bheji jati hai.

### Flow

1. User alert save karta hai → `public.alerts` table.
2. App live quotes check karti hai (`useAlertChecker` on Dashboard / Portfolio).
3. Condition match → HTML banata hai (`src/lib/alertEmailTemplate.js` — TradeX dark theme, blue CTA).
4. Supabase function `send-price-alert` user ke **auth email** par Resend se bhejta hai.
5. Log → `alert_email_log` table.

Settings mein **Email alerts** on hona chahiye (default on).

### One-time setup

1. SQL: `add-alerts-extended.sql` run karo.
2. [Resend](https://resend.com) account — API key lo.
3. Domain verify karo (ya test ke liye Resend sandbox `onboarding@resend.dev`).
4. Supabase CLI se deploy:

```bash
supabase functions deploy send-price-alert
supabase secrets set RESEND_API_KEY=re_xxxx
supabase secrets set ALERT_FROM_EMAIL="TradeX <alerts@yourdomain.com>"
```

5. Test: AAPL alert threshold current price ke bahut paas rakho, Dashboard kholo 15–30 sec.

Bina `RESEND_API_KEY` ke alert DB mein save hoga lekin inbox mein email nahi aayegi.

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| Database error on signup | Run `fix-user-trigger.sql`, retry signup |
| Leaderboard error / function missing | Run `phase10-leaderboard.sql` |
| Admin shows on leaderboard | Run `fix-exclude-admins-from-trader-views.sql` |
| Admin pages SQL errors | Run `phase11-admin-rpc.sql` |
| Tables don't exist | Run `phase5-schema.sql` |
| Email link wrong page | Fix Redirect URLs (section 3) |
| Admin menu nahi dikhta | SQL promote + sign out/in |
| App works locally, not online | Production Supabase + host env vars |
| Price alerts fail to save | Run `add-alerts-extended.sql` |
| Alert emails not sent | Deploy `send-price-alert` + set `RESEND_API_KEY`, `ALERT_FROM_EMAIL` |
| Admin huge red P&L (-$11k etc.) | Run `fix-admin-realized-pnl.sql` (old metric counted all buys as loss) |

---

## Files in `supabase/` folder

```
supabase/
├── SUPABASE_SETUP.md          ← yeh guide
├── phase5-schema.sql
├── fix-user-trigger.sql
├── phase10-leaderboard.sql
├── phase11-admin-rpc.sql
├── add-alerts-extended.sql
├── functions/send-price-alert/
└── email-templates/
    ├── confirm-signup.html
    ├── reset-password.html
    └── price-alert.html          ← preview only; runtime uses alertEmailTemplate.js
```

**Never** put `service_role` key in frontend — sirf `anon` key in `VITE_SUPABASE_ANON_KEY`.
