-- TallerSmart V9: campos para pagos Mercado Pago y dirección compatible con Google Maps.
-- Ejecutar en Supabase SQL Editor antes de desplegar la V9.

alter table workshops add column if not exists address_street text;
alter table workshops add column if not exists address_number text;
alter table workshops add column if not exists city text;
alter table workshops add column if not exists state text;
alter table workshops add column if not exists country text default 'Argentina';

alter table jobs add column if not exists mp_payment_id text;
alter table jobs add column if not exists mp_preference_id text;

alter table payments add column if not exists preference_id text;
alter table payments add column if not exists payment_link text;

-- Para MVP/Sandbox: permite que el retorno del pago actualice el estado del trabajo.
-- En producción esto debe quedar en backend/webhook con service role.
drop policy if exists "jobs_update_public_payment_return_v9" on jobs;
create policy "jobs_update_public_payment_return_v9" on jobs for update using (true) with check (true);
