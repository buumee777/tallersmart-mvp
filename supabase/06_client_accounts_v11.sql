-- TallerSmart V11: cuentas de cliente, garage digital y modelo freemium.
-- Ejecutar en Supabase SQL Editor antes de desplegar la V11.

create table if not exists client_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text default 'free',
  vehicle_limit int default 1,
  created_at timestamp with time zone default now()
);

create table if not exists user_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  alias text,
  created_at timestamp with time zone default now(),
  unique(user_id, vehicle_id)
);

alter table client_profiles enable row level security;
alter table user_vehicles enable row level security;

drop policy if exists "client_profiles_select_own" on client_profiles;
drop policy if exists "client_profiles_insert_own" on client_profiles;
drop policy if exists "client_profiles_update_own" on client_profiles;
create policy "client_profiles_select_own" on client_profiles for select using (auth.uid() = user_id);
create policy "client_profiles_insert_own" on client_profiles for insert with check (auth.uid() = user_id);
create policy "client_profiles_update_own" on client_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_vehicles_select_own" on user_vehicles;
drop policy if exists "user_vehicles_insert_own" on user_vehicles;
drop policy if exists "user_vehicles_update_own" on user_vehicles;
drop policy if exists "user_vehicles_delete_own" on user_vehicles;
create policy "user_vehicles_select_own" on user_vehicles for select using (auth.uid() = user_id);
create policy "user_vehicles_insert_own" on user_vehicles for insert with check (auth.uid() = user_id);
create policy "user_vehicles_update_own" on user_vehicles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_vehicles_delete_own" on user_vehicles for delete using (auth.uid() = user_id);
