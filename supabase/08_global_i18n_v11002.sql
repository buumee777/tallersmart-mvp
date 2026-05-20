alter table workshops add column if not exists country text default 'Argentina';
alter table workshops add column if not exists language text default 'es';
alter table client_profiles add column if not exists country text default 'Argentina';
alter table client_profiles add column if not exists language text default 'es';
