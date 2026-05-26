-- Run once in Supabase SQL Editor if leaderboard still shows admin accounts.
-- Excludes role = 'admin' from trader-facing leaderboard + admin "Top Traders" widget.

DROP FUNCTION IF EXISTS public.get_leaderboard();

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  display_name text,
  wallet_balance numeric,
  total_deposited numeric,
  trades_count bigint,
  holdings jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.email::text,
    NULLIF(TRIM(u.raw_user_meta_data->>'display_name'), ''),
    w.balance,
    w.total_deposited,
    (SELECT COUNT(*)::bigint FROM transactions t WHERE t.user_id = u.id),
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'symbol', p.stock_symbol,
            'quantity', p.quantity,
            'buy_price', p.buy_price
          )
        )
        FROM portfolios p
        WHERE p.user_id = u.id
      ),
      '[]'::jsonb
    )
  FROM auth.users u
  INNER JOIN wallets w ON w.user_id = u.id
  WHERE COALESCE((u.raw_user_meta_data->>'is_banned')::boolean, false) = false
    AND COALESCE(u.raw_user_meta_data->>'role', 'user') <> 'admin';
$$;

-- Patch admin_analytics_data top_traders (full function body from phase11 with admin filter)
CREATE OR REPLACE FUNCTION public.admin_analytics_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  PERFORM public.admin_require_admin();
  SELECT jsonb_build_object(
    'daily_signups', (
      SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT created_at::date AS date, COUNT(*)::int AS count
        FROM auth.users
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY created_at::date
        ORDER BY date
      ) t
    ),
    'most_traded', (
      SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT stock_symbol AS symbol, COUNT(*)::int AS trades
        FROM public.transactions
        GROUP BY stock_symbol
        ORDER BY trades DESC
        LIMIT 10
      ) t
    ),
    'platform_pnl', (
      SELECT COALESCE(SUM(
        CASE
          WHEN action = 'SELL' THEN
            total_value - COALESCE(buy_price, price) * quantity
          ELSE 0
        END
      ), 0)
      FROM public.transactions
    ),
    'top_traders', (
      SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT
          u.id AS user_id,
          u.email,
          w.balance,
          COUNT(tr.id)::int AS trades_count,
          COALESCE(SUM(
            CASE
              WHEN tr.action = 'SELL' THEN
                tr.total_value - COALESCE(tr.buy_price, tr.price) * tr.quantity
              ELSE 0
            END
          ), 0) AS net_flow
        FROM auth.users u
        LEFT JOIN public.wallets w ON w.user_id = u.id
        LEFT JOIN public.transactions tr ON tr.user_id = u.id
        WHERE COALESCE(u.raw_user_meta_data->>'role', 'user') <> 'admin'
        GROUP BY u.id, u.email, w.balance
        ORDER BY w.balance DESC NULLS LAST
        LIMIT 5
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$;
