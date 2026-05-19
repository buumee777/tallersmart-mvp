-- TallerSmart v11.0.03 · Plataforma global vehicular
-- Agrega campos para preparar los 5 módulos estratégicos: identidad digital, informe tipo Carfax, plataforma total, IA vehicular y flotas.

alter table vehicles add column if not exists global_identity_enabled boolean default true;
alter table vehicles add column if not exists vehicle_score int default 80;
alter table vehicles add column if not exists certified_history boolean default false;
alter table vehicles add column if not exists fleet_id uuid;
alter table vehicles add column if not exists marketplace_enabled boolean default false;

create table if not exists vehicle_reports (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  report_type text default 'history_certificate',
  title text default 'Historial certificado del vehículo',
  status text default 'draft',
  created_at timestamp with time zone default now()
);

create table if not exists fleet_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  language text default 'es',
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create table if not exists ai_vehicle_insights (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  insight_type text default 'maintenance_prediction',
  title text,
  description text,
  priority text default 'normal',
  status text default 'active',
  created_at timestamp with time zone default now()
);

create table if not exists marketplace_services (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid references workshops(id) on delete set null,
  category text,
  title text not null,
  description text,
  price numeric(12,2),
  country text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table vehicle_reports enable row level security;
alter table fleet_accounts enable row level security;
alter table ai_vehicle_insights enable row level security;
alter table marketplace_services enable row level security;
