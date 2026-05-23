-- ============================================================
-- TradeX — Phase 5: Database tables, RLS, auth metadata
-- Run in Supabase Dashboard → SQL → New query → Run
-- ============================================================

-- ------------------------------------------------------------
-- Helper: check if current user is admin (from JWT user_metadata)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  balance numeric(12, 2) NOT NULL DEFAULT 10000.00,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  stock_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  buy_price numeric(12, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, stock_symbol)
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  action text NOT NULL CHECK (action IN ('BUY', 'SELL')),
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(12, 2) NOT NULL,
  total_value numeric(12, 2) NOT NULL,
  balance_after numeric(12, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  stock_name text NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, stock_symbol)
);

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  target_price numeric(12, 2) NOT NULL,
  condition text NOT NULL CHECK (condition IN ('ABOVE', 'BELOW')),
  is_triggered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  reason text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  performed_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_fund_requests_user_id ON public.fund_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_fund_requests_status ON public.fund_requests (status);

-- ------------------------------------------------------------
-- Auto-update wallets.updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_wallets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wallets_updated_at ON public.wallets;
CREATE TRIGGER wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_wallets_updated_at();

-- ------------------------------------------------------------
-- New user: default metadata + wallet ($10,000)
-- auth.users metadata: role, is_banned, is_frozen
-- ------------------------------------------------------------
-- Set default metadata before the auth row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'role', 'user',
    'is_banned', false,
    'is_frozen', false
  );
  RETURN NEW;
END;
$$;

-- Create wallet after auth.users row exists (FK requires this)
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 10000.00)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_metadata ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_wallet ON auth.users;

CREATE TRIGGER on_auth_user_metadata
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_metadata();

CREATE TRIGGER on_auth_user_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_wallet();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ---------- wallets ----------
DROP POLICY IF EXISTS "wallets_select_own" ON public.wallets;
DROP POLICY IF EXISTS "wallets_insert_own" ON public.wallets;
DROP POLICY IF EXISTS "wallets_update_own" ON public.wallets;
DROP POLICY IF EXISTS "wallets_admin_all" ON public.wallets;

CREATE POLICY "wallets_select_own" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallets_insert_own" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_update_own" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_admin_all" ON public.wallets
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- portfolios ----------
DROP POLICY IF EXISTS "portfolios_user_all" ON public.portfolios;
DROP POLICY IF EXISTS "portfolios_admin_all" ON public.portfolios;

CREATE POLICY "portfolios_user_all" ON public.portfolios
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portfolios_admin_all" ON public.portfolios
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- transactions ----------
DROP POLICY IF EXISTS "transactions_user_select" ON public.transactions;
DROP POLICY IF EXISTS "transactions_user_insert" ON public.transactions;
DROP POLICY IF EXISTS "transactions_admin_all" ON public.transactions;

CREATE POLICY "transactions_user_select" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_user_insert" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_admin_all" ON public.transactions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- watchlist ----------
DROP POLICY IF EXISTS "watchlist_user_all" ON public.watchlist;
DROP POLICY IF EXISTS "watchlist_admin_all" ON public.watchlist;

CREATE POLICY "watchlist_user_all" ON public.watchlist
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_admin_all" ON public.watchlist
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- alerts ----------
DROP POLICY IF EXISTS "alerts_user_all" ON public.alerts;
DROP POLICY IF EXISTS "alerts_admin_all" ON public.alerts;

CREATE POLICY "alerts_user_all" ON public.alerts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alerts_admin_all" ON public.alerts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- fund_requests ----------
DROP POLICY IF EXISTS "fund_requests_user_select" ON public.fund_requests;
DROP POLICY IF EXISTS "fund_requests_user_insert" ON public.fund_requests;
DROP POLICY IF EXISTS "fund_requests_admin_all" ON public.fund_requests;

CREATE POLICY "fund_requests_user_select" ON public.fund_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "fund_requests_user_insert" ON public.fund_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fund_requests_admin_all" ON public.fund_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- admin_logs (admins only) ----------
DROP POLICY IF EXISTS "admin_logs_admin_all" ON public.admin_logs;

CREATE POLICY "admin_logs_admin_all" ON public.admin_logs
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- Make yourself admin (run AFTER you sign up — replace email)
-- ------------------------------------------------------------
-- UPDATE auth.users
-- SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin","is_banned":false,"is_frozen":false}'::jsonb
-- WHERE email = 'your-email@example.com';
