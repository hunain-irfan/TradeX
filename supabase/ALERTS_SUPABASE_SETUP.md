# TradeX — Price Alerts: Supabase Setup (Complete)

Yeh file **sirf price alerts + email** ke liye hai. Code repo mein complete hai; push ke baad yahan se step-by-step Supabase configure karo.

---

## Kya code mein already hai

| Piece | Location |
|-------|----------|
| Alert form + list UI | `src/components/alerts/`, `src/pages/user/Alerts.jsx` |
| Live price check | `src/hooks/useAlertChecker.js` (Dashboard + Portfolio) |
| Email HTML template | `src/lib/alertEmailTemplate.js` |
| Send email API | `supabase/functions/send-price-alert/index.ts` |
| DB migration | `supabase/add-alerts-extended.sql` |

---

## Part 1 — Database (SQL Editor)

### Pehle check

**Table Editor** → `alerts` table hai?

- **Nahi** → pehle `phase5-schema.sql` run karo (poora file, ek baar).
- **Haan** → seedha neeche wala migration.

### Run karo

1. Dashboard → **SQL** → **New query**
2. Open file: `supabase/add-alerts-extended.sql`
3. Saara content paste → **Run**

### Kya add hota hai

**`alerts` columns (naye):**

- `alert_name`, `stock_name`, `alert_type`, `frequency`, `last_notified_at`

**Nayi table `alert_email_log`:**

- Har trigger par log (user email, subject, payload)

### Verify

Table Editor mein:

- `alerts` — columns dikhen
- `alert_email_log` — table exist kare

App se **New Alert** banao → `alerts` mein row aani chahiye (bina email setup ke bhi).

---

## Part 2 — Email (Resend + Edge Function)

Alert **create** par email **nahi** jati. Email tab jati hai jab **live price** condition match kare aur user **Dashboard** ya **Portfolio** par ho.

### 2.1 Resend account

1. https://resend.com → sign up  
2. **API Keys** → Create → copy key (`re_...`)  
3. **Testing:** `onboarding@resend.dev` se bhej sakte ho (sirf apne Resend account email par)  
4. **Production:** apna domain verify karo → `alerts@yourdomain.com`

### 2.2 Supabase Edge Function deploy

**Project ref:** Dashboard → **Project Settings** → **General** → **Reference ID**

Terminal (TradeX folder):

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Deploy + secrets:

```bash
supabase functions deploy send-price-alert
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
supabase secrets set ALERT_FROM_EMAIL="TradeX <onboarding@resend.dev>"
```

Production domain ke baad:

```bash
supabase secrets set ALERT_FROM_EMAIL="TradeX <alerts@yourdomain.com>"
```

### 2.3 Bina CLI (Dashboard)

1. **Edge Functions** → **Deploy new function** → name: `send-price-alert`  
2. Code paste from `supabase/functions/send-price-alert/index.ts`  
3. **Project Settings** → **Edge Functions** → **Secrets**  
   - `RESEND_API_KEY`  
   - `ALERT_FROM_EMAIL`  

### 2.4 Function verify

**Edge Functions** → `send-price-alert` → status **Active**

Logs: trigger ke baad **Logs** tab check karo (errors dikhenge agar Resend fail ho).

---

## Part 3 — App settings

- User **Settings** → **Email alerts** ON (default on)  
- Email address = **signup email** (`auth.users.email`)  
- Finnhub API key `.env` mein set (`VITE_FINNHUB_API_KEY`) — prices ke liye  

---

## Part 4 — Test checklist

```
[ ] add-alerts-extended.sql run — no SQL error
[ ] App: Alerts → Create alert — row in `alerts` table
[ ] send-price-alert deployed + secrets set
[ ] Resend API key valid
[ ] Alert threshold ≈ current price (e.g. AAPL Above $1)
[ ] Dashboard open 20–30 seconds
[ ] `alert_email_log` new row
[ ] Inbox ( + spam ) — HTML email TradeX theme
```

**Quick test idea:** AAPL, condition **Above**, threshold **$1** (almost always true) → Dashboard kholo → email aani chahiye (Resend setup ho to).

---

## Flow diagram

```
User creates alert → DB: alerts
        ↓
Dashboard/Portfolio live prices (Finnhub)
        ↓
Price matches Above/Low?
        ↓ yes
buildPriceAlertEmail() → HTML
        ↓
supabase.functions.invoke('send-price-alert')
        ↓
Resend → user signup email
        ↓
DB: alert_email_log + alerts.last_notified_at update
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Alert save error / column missing | Run `add-alerts-extended.sql` |
| Alert saves, no email | Deploy function + `RESEND_API_KEY` |
| Function 500 | Edge function **Logs**; Resend dashboard errors |
| Resend “testing” only | Sandbox: recipient = your Resend account email |
| No trigger | Dashboard/Portfolio open; threshold realistic; wait 15s throttle |
| `alert_email_log` empty | Price condition not met OR RLS — user logged in |

---

## Files reference

```
supabase/
├── ALERTS_SUPABASE_SETUP.md     ← yeh file
├── add-alerts-extended.sql      ← SQL (Part 1)
├── functions/send-price-alert/
│   └── index.ts                 ← Resend sender (Part 2)
└── email-templates/
    └── price-alert.html         ← preview only
```

---

## Optional: baaki migrations (puri app)

Agar naya project hai, pehle `SUPABASE_SETUP.md` ki migration list (#1–#8) bhi chalao. Alerts ke liye **minimum** = `phase5` (agar alerts table nahi) + `add-alerts-extended` + edge function.

---

*Last updated: price alerts module — TradeX*
