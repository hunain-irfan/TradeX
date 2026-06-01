# TradeX Audit Findings

## Summary

This audit reviewed the TradeX React/Supabase project for build health, routing/auth flow, trading logic, and Supabase integrations.

- `npm run build` completes successfully.
- No compile-time errors were found in the React app.
- The project has a large production bundle warning from Vite.
- Several logic and runtime issues were identified.

## Build and Runtime

- Production build passes successfully.
- Vite reports a large JS chunk over 500 KB after minification.
  - Recommendation: use dynamic imports or manual chunking to reduce bundle size.

## Environment and Configuration Issues

- `src/lib/supabase.js` assumes `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist.
- `src/lib/finnhub.js` and `src/hooks/useFinnhubSocket.js` assume `VITE_FINNHUB_KEY` exists.
- Missing environment variables could break runtime behavior with unclear errors.

## Authentication and Routing

- `ProtectedRoute.jsx` correctly redirects unauthenticated users to `/login`.
- `AdminRoute.jsx` redirects non-admin users to `/dashboard`.
- `UserRoute.jsx` redirects admins away from user trading pages to `/admin`.
- `ProtectedRoute.jsx` and `AdminRoute.jsx` block banned users, but they do not block frozen users from accessing pages.
  - Frozen users are only blocked in `BuySellModal.jsx` when trying to trade.

## Trading Logic Issues

- `src/lib/trading.js` performs wallet updates, portfolio updates, and transaction inserts sequentially on the client.
- If the final transaction insert fails after the wallet or portfolio update succeeds, the app can leave inconsistent state in the database.
- `BuySellModal.jsx` disables trading for frozen users but does not prevent them from accessing trading pages.
- `Wallet.jsx` may leave `loading` true if `user` is falsy during the initial effect and the early return path is taken.

## Page-Level Risks

### Portfolio

- Uses `useFinnhubSocket` to update live prices, then writes back to portfolio map state.
- No obvious bug in the portfolio rendering logic, but the flow depends on accurate live price updates.

### Stock Detail

- `useEffect` loads watchlist membership and `getCompanyNews` for the symbol.
- Potential issue: if `supabase` or `getCompanyNews` fails, the component sets error state but does not show a fallback beyond the news section.

### Wallet

- `load()` returns early without resetting `loading` if `user` is not available yet.
- Fund request form restricts one request per day and maximum $5,000 per request.
- No apparent bug, but state management around `load()` and `user` could be improved.

### Admin Users

- Admin actions are invoked via Supabase RPCs and user metadata updates.
- The UI refreshes after each action, which is appropriate.
- No immediate bug discovered in the admin page logic itself.

## Recommendations

1. Add environment validation for required `VITE_` variables.
2. Enforce frozen account access restrictions more broadly, not just in the trading modal.
3. Convert trading actions into server-side atomic transactions or protect them with RLS / SQL transaction logic.
4. Improve wallet loading state handling when auth is still resolving.
5. Address the Vite bundle-size warning to improve performance.

## Files Reviewed

- `package.json`
- `src/App.jsx`
- `src/main.jsx`
- `src/lib/supabase.js`
- `src/hooks/useAuth.js`
- `src/components/layout/ProtectedRoute.jsx`
- `src/components/layout/AdminRoute.jsx`
- `src/components/layout/UserRoute.jsx`
- `src/lib/trading.js`
- `src/lib/finnhub.js`
- `src/hooks/useFinnhubSocket.js`
- `src/hooks/useFinnhub.js`
- `src/pages/user/Portfolio.jsx`
- `src/pages/user/StockDetail.jsx`
- `src/pages/user/Wallet.jsx`
- `src/pages/admin/AdminUsers.jsx`
- `src/lib/admin.js`
- `src/hooks/usePortfolio.js`
