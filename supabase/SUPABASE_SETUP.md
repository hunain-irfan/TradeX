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

**Note:** `alerts` table schema mein hai lekin app ab alerts feature use nahi karti — table reh sakti hai, koi extra SQL zaroori nahi.

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

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| Database error on signup | Run `fix-user-trigger.sql`, retry signup |
| Leaderboard error / function missing | Run `phase10-leaderboard.sql` |
| Admin pages SQL errors | Run `phase11-admin-rpc.sql` |
| Tables don't exist | Run `phase5-schema.sql` |
| Email link wrong page | Fix Redirect URLs (section 3) |
| Admin menu nahi dikhta | SQL promote + sign out/in |
| App works locally, not online | Production Supabase + host env vars |

---

## Files in `supabase/` folder

```
supabase/
├── SUPABASE_SETUP.md          ← yeh guide
├── phase5-schema.sql
├── fix-user-trigger.sql
├── phase10-leaderboard.sql
├── phase11-admin-rpc.sql
└── email-templates/
    ├── confirm-signup.html
    └── reset-password.html
```

**Never** put `service_role` key in frontend — sirf `anon` key in `VITE_SUPABASE_ANON_KEY`.
