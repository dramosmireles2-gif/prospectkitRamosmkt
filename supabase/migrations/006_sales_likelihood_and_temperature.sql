-- Fase 1: Sales Likelihood Score
-- Fase 2: Temperatura del Lead
-- Nuevas columnas en prospects (con DEFAULT para compatibilidad con datos existentes)

ALTER TABLE public.prospects
ADD COLUMN IF NOT EXISTS sales_likelihood_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS lead_temperature text DEFAULT 'frio';

-- Nuevas columnas en prospect_analyses para persistir los cálculos de IA
ALTER TABLE public.prospect_analyses
ADD COLUMN IF NOT EXISTS sales_likelihood_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS lead_temperature text DEFAULT 'frio';

-- Constraint de validación
ALTER TABLE public.prospects
DROP CONSTRAINT IF EXISTS prospects_lead_temperature_check;

ALTER TABLE public.prospects
ADD CONSTRAINT prospects_lead_temperature_check
CHECK (lead_temperature IN ('frio', 'tibio', 'caliente', 'urgente'));

ALTER TABLE public.prospect_analyses
DROP CONSTRAINT IF EXISTS analyses_lead_temperature_check;

ALTER TABLE public.prospect_analyses
ADD CONSTRAINT analyses_lead_temperature_check
CHECK (lead_temperature IN ('frio', 'tibio', 'caliente', 'urgente'));
