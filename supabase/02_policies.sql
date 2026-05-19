-- Ejecutar después del script de tablas. Estas políticas son para MVP real.
-- Permiten historial público por patente y gestión privada por taller autenticado.

create policy "workshops_select_public" on workshops for select using (true);
create policy "workshops_insert_owner" on workshops for insert with check (auth.uid() = owner_id);
create policy "workshops_update_owner" on workshops for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "workshops_delete_owner" on workshops for delete using (auth.uid() = owner_id);

create policy "vehicles_select_public" on vehicles for select using (true);
create policy "vehicles_insert_authenticated" on vehicles for insert with check (auth.role() = 'authenticated');
create policy "vehicles_update_authenticated" on vehicles for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "clients_select_own_workshop" on clients for select using (exists (select 1 from workshops w where w.id = clients.workshop_id and w.owner_id = auth.uid()));
create policy "clients_insert_own_workshop" on clients for insert with check (exists (select 1 from workshops w where w.id = clients.workshop_id and w.owner_id = auth.uid()));
create policy "clients_update_own_workshop" on clients for update using (exists (select 1 from workshops w where w.id = clients.workshop_id and w.owner_id = auth.uid())) with check (exists (select 1 from workshops w where w.id = clients.workshop_id and w.owner_id = auth.uid()));
create policy "clients_delete_own_workshop" on clients for delete using (exists (select 1 from workshops w where w.id = clients.workshop_id and w.owner_id = auth.uid()));

create policy "jobs_select_public" on jobs for select using (true);
create policy "jobs_insert_own_workshop" on jobs for insert with check (exists (select 1 from workshops w where w.id = jobs.workshop_id and w.owner_id = auth.uid()));
create policy "jobs_update_own_workshop_or_public_payment_demo" on jobs for update using (true) with check (true);
create policy "jobs_delete_own_workshop" on jobs for delete using (exists (select 1 from workshops w where w.id = jobs.workshop_id and w.owner_id = auth.uid()));

create policy "appointments_select_own_workshop" on appointments for select using (exists (select 1 from workshops w where w.id = appointments.workshop_id and w.owner_id = auth.uid()));
create policy "appointments_insert_own_workshop" on appointments for insert with check (exists (select 1 from workshops w where w.id = appointments.workshop_id and w.owner_id = auth.uid()));
create policy "appointments_update_own_workshop" on appointments for update using (exists (select 1 from workshops w where w.id = appointments.workshop_id and w.owner_id = auth.uid())) with check (exists (select 1 from workshops w where w.id = appointments.workshop_id and w.owner_id = auth.uid()));
create policy "appointments_delete_own_workshop" on appointments for delete using (exists (select 1 from workshops w where w.id = appointments.workshop_id and w.owner_id = auth.uid()));

create policy "payments_select_public" on payments for select using (true);
create policy "payments_insert_own_workshop" on payments for insert with check (exists (select 1 from workshops w where w.id = payments.workshop_id and w.owner_id = auth.uid()));
create policy "payments_update_own_workshop" on payments for update using (exists (select 1 from workshops w where w.id = payments.workshop_id and w.owner_id = auth.uid())) with check (exists (select 1 from workshops w where w.id = payments.workshop_id and w.owner_id = auth.uid()));
