-- Extend price alerts + email log. Run once in Supabase SQL Editor.

ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS alert_name text,
  ADD COLUMN IF NOT EXISTS stock_name text,
  ADD COLUMN IF NOT EXISTS alert_type text NOT NULL DEFAULT 'price',
  ADD COLUMN IF NOT EXISTS frequency text NOT NULL DEFAULT 'once_per_day',
  ADD COLUMN IF NOT EXISTS last_notified_at timestamptz;

UPDATE public.alerts
SET alert_name = COALESCE(alert_name, stock_symbol || ' alert'),
    stock_name = COALESCE(stock_name, stock_symbol),
    alert_type = COALESCE(alert_type, 'price'),
    frequency = COALESCE(frequency, 'once_per_day')
WHERE alert_name IS NULL OR stock_name IS NULL;

CREATE TABLE IF NOT EXISTS public.alert_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES public.alerts (id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  user_email text NOT NULL,
  subject text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alert_email_log_user_select" ON public.alert_email_log;
CREATE POLICY "alert_email_log_user_select" ON public.alert_email_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alert_email_log_service_insert" ON public.alert_email_log;
CREATE POLICY "alert_email_log_service_insert" ON public.alert_email_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
