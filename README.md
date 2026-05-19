# TallerSmart Real MVP v7.0

Conectado a Supabase.

Antes de desplegar, ejecutar en Supabase SQL Editor:
1. Script de tablas ya ejecutado.
2. `supabase/02_policies.sql` para habilitar permisos RLS.

Subir a GitHub: public, src, index.html, package.json, README.md y carpeta supabase.
No subir node_modules ni package-lock.json.

## V8 - Cambios cliente
Antes de desplegar la V8, ejecutar en Supabase SQL Editor:

`supabase/03_client_vtv_appointments.sql`

Incluye:
- Vista cliente con sesión por patente y cerrar sesión.
- Inicio del cliente con turnos asignados.
- Menú cliente con Trabajos realizados.
- Detalle de trabajo con volver atrás, pagos demo y datos del taller.
- Link de Google Maps corregido.
- Fecha de vencimiento VTV y alerta roja 30 días antes.
