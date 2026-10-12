# Cupones en vivo · Hauscenter

React + Vite + Tailwind + Supabase. Genera cupones únicos para los lives y permite compartir la imagen.

## Puesta en marcha

1. **Base de datos**: en Supabase > SQL Editor, pega y ejecuta `supabase/schema.sql`.
2. **Usuarios**: en Authentication > Users crea tus 2 usuarios (vendedor y administrador).
   Desactiva el registro público (Authentication > Sign In / Providers > "Allow new users to sign up").
   Luego, en el SQL Editor, convierte uno en admin (el otro queda como vendedor):
   ```sql
   update public.profiles set role = 'admin', full_name = 'Tu nombre'
    where id = (select id from auth.users where email = 'admin@tuempresa.com');
   ```
3. **Credenciales**: copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. `npm install` y `npm run dev`.

## Marca

- Logo oficial: coloca `imagotipo-blanco.png`, `imagotipo-azul.png` e `isotipo.png` en `public/brand/`. Sin ellos se muestra el texto "Hauscenter" como provisional.
- Fuente KG The Fighter: copia el archivo en `src/assets/fonts/` (se registra sola). Sin ella se usa Caveat como sustituto del acento "¡Es tuyo!".
- Textos del cupón (leyenda, etiqueta "En vivo"): `src/config/brand.js`.

## Cómo funciona

- **Código**: `PALABRA-NN` (ej. `MANGO-47`), es la única columna única de `coupons`. Si hay colisión se reintenta y, si el espacio se llena, el código se alarga solo.
- **Seguridad**: un trigger en la base copia porcentaje y descripción desde `discounts` y fija el autor; un vendedor no puede inventar descuentos ni firmar como otro.
- **Roles**: vendedor (genera y ve sus cupones) · admin (además ve todos, panel con estadísticas, CSV y gestión de descuentos).
- **Nuevos descuentos**: el admin los agrega desde "Descuentos"; los cupones ya emitidos conservan su porcentaje.
- **Compartir**: hoja nativa del celular (WhatsApp, TikTok…), descargar PNG 1080×1350, copiar imagen o código, y pantalla completa para mostrar en el live.

## Despliegue

`npm run build` genera `dist/`. Incluye `vercel.json` y `public/_redirects` (Netlify) para las rutas de la SPA.
