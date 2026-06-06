-- Allow users to delete their own transactions (required for History "Undo Last Trade").
-- Run in Supabase SQL Editor after phase5-schema.sql.

DROP POLICY IF EXISTS "transactions_user_delete" ON public.transactions;

CREATE POLICY "transactions_user_delete" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);
