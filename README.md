# TallerSmart Real MVP V9 - Mercado Pago Sandbox

## Qué incluye
- Conexión a Supabase.
- Vista de taller y cliente.
- VTV y turnos.
- Link de Google Maps mejorado con dirección separada.
- Botón **Pagar con Mercado Pago** en el detalle del trabajo.
- Creación de preferencia de pago mediante Vercel Serverless Function.
- Retorno de Mercado Pago que marca el trabajo como **Pago acreditado** en modo Sandbox/MVP.

## Antes de desplegar
1. Ejecutar en Supabase SQL Editor:
   - `supabase/04_payments_maps_v9.sql`

2. En Vercel → Project Settings → Environment Variables agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MP_PUBLIC_KEY`
   - `MP_ACCESS_TOKEN`  ← Access Token de prueba de Mercado Pago. No subirlo a GitHub.

3. Subir a GitHub:
   - `api`
   - `public`
   - `src`
   - `supabase`
   - `index.html`
   - `package.json`
   - `README.md`

No subir `node_modules` ni `package-lock.json`.

## Importante
Esta versión usa Sandbox/MVP. En producción real conviene confirmar pagos con webhook y Service Role en backend.


## V11 Cliente Freemium

Ejecutar en Supabase: `supabase/06_client_accounts_v11.0.01.sql`.

Incluye ingreso por cliente con correo y contraseña, registro de usuario cliente, garage digital, 1 vehículo gratis y estructura para Cliente PRO con múltiples vehículos.


## V11.0.01
- Onboarding cliente
- Dashboard de salud del vehículo
- Score del vehículo
- Alertas inteligentes
- Historial premium visual
- Fotos y documentos preparado
- Talleres favoritos
- Vehículo compartido preparado
- IA vehicular demo
- Exportación PDF preparada

Ejecutar en Supabase: `supabase/07_client_experience_v11001.sql`.
