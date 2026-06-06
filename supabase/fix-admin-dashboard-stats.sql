-- Exclude admins from Total Users + fill Daily Signups chart (all 30 days, zeros included).
-- Run in Supabase SQL Editor after phase11-admin-rpc.sql.

CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
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
    'total_users', (
      SELECT COUNT(*)::int
      FROM auth.users u
      WHERE COALESCE(u.raw_user_meta_data->>'role', 'user') <> 'admin'
    ),
    'active_trades_today', (
      SELECT COUNT(*)::int FROM public.transactions
      WHERE created_at::date = CURRENT_DATE
    ),
    'total_volume', (
      SELECT COALESCE(SUM(total_value), 0) FROM public.transactions
    ),
    'pending_fund_requests', (
      SELECT COUNT(*)::int FROM public.fund_requests WHERE status = 'pending'
    )
  ) INTO result;
  RETURN result;
END;
$$;

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
      SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.date), '[]'::jsonb)
      FROM (
        SELECT
          d.day::date AS date,
          COALESCE(s.cnt, 0)::int AS count
        FROM generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) AS d(day)
        LEFT JOIN (
          SELECT u.created_at::date AS signup_date, COUNT(*)::int AS cnt
          FROM auth.users u
          WHERE u.created_at >= CURRENT_DATE - INTERVAL '29 days'
            AND COALESCE(u.raw_user_meta_data->>'role', 'user') <> 'admin'
          GROUP BY u.created_at::date
        ) s ON s.signup_date = d.day::date
        ORDER BY d.day
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
        ORDER BY net_flow DESC NULLS LAST, trades_count DESC, w.balance DESC NULLS LAST
        LIMIT 5
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$;
