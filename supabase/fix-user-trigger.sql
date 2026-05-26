-- ============================================================
-- FIX: "Database error creating new user"
-- Cause: wallet was inserted BEFORE auth.users row existed
-- Run this in Supabase SQL Editor, then create user again
-- ============================================================

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
