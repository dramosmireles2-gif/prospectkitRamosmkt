ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS next_action_type text,
  ADD COLUMN IF NOT EXISTS next_action_date date;
