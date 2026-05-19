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
