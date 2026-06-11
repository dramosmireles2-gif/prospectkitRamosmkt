-- Módulo de Clientes y Operaciones RamosGrowth
-- Run this in Supabase SQL editor after the initial schema

-- Clientes
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  prospect_id uuid references prospects(id) on delete set null,
  name text not null,
  contact_name text,
  whatsapp text,
  email text,
  city text,
  status text not null default 'activo', -- activo | pausado | perdido
  started_at date not null default current_date,
  notes text,
  -- Recursos digitales
  website_url text,
  github_url text,
  supabase_url text,
  vercel_url text,
  domain text,
  hosting text,
  meta_business_url text,
  google_workspace text,
  analytics_url text,
  search_console_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Servicios contratados por cliente
create table if not exists client_services (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  contracted_at date not null default current_date,
  status text not null default 'activo', -- activo | pausado | cancelado | terminado
  delivered_at date,
  responsible text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pagos
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  service_id uuid references client_services(id) on delete set null,
  amount numeric(10,2) not null,
  payment_type text not null default 'unico', -- unico | mensual | trimestral | semestral | anual
  due_date date not null,
  status text not null default 'pendiente', -- pagado | pendiente | vencido
  notes text,
  paid_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Renovaciones de activos digitales
create table if not exists renewals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  type text not null default 'dominio', -- dominio | hosting | ssl | google_workspace | supabase | vercel | meta | pasarela | otro
  provider text,
  expires_at date not null,
  cost numeric(10,2),
  responsible text,
  status text not null default 'activo', -- activo | renovado | cancelado | vencido
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tareas por cliente
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text,
  priority text not null default 'media', -- alta | media | baja
  due_date date,
  status text not null default 'pendiente', -- pendiente | en_proceso | terminado
  comments text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bitácora de actividad por cliente
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  type text not null default 'nota', -- llamada | whatsapp | reunion | solicitud | pago | cambio | nota
  description text not null,
  responsible text,
  happened_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- RLS
alter table clients enable row level security;
alter table client_services enable row level security;
alter table payments enable row level security;
alter table renewals enable row level security;
alter table tasks enable row level security;
alter table activity_logs enable row level security;

-- Policies (same pattern as prospects — uses is_workspace_member helper)
create policy "workspace members can manage clients"
  on clients for all using (public.is_workspace_member(workspace_id));

create policy "workspace members can manage client_services"
  on client_services for all using (public.is_workspace_member(workspace_id));

create policy "workspace members can manage payments"
  on payments for all using (public.is_workspace_member(workspace_id));

create policy "workspace members can manage renewals"
  on renewals for all using (public.is_workspace_member(workspace_id));

create policy "workspace members can manage tasks"
  on tasks for all using (public.is_workspace_member(workspace_id));

create policy "workspace members can manage activity_logs"
  on activity_logs for all using (public.is_workspace_member(workspace_id));
