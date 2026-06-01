-- Track total capital deposited (signup + approved funds) for accurate return %.
-- Run once in Supabase SQL Editor after phase5 / phase11.

ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS total_deposited numeric(12, 2) NOT NULL DEFAULT 10000.00;

-- Backfill: $10k signup + sum of approved fund requests per user
UPDATE public.wallets w
SET total_deposited = 10000.00 + COALESCE(
  (
    SELECT SUM(fr.amount)::numeric
    FROM public.fund_requests fr
    WHERE fr.user_id = w.user_id
      AND fr.status = 'approved'
  ),
  0
);

-- If you credited balance manually (no fund_request), fix that user once, e.g.:
-- UPDATE public.wallets SET total_deposited = total_deposited + 2000 WHERE user_id = '...';

-- New users: wallet row includes total_deposited
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance, total_deposited)
  VALUES (NEW.id, 10000.00, 10000.00)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Admin reset: cash and deposited baseline both back to $10k
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

-- Leaderboard: return type changed (added total_deposited) — must drop first
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

GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
