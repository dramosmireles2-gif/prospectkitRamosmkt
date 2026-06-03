-- Backfill workspace + profile for users that registered before the trigger existed.
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING).

DO $$
DECLARE
  rec record;
  base_name text;
  workspace_slug text;
  new_workspace_id uuid;
BEGIN
  FOR rec IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    base_name := COALESCE(rec.raw_user_meta_data->>'full_name', split_part(rec.email, '@', 1));

    -- Crear profile si no existe
    INSERT INTO public.profiles (id, full_name)
    VALUES (rec.id, base_name)
    ON CONFLICT (id) DO NOTHING;

    -- Crear workspace solo si el usuario no tiene ninguno
    IF NOT EXISTS (SELECT 1 FROM public.workspace_members WHERE user_id = rec.id) THEN
      workspace_slug := trim(both '-' from lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g')))
                        || '-' || left(rec.id::text, 8);

      INSERT INTO public.workspaces (name, slug, owner_user_id, plan_code, subscription_status)
      VALUES (base_name || ' Workspace', workspace_slug, rec.id, 'starter', 'active')
      RETURNING id INTO new_workspace_id;

      INSERT INTO public.workspace_members (workspace_id, user_id, role)
      VALUES (new_workspace_id, rec.id, 'owner');

      RAISE NOTICE 'Workspace creado para %', rec.email;
    ELSE
      RAISE NOTICE 'Ya tiene workspace: %', rec.email;
    END IF;
  END LOOP;
END $$;
