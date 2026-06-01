# TradeX — Known issues & future fixes

Last updated: 2026-05-26

This file lists items **not yet fixed** (or only partially fixed). Safe fixes already applied in code are marked done below.

---

## Fixed in this release (no SQL required)

| Item | Change |
|------|--------|
| Transaction history | Latest 50 trades (was oldest 50) — `useTransactions.js` |
| Undo sell | Restores `buy_price` from SELL row, not sell price |
| Fund approve | Only `pending` requests; blocks double-click credit |
| Admin fund resolved UI | No duplicate "Approved" under badge |
| Admin realized P&L | Use `fix-admin-realized-pnl.sql` (Supabase) |
| Dead assets | Removed `public/logo-old.png`; `AdminAnalytics.jsx` unused |

---

## High — fix before public production

### 1. RLS allows direct wallet / portfolio / transaction writes
**Files:** `supabase/phase5-schema.sql`

Users can bypass `executeBuy`/`executeSell` via Supabase client and change balance or holdings.

**Fix:** User policies → `SELECT` only; all writes via `SECURITY DEFINER` RPCs in one transaction.

---

### 2. Admin role in `user_metadata` (client-writable)
**Files:** `phase5-schema.sql` (`is_admin()`), `useAuth.js`

**Fix:** Store `role` in `app_metadata` or `profiles` table; only service role updates admin.

---

### 3. `send-price-alert` edge function without auth
**File:** `supabase/functions/send-price-alert/index.ts`

**Fix:** Require JWT; verify `to` matches caller email; rate limit.

---

### 4. Non-atomic buy/sell
**File:** `src/lib/trading.js`

Portfolio → wallet → transaction are separate calls; partial failure corrupts state.

**Fix:** Single Postgres RPC with `BEGIN`/`COMMIT`.

---

## Medium

| # | Issue | Notes |
|---|--------|--------|
| 5 | `admin_reset_wallet` | Resets cash only; leaves portfolios + transactions |
| 6 | Leaderboard prices | Only 20 symbols get live quotes; rest at cost |
| 7 | Leaderboard emails | `get_leaderboard()` exposes all user emails |
| 8 | Frozen/banned | Enforced in UI only, not in `trading.js` or RLS |
| 9 | Alert email on failure | `alerts.js` may mark notified even if Resend fails |
| 10 | Platform P&L includes admin trades | `platform_pnl` sums all transactions |
| 11 | Wallet page portfolio value | No live Finnhub on Wallet — may show cost-based value |
| 12 | Fund request daily limit | Client-only on Wallet page |

---

## Low

| # | Issue |
|---|--------|
| 13 | `VITE_FINNHUB_KEY` exposed in client bundle |
| 14 | Bundle size > 500kb — code splitting optional |
| 15 | No automated tests / CI |
| 16 | Email verify not enforced on all trading routes |

---

## Supabase migrations (run order)

See `supabase/SUPABASE_SETUP.md`. Minimum for current app:

1. `phase5-schema.sql`
2. `fix-user-trigger.sql` (if signup fails)
3. `phase10-leaderboard.sql`
4. `phase11-admin-rpc.sql`
5. `add-wallet-total-deposited.sql`
6. `add-transaction-buy-price.sql`
7. `add-alerts-extended.sql`
8. `add-leaderboard-display-name.sql` (optional if #5 includes display_name)
9. `fix-exclude-admins-from-trader-views.sql` (optional)
10. `fix-admin-realized-pnl.sql` (if analytics still wrong)

Alerts email: `supabase/ALERTS_SUPABASE_SETUP.md`

---

## Push checklist

- [ ] `npm run build` passes
- [ ] `.env` not committed
- [ ] SQL migrations run on target Supabase project
- [ ] `fix-admin-realized-pnl.sql` run if admin P&L was wrong
- [ ] Edge function + Resend for alerts (optional)
