# DealerPass

Sitio público, formación y espacio privado de DealerPass, construidos con **Next.js 16**, React, TypeScript y Tailwind CSS.

## Desarrollo

- Node.js **22.13 o superior**; producción utiliza Node.js 24.
- Instala las versiones del lockfile con `npm ci`.
- Copia `.env.example` a `.env.local` y configura únicamente las variables necesarias. Nunca guardes credenciales en Git.
- `npm run dev` inicia el entorno de desarrollo.
- Antes de modificar convenciones de Next.js, consulta `AGENTS.md` y los documentos de la versión instalada en `node_modules/next/dist/docs/`.

## Verificación

```bash
npm run verify
```

Ejecuta lint, pruebas unitarias, comprobación de tipos, build de producción y revisión estructural del HTML generado.

También están disponibles por separado:

- `npm run test`: políticas existentes, cálculos, validación de entradas, catálogo, filtros de inventario y recuperación de valores de la calculadora.
- `npm run typecheck`: TypeScript sin emitir archivos.
- `npm run build`: compilación de producción. La fuente Inter utiliza `next/font/google`; la primera compilación necesita acceso a la fuente.
- `npm run check:build`: después del build, comprueba enlaces internos, anclas estáticas, imágenes locales, títulos principales e IDs duplicados.
- `npm run start`: sirve el build de producción.

**Un build correcto no sustituye las pruebas de navegador.** Verifica filtros, historial Atrás/Adelante, apertura/cierre de la galería, teclado, menú móvil, anclas, movimiento reducido y formularios. Las rutas privadas requieren además una cuenta con el rol apropiado y pruebas de datos reales. La revisión estructural no valida autenticación, entrega de formularios, pagos ni dispositivos físicos.

## Estructura activa

| Ruta | Propósito |
| --- | --- |
| `app/` | Rutas y estilos del App Router |
| `components/` | Interfaz pública y privada reutilizable |
| `data/vehicle-catalogue.ts` | Datos y fotografías del catálogo público |
| `data/plans.ts` | Planes, importes de referencia y comparación |
| `lib/academy/` | Políticas, datos de formación y calculadora |
| `lib/investments/` | Validación y cálculos de inversiones |
| `tests/` | Pruebas unitarias y comprobaciones SQL documentadas |
| `scripts/check-build.mjs` | Revisión del HTML estático generado |
| `docs/` | Documentación del proyecto y auditorías |

Los archivos históricos en la raíz no son las rutas activas. Para modificar la interfaz, empieza por `app/` y `components/`.

## Identidad y contenido

Blanco y marfil, negro y naranja **#FF4D00**. Conserva la animación de la mano y el carro naranja del inicio. El catálogo utiliza vehículos reales; las portadas con fondo editado se identifican y las fichas incluyen las fotografías originales. No inventes testimonios, resultados, disponibilidad, lecciones o sesiones.

El catálogo público y el inventario privado son fuentes distintas. Registrar una compra en el espacio privado **no publica automáticamente** un vehículo ni modifica su precio público. Los filtros de búsqueda solo cambian la vista; no alteran registros, totales o permisos.

## Preparación de apertura

Consulta `docs/ACADEMY_PAYMENTS.md` antes de trabajar con membresías o cobros. `PAYMENTS_ENABLED` debe permanecer desactivado hasta que precios, contenido, condiciones y pruebas estén aprobados. Crear una cuenta no activa una membresía.

Las presentaciones, lecciones, sesiones y recursos deben publicarse solo cuando estén confirmados. El formulario de contacto depende de `LEAD_FORM_WEBHOOK_URL`; WhatsApp depende de `NEXT_PUBLIC_WHATSAPP_NUMBER`. Sin configuración, la interfaz debe explicar que la atención está en preparación, no prometer envíos o mostrar un canal ficticio.
