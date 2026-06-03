-- Allow 'claude' as a valid source value for prospect_analyses.
-- The original constraint only allowed 'heuristic'.

ALTER TABLE public.prospect_analyses
DROP CONSTRAINT IF EXISTS prospect_analyses_source_check;

ALTER TABLE public.prospect_analyses
ADD CONSTRAINT prospect_analyses_source_check
CHECK (source IN ('heuristic', 'claude'));
