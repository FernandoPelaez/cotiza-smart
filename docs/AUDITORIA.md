# Auditoría de fuentes

Se inspeccionaron los archivos realmente recibidos: `cotiza-smart-reconstruido(2).zip` y `cotiza-smart-saas(2).zip`, además del prompt completo y las siete imágenes locales. Los sufijos difieren de los mencionados dentro del texto pegado; no se solicitaron archivos adicionales. El ZIP reciente se tomó como base y el anterior se conservó como referencia del flujo de demo. Ambos originales quedaron intactos durante el trabajo.

| Área auditada | Base reciente y decisión |
| --- | --- |
| Framework | Next 16, React 19, TypeScript y pnpm; conservados |
| Auth | Supabase email/password, Google, callback, recuperación y sesión; controladores preservados, UI centrada |
| Backend | Route Handlers, servicios, Zod, RPC y cuatro migraciones; preservados con una migración aditiva |
| Seguridad | `getUser`, RLS, ownership, tokens, rate limit, logos y webhook; mantenidos y sometidos a pruebas locales |
| Demo anterior | Store local, datos de ejemplo, planes simulados y recorrido completo; integrados en la nueva presentación |
| Editor | Dos pasos, catálogo corto, descuentos y IVA 0/16; reemplazados por cuatro pasos, 36 diseños y reglas nuevas |
| Documentos | HTML/PDF y snapshot, con cuatro fuentes en la base; ampliadas a ocho fuentes reales |
| Catálogo | Nueve diseños en la base reciente; ampliados a 12/12/12 con perfiles distintos |
| Notificaciones e historial | Persistencia, leído/no leído, eventos y sondeo existentes; conservados |
| Planes | $0/$99/$199 MXN y límite Free; conservados. Acceso a diseños abierto por petición explícita |
| Motion | `motion/react`, CSS y Sonner; sustituidos por GSAP y feedback central |
| Assets | Hero, laptop de beneficios, mapaches de catálogo/planes/CTA; usados como archivos locales, sin generar sustitutos |
| Pruebas | Dinero, dominio, DB PGlite, cuerpos HTTP, webhook y PDF; actualizadas y ampliadas |

Se reorganizaron controles y estilos por responsabilidad. Se eliminaron imports/dependencias obsoletos, assets duplicados y la documentación con resultados de la entrega anterior. No se añadieron credenciales, servicios inventados ni escrituras remotas.

Las comprobaciones reales de esta ejecución y sus límites están en `VALIDACION.md`; no se heredan resultados del ZIP original.
