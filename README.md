# Cotiza Smart

SaaS para crear cotizaciones en MXN, personalizarlas, exportarlas a PDF y compartir un enlace con respuesta del cliente. Esta entrega reconstruye landing, autenticación, workspace, editor y documentos, conservando Supabase, Stripe, RLS y la demo aislada.

Incluye **36 plantillas: 12 Free, 12 Pro y 12 Premium**, todas seleccionables en cualquier plan, **8 fuentes locales**, 24 colores y color personalizado. Las nuevas cotizaciones usan **IVA 16% y ningún descuento**.

## Ejecutar

Probado con Node.js **24.19.0** y pnpm **11.25.0**; mínimo declarado Node 22.13.0.

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Abre `http://localhost:3000`. La ruta `/demo` funciona sin credenciales y conserva los datos de ejemplo en este navegador. Para una compilación de producción:

```bash
pnpm build
pnpm start
```

La demo permite crear, editar borradores, duplicar, buscar, filtrar, compartir en otra pestaña del mismo navegador, responder, consultar notificaciones e historial y descargar PDF. Puedes simular planes y reiniciarla desde el menú de la cuenta. No escribe en Supabase ni hace cobros; sus enlaces no funcionan en otros dispositivos.

## Reglas de negocio

| Plan | Precio mensual | Creaciones | Acceso a plantillas en esta edición |
| --- | --- | --- | --- |
| Free | $0 MXN | 3 creaciones totales | Las 36 |
| Pro | $99 MXN | Durante la suscripción activa | Las 36 |
| Premium | $199 MXN | Durante la suscripción activa | Las 36 |

Eliminar no devuelve créditos. Duplicar consume una creación cuando corresponde. Las categorías del catálogo se conservan como metadatos; no existe bloqueo por categoría. No se han inventado diferencias comerciales nuevas entre Pro y Premium.

Los borradores guardados y válidos se autoguardan después de 1.8 segundos sin cambios, con revisión optimista. Compartir congela el negocio y el contenido; una propuesta enviada se modifica duplicándola. Aceptar o rechazar genera evento y notificación en la misma transacción. La campana distingue leído/sin leer y se actualiza con el workspace cada 30 segundos cuando está visible.

Cantidades: hasta tres decimales; precios: dos. Se redondea cada partida en centavos, se suma el subtotal y se redondea su IVA al 16%. Los documentos históricos conservan descuentos/tasas al consultarlos; una edición o duplicación explícita usa descuento cero e IVA 16%. Máximo 100 conceptos. El campo técnico `discount` permanece por compatibilidad, fijo en cero en nuevas escrituras.

## Arquitectura

| Ubicación | Responsabilidad |
| --- | --- |
| `app/` | Páginas, layouts, metadata, carga servidor y Route Handlers |
| `components/marketing`, `auth`, `workspace`, `editor` | Presentación por área |
| `components/templates` | Catálogo común, filtros, paginación y preview |
| `components/quotes`, `components/quotes/pdf` | Documento HTML, página pública y componentes PDF |
| `components/feedback`, `components/shared` | Feedback centrado y motion reutilizable |
| `hooks/` | Controladores de auth, negocio, editor, listado, descarga, sharing y navegación |
| `lib/domain`, `lib/schemas`, `types` | Reglas puras, catálogo, cálculos, contratos y tipos |
| `lib/services`, `lib/supabase`, `lib/storage` | Servicios, RPC, autenticación y logos |
| `lib/motion` | GSAP, tokens y contexto de modales |
| `lib/pdf`, `lib/demo` | Adaptador PDF/fuentes y operaciones locales de demo |
| `supabase/migrations` | Cinco migraciones; las cuatro recibidas no se modificaron |
| `tests`, `scripts`, `examples/pdf` | Pruebas y 37 PDF reproducibles |

Stack conservado: Next.js 16.3.6, React 19.2.6, TypeScript, Tailwind 4, Radix/Base UI, Lucide, Supabase, Stripe, React PDF y Sharp. Motion visual exclusivamente GSAP y `@gsap/react`; React PDF se importa al descargar. Fuentes y licencias en `public/fonts` y `docs/licenses`.

## Variables de entorno

