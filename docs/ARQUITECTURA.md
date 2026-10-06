# Arquitectura final

Las páginas y la carga autenticada inicial permanecen en servidor. La landing compone secciones; sus islas cliente son navegación, recorrido, catálogo, FAQ y wrappers GSAP. No se convirtió la página completa en Client Component.

## Contratos y operaciones

La UI depende de `types/`, `lib/domain/` y hooks. Los hooks delegan operaciones en `WorkspaceProvider`, Auth o adaptadores; las operaciones reales pasan por Route Handlers, Zod, servicios `server-only` y RPC autorizados. Los cálculos, fechas, estados, búsqueda y planes son funciones puras.

`useQuoteDraft` controla edición, validación por pasos y autoguardado. `useQuotesList` controla búsqueda, filtros, paginación y mutaciones del listado. `useQuoteShare` y `usePdfDownload` separan operaciones de sus modales/botones. `useAuthForm` y `useBusinessForm` conservan Auth y onboarding fuera del JSX de campos.

La demo usa `useSyncExternalStore`, almacenamiento local validado y operaciones propias. No se transforma en fallback de autenticación ni en permiso para escribir en producción.

## Catálogo y dinero

`template-ids.ts` define los 36 identificadores; `templates.ts` declara categoría, fuente, color y perfil estructural. Cada perfil combina cabecera, título, cliente/fechas, tabla, totales, marco, densidad y orden. `QuoteDocument` traduce ese perfil a HTML/CSS y `pdfLayout` a puntos del renderer PDF. Las categorías son metadatos y las 36 composiciones son seleccionables en los tres planes.

`design.ts` centraliza ocho fuentes locales, 24 colores y contraste para color personalizado. `money.ts` separa cálculo nuevo (IVA fijo 16%, descuento cero) de lectura histórica. Cantidades con tres decimales y precios con dos se convierten a enteros antes de redondear por línea; SQL usa `numeric` con el mismo orden. La migración 005 no altera importes históricos.

El editor divide cliente, conceptos, diseño y revisión. Se muestran tres conceptos por página; la vista compacta muestra hasta cinco y sus totales incluyen todos. El documento completo y su PDF mantienen los 100 conceptos permitidos. Notas/condiciones extensas se paginan en un anexo PDF; no se rasteriza el texto.

## Motion y accesibilidad

GSAP es el único motor: hero con máscaras y stagger, reveal de secciones, cambios de contenido laterales, indicador de tabs, FAQ con altura, modales con retención de foco durante salida y microinteracciones. `gsap.matchMedia` y comprobaciones de la preferencia de movimiento reducido evitan movimiento cuando corresponde. Contextos, observadores y listeners tienen limpieza.

Las primitivas Radix conservan Escape, foco y semántica. Feedback central con `status`/`alert`, cierre y duración; las confirmaciones destructivas siguen siendo diálogos previos a la operación. Los estados combinan texto, icono y color. Las vistas móvil usan listados y controles reorganizados; la revisión visual de navegador queda pendiente y está documentada.

## Persistencia y seguridad conservadas

| Área | Garantía implementada |
| --- | --- |
| Sesión | `getUser()` servidor, redirects internos permitidos y proxy de rutas |
| Datos privados | RLS y propiedad; RPC vuelven a validar dueño, estado, revisión y plan |
| Free | Tres creaciones totales; bloqueo por negocio, sin devolución al eliminar |
| Edición | Solo borradores, revisión optimista y conflicto visible |
| Compartir | Token aleatorio de 256 bits, snapshot del negocio y contenido congelado |
| Respuesta | Vigencia, estado, bloqueo e idempotencia; evento/notificación atómicos |
| Eliminar | Borrado lógico y revocación del enlace; historial preservado |
| Facturación | Firma, entorno, negocio/cliente e idempotencia de webhook |
| Archivos | Límites de bytes/píxeles, decodificación y PNG normalizado |
| Secretos | Solo módulos servidor; claves públicas publishable/anon validadas |

El modelo mantiene las tablas `cs_*` existentes y Storage. Esta entrega no añade tablas ni endpoints. La migración nueva inserta catálogo y sustituye tres funciones transaccionales conservando sus controles. Las migraciones 001–004 permanecen idénticas al ZIP reciente.

La consulta agregada del workspace y el sondeo de 30 segundos se conservan. Para grandes volúmenes, la futura evolución sería paginar esa consulta en servidor. No se introduce otra biblioteca de estado ni un backend paralelo.
