# Validación de esta entrega

Fecha: 4 de octubre de 2026. Runtime: Node 24.19.0, pnpm 11.25.0. Se usaron los servicios simulados locales de las pruebas; no se aportaron credenciales para conectar Supabase/Google/Stripe.

## Resultados automatizados

| Comando | Resultado |
| --- | --- |
| `pnpm install --frozen-lockfile` | Completado |
| `pnpm lint` | Código 0; sin errores ni advertencias |
| `pnpm typecheck` | Código 0; tipos de rutas generados y TypeScript sin errores |
| `pnpm test` | Código 0; **78 pruebas, 78 aprobadas, 0 fallidas, 0 omitidas** |
| `pnpm audit --prod --audit-level=low` | Código 0; ninguna vulnerabilidad conocida reportada en esa consulta |
| `pnpm build` | Código 0; compilación de producción webpack |
| `pnpm pdf:examples` | Código 0; 36 diseños y un documento extenso generados |

Los logs en `docs/checks` corresponden a esta ejecución y a la repetición solicitada al continuar. El test completo terminó en 16.26 segundos. Las duraciones dependen del equipo; no son métricas de rendimiento del producto.

## Cobertura real

- Cálculos de centavos, cantidades fraccionarias, IVA 16%, eliminación de descuentos nuevos y conservación de lectura histórica.
- 36 IDs únicos, 12 por categoría, filtros, perfiles distintos y destinos de retorno de Auth para todos los diseños.
- Búsqueda por título, cliente y folio, insensible a acentos, combinada con estados y vencimiento.
- Guardado/edición/copia/sharing/respuestas de demo, revisión concurrente, límite Free y notificación única para aceptación/rechazo.
- Cinco migraciones aplicadas en PGlite: aislamiento de dos negocios, RLS, propiedad, créditos, catálogo completo, invariantes transaccionales e idempotencia.
- Validación de claves públicas, destinos de autenticación, archivos PNG/WebP, límite de píxeles y lectura del cuerpo HTTP por bytes.
- Firma Stripe válida y rechazo de falsificaciones, edición del cuerpo y replay viejo. No equivale a probar Checkout/Portal con Stripe remoto.
- Exportación de las 36 plantillas, las ocho fuentes locales, logo normalizado y documento de 100 conceptos.
- Artefactos de build: 26 entradas de rutas, 13 rutas críticas comprobadas; sin símbolos de secretos privados buscados en chunks del navegador.
- Sin reglas `@keyframes`, `animation` o `transition` en el CSS compilado inspeccionado.
- Las cuatro migraciones originales se compararon byte a byte con el ZIP reciente: idénticas.

## PDF y assets

Se renderizaron y revisaron las hojas visuales de las tres categorías, además de páginas de detalle, primera/intermedias/final del documento extenso y su anexo. Los 36 ejemplos estándar tienen una página A4; el caso de 100 conceptos tiene 13 páginas. Las ocho fuentes se incrustan en los PDF durante pruebas.

Se extrajo texto y se comprobó presencia de IVA/total, tamaños A4 y coordenadas de texto en las 37 exportaciones: sin texto fuera de página. Esto complementa la inspección visual; no certifica toda combinación arbitraria de contenido y diseño. Los límites de texto siguen definidos por Zod/SQL.

Las cinco imágenes usadas bajo `public/images/mascot` coinciden por SHA-256 con los adjuntos. No se generaron nuevas mascotas. Las hojas de contacto actuales están en `docs/previews`, y los detalles verificables en `pdf-layout.json` y `assets.json`.

## QA web pendiente

La guía Sites del entorno administrado permite QA en navegador únicamente con `control-browser`; esa herramienta no estaba disponible. Por esa restricción no se inició servidor de preview ni se usó una vía alternativa de control. Se revisó el código responsive y se compiló el producto, pero **no se validó la interfaz interactiva en un navegador**.

| Ancho | Implementación prevista | Estado de revisión visual |
| --- | --- | --- |
| 360 px | Menú móvil, hero completo, catálogo de una columna, listado y editor por pasos | Pendiente |
| 390 px | Formularios y acciones reorganizados, documento adaptable | Pendiente |
| 430 px | Recorrido compacto y controles accesibles | Pendiente |
| 768 px | Catálogo de dos columnas y distribución tablet | Pendiente |
| 1024 px | Navegación compacta y áreas de trabajo adaptadas | Pendiente |
| 1280 px | Tabla de cotizaciones y editor con preview | Pendiente |
| 1440 px | Composición desktop y catálogo de tres columnas | Pendiente |
| 1920 px o más | Contenedor limitado y hero sin recorte del asset | Pendiente |

Antes de producción, revisar: ausencia de overflow horizontal, anchors y scrollspy, menú móvil, filtros/paginación, foco/Escape, teclado, movimiento reducido, campana, todos los modales, feedback centrado, edición/autoguardado, sharing en otra pestaña y descarga de PDF. Revisar asimismo lectura del documento público en móvil.

## Integraciones pendientes

1. Aplicar la migración 005 en la base destino (o las cinco si está vacía), después de revisar su historial.
2. Conectar Supabase Auth/Storage y verificar con dos cuentas reales de prueba; confirmar que cada propietario ve solo su negocio.
3. Probar email, confirmación, recuperación, Google, callbacks, sesión y logout en el origen de despliegue.
4. Configurar y probar Checkout, Portal y webhook en Stripe test; no habilitar pagos live sin esa validación.
5. Publicar en el hosting elegido y revisar la matriz web anterior.

No se realizaron cobros, escrituras de producción, despliegue ni push. Las pruebas locales no sustituyen esas comprobaciones externas.

## Continuación y conservación del trabajo

Se intentaron `git status` y `git diff`: la carpeta no contiene `.git`, por lo que no existe un repositorio donde crear un commit. Antes de continuar se creó y guardó un checkpoint ZIP con 292 archivos, manifiesto SHA-256 e inventario de cambios. Frente a la base reciente registra 83 archivos nuevos, 101 modificados y ocho retirados durante la reconstrucción anterior. No se reextrajo ningún ZIP.

Se compararon 195 archivos de implementación, tests, scripts, migraciones y dependencias contra el checkpoint: 194 permanecen idénticos. El único cambio adicional de código está en `app/globals.css`: fuentes explícitas de Tailwind para impedir que el contenido de documentación genere utilidades de movimiento. La comprobación del CSS compilado había detectado esa utilidad sobrante después de escribir los reportes. El diff exacto se conserva en `docs/checks/continuation-fix.patch`.

En la repetición, el primer intento de lint encontró un `ENOENT` en metadatos temporales de pnpm al ejecutar comandos concurrentes. ESLint no llegó a iniciarse en ese intento. Se repitieron los cuatro comandos de forma secuencial; el error inicial se conserva junto a los logs finales. No fue necesario modificar código para resolver el incidente de pnpm.

Se comprobaron también los seis anchors en el HTML prerenderizado, el enlace del logo al hero, FAQ en navegación y el CTA del hero a `/demo`. Es una verificación estructural; no equivale a probar scroll o interacción en navegador.