No hay variables nuevas respecto al proyecto reciente recibido. `.env.example` contiene únicamente valores locales y campos vacíos.

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Origen canónico, sin barra final |
| `DEMO_ENABLED` | `true` por defecto; `false` deshabilita la demo y sus accesos |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publishable o JWT anon; nunca service_role |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor: operaciones públicas controladas y facturación |
| `BILLING_MODE` | `test` para validar; `live` únicamente al activar producción |
| `STRIPE_SECRET_KEY` | Clave Stripe del entorno correspondiente |
| `STRIPE_WEBHOOK_SECRET` | Secreto de firma del webhook del mismo entorno |
| `STRIPE_PRICE_PRO` | Precio mensual recurrente: 9900 centavos MXN |
| `STRIPE_PRICE_PREMIUM` | Precio mensual recurrente: 19900 centavos MXN |

## Migraciones y cuentas reales

Antes de usar los nuevos diseños con Supabase, aplica las migraciones pendientes en orden. En una base que ya tenga 001–004, aplica **solo `202610040005_catalog_tax_motion.sql`**. Esta migración amplía el catálogo y las fuentes, exige IVA 16%/descuento cero, abre todas las categorías y normaliza las copias. No reescribe documentos históricos.

| Migración | Propósito |
| --- | --- |
| `202610030001_cotiza_smart.sql` | Modelo, permisos, RPC, planes y eventos Stripe |
| `202610030002_business_logos.sql` | Bucket y políticas por propietario |
| `202610030003_templates_notifications.sql` | Catálogo anterior y notificaciones |
| `202610030004_duplicate_quotes.sql` | Duplicación autorizada e idempotente |
| `202610040005_catalog_tax_motion.sql` | Reglas y catálogo de esta reconstrucción |

Para una base nueva aplica las cinco, por SQL Editor o con Supabase CLI después de vincular el proyecto. Para una base existente verifica primero su historial. No ejecutes de nuevo migraciones ya aplicadas.

Configura email/password, confirmación y SMTP. Añade los orígenes exactos a Auth y los redirects `/auth/callback`, incluidos los retornos internos permitidos y `?next=/reset-password`. Para Google configura su cliente OAuth y el callback indicado por Supabase, y activa el proveedor. Prueba confirmación, recuperación, Google y cierre de sesión con cuentas de prueba.

El bucket `business-logos` es público; la escritura y eliminación se limitan a la carpeta UUID del usuario. Nuevas cargas: PNG/JPEG/WebP, máximo 2 MiB y cuatro megapíxeles; Sharp decodifica, reduce a 1024 px y normaliza a PNG sin metadatos.

## Stripe

Usa primero un sandbox y `BILLING_MODE=test`. Configura los dos precios mensuales MXN, el portal de cliente y `/api/billing/webhook`. Suscribe los eventos de Checkout, suscripción y factura descritos por el handler. Para pruebas locales con Stripe CLI: `stripe listen --forward-to localhost:3000/api/billing/webhook`.

Prueba alta Pro/Premium, renovación, cambio, cancelación, pago fallido y reintentos. El webhook verifica firma, entorno y pertenencia, consulta el estado actual y aplica cada evento una vez. **El retorno de Checkout no activa un plan**. No se contactaron cuentas Stripe ni se realizaron cobros.

## Validación

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm audit --prod --audit-level=low
pnpm build
pnpm pdf:examples
```

Consulta resultados exactos en `docs/VALIDACION.md` y logs de esta ejecución en `docs/checks`. Las pruebas de base ejecutan las cinco migraciones en PostgreSQL WASM (PGlite), con roles y negocios separados. PGlite no sustituye Supabase Auth, Storage o Stripe reales.

Se renderizaron los 36 diseños y un documento de 100 conceptos. Los PDF de ejemplo están en `examples/pdf`. HTML y PDF comparten perfiles, contenido, fuentes, colores y cálculos; el PDF usa su propio motor de paginación A4.

**Límite de verificación:** no se ejecutó QA web interactiva en navegador. Está pendiente revisar los anchos 360, 390, 430, 768, 1024, 1280, 1440 y 1920 px, teclado y flujos reales de proveedores. No se declara validada una puesta en producción.

## Entrega y despliegue

El ZIP contiene el código fuente, lockfile, assets, fuentes, migración, documentación y PDF. No contiene dependencias instaladas, compilaciones ni credenciales. Importa el proyecto en tu repositorio y proveedor de hosting, configura las variables y aplica las migraciones pendientes. No se realizó despliegue ni push.

Reporte de los 18 puntos solicitados: `docs/RESUMEN_TECNICO.md`. Decisiones y auditoría: `docs/ARQUITECTURA.md` y `docs/AUDITORIA.md`.
