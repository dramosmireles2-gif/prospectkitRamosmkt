CREATE TABLE IF NOT EXISTS public.prospect_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'borrador'
    CHECK (status IN ('borrador','enviada','negociacion','aceptada','rechazada')),
  services jsonb NOT NULL DEFAULT '[]',
  total_original integer NOT NULL DEFAULT 0,
  total_negotiated integer NOT NULL DEFAULT 0,
  notes text,
  sent_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospect_proposals_prospect_id_idx ON public.prospect_proposals(prospect_id);

ALTER TABLE public.prospect_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can manage proposals"
  ON public.prospect_proposals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = prospect_proposals.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );
