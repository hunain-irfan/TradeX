-- Store avg cost basis on SELL rows for accurate realized / today P&L.
-- Run once in Supabase SQL Editor.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS buy_price numeric(12, 2);
