-- Fix admin analytics: "net flow" was BUY cash out minus SELL cash in (always huge negative).
-- Replace with realized P&L on SELL rows only. Run once in SQL Editor.

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
