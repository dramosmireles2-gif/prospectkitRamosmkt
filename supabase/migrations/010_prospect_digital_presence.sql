ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS social_notes text;

ALTER TABLE public.prospect_analyses
  ADD COLUMN IF NOT EXISTS digital_diagnosis jsonb;
