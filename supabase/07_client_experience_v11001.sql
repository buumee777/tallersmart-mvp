-- TallerSmart v11.0.01 - experiencia cliente premium
create table if not exists favorite_workshops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  workshop_id uuid references workshops(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, workshop_id)
);

create table if not exists vehicle_shares (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  invited_email text not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  title text not null,
  file_url text,
  document_type text default 'general',
  created_at timestamp with time zone default now()
);

alter table favorite_workshops enable row level security;
alter table vehicle_shares enable row level security;
alter table vehicle_documents enable row level security;

drop policy if exists "favorite_workshops_owner_all" on favorite_workshops;
create policy "favorite_workshops_owner_all" on favorite_workshops for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "vehicle_shares_owner_all" on vehicle_shares;
create policy "vehicle_shares_owner_all" on vehicle_shares for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists "vehicle_documents_owner_all" on vehicle_documents;
create policy "vehicle_documents_owner_all" on vehicle_documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
