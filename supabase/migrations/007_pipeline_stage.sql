-- Fase 3: Pipeline CRM
-- Nueva columna pipeline_stage en prospects

ALTER TABLE public.prospects
ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'lead';

ALTER TABLE public.prospects
DROP CONSTRAINT IF EXISTS prospects_pipeline_stage_check;

ALTER TABLE public.prospects
ADD CONSTRAINT prospects_pipeline_stage_check
CHECK (pipeline_stage IN ('lead','contactado','respondio','reunion','propuesta','negociacion','ganado','perdido'));
