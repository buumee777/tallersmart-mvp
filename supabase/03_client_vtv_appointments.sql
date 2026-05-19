-- TallerSmart V8: mejoras para vista cliente.
-- Ejecutar en Supabase SQL Editor antes de desplegar la V8.

alter table vehicles add column if not exists vtv_expiration_date date;

-- En MVP, el cliente consulta por patente sin cuenta. Por eso necesita ver turnos de su vehículo.
drop policy if exists "appointments_select_own_workshop" on appointments;
drop policy if exists "appointments_select_public" on appointments;
create policy "appointments_select_public" on appointments for select using (true);

-- En MVP, el cliente puede registrar/actualizar la fecha de vencimiento VTV desde la vista por patente.
drop policy if exists "vehicles_update_public_mvp" on vehicles;
create policy "vehicles_update_public_mvp" on vehicles for update using (true) with check (true);
