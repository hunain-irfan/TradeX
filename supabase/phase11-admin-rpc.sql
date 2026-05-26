-- Phase 11: Admin RPC functions (run in Supabase SQL Editor)

CREATE OR REPLACE FUNCTION public.admin_require_admin()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden: admin only';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  role text,
  is_banned boolean,
  is_frozen boolean,
  balance numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_require_admin();
  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(u.raw_user_meta_data->>'role', 'user'),
    COALESCE((u.raw_user_meta_data->>'is_banned')::boolean, false),
    COALESCE((u.raw_user_meta_data->>'is_frozen')::boolean, false),
    COALESCE(w.balance, 0::numeric),
    u.created_at
  FROM auth.users u
  LEFT JOIN public.wallets w ON w.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user_metadata(
  p_target_user_id uuid,
  p_patch jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_require_admin();
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || p_patch
  WHERE id = p_target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reset_wallet(p_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_require_admin();
  UPDATE public.wallets
  SET balance = 10000.00,
      total_deposited = 10000.00,
      updated_at = now()
  WHERE user_id = p_target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_require_admin();
  DELETE FROM auth.users WHERE id = p_target_user_id;
END;
$$;

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
    'total_users', (SELECT COUNT(*)::int FROM auth.users),
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

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_metadata(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reset_wallet(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analytics_data() TO authenticated;
