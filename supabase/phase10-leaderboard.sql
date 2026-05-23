-- Run in Supabase SQL Editor for Leaderboard page (bypasses per-user RLS)

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  wallet_balance numeric,
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
    w.balance,
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
  WHERE COALESCE((u.raw_user_meta_data->>'is_banned')::boolean, false) = false;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
