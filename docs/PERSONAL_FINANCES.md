# Finanzas personales

Ruta: `/mi-cuenta/finanzas`. Entrada desde el resumen y «Mis finanzas» en la navegación de escritorio y móvil. Disponible para cada cuenta confirmada, sin depender de membresía o rol de equipo.

## Comportamiento

- Ingresos y gastos/pagos con concepto, monto, fecha, categoría, medio de pago y notas opcionales.
- Estado recibido/pagado o pendiente. Los pendientes no cambian el saldo registrado.
- USD y COP se resumen por separado, sin conversión. El saldo no representa una cuenta bancaria conectada.
- Filtro por moneda y mes, búsqueda y filtros de lista. Los filtros de búsqueda/tipo no cambian el resumen del período.
- Editar con control de versión; archivar con confirmación y restaurar, sin borrado definitivo.
- UUID estable por formulario para evitar duplicados tras doble clic o respuesta incierta. Errores conservan los campos; un conflicto de versión pide recargar y revisar.
- No importa, publica ni modifica vehículos, inversiones, gastos de vehículos, membresías o pagos reales.

## Acceso y almacenamiento

Los registros están en `public.personal_finance_transactions`. Cada lectura y acción verifica la sesión con `auth.getUser()`, exige correo confirmado y rechaza usuarios anónimos. La cuenta propietaria sale de esa identidad, no del formulario. La marca de cuenta del formulario solo detecta cambios de sesión.

Todas las consultas de finanzas usan el cliente autenticado, nunca la clave de servicio. RLS fuerza propiedad por `auth.uid()` para SELECT/INSERT/UPDATE. UPDATE incluye USING y WITH CHECK. Las autorizaciones por columna impiden alterar propietario, ID y versión; un trigger invocador mantiene versión y fechas. No hay política especial para administradores del negocio, privilegios DELETE, ni permisos para anon/service_role.

`personal_finance_entries()` es una función STABLE/SECURITY INVOKER sin argumentos. Devuelve únicamente columnas de visualización, con filtro de propietario y RLS, como una instantánea JSON de una sola consulta. Evita límites de filas de PostgREST y carreras de paginación OFFSET.

Ruta dinámica bajo el proxy existente con `Cache-Control: private, no-store`; sin almacenamiento financiero en localStorage/sessionStorage, registros de consola ni exportaciones públicas. Esto aísla usuarios de la aplicación, no constituye cifrado de extremo a extremo: operadores autorizados de la infraestructura y respaldos siguen sujetos a sus controles administrativos.

## Verificación del 5 de noviembre de 2026

- `npm run verify`: 234 pruebas aprobadas, TypeScript, build, revisión estructural y lint (solo advertencia previa en lib/analytics.ts).
- 35 aserciones PostgreSQL locales con PGlite 0.5.15: usuarios A/B/admin, accesos cruzados, anónimos, service_role, restricciones de columna, duplicados, versiones, archivo/restauración y una instantánea de más de 1100 filas.
- Migración aplicada a DealerPass con versión `20261105233019`, coincidente con la historia remota.
- `tests/personal-finances-hosted-rollback.sql`: verificación en la base alojada bajo roles/claims de propietario, tercero con rol administrativo, anónimo y service_role. Transacción revertida; consulta posterior confirmó ausencia de la fila sintética y cero movimientos personales persistidos. Sin crear usuarios Auth o credenciales.
- Advisor: sin advertencias nuevas de esta función. Se conserva advertencia previa de protección de contraseñas filtradas desactivada; no se cambió configuración Auth.
- No se completó QA visual/interactivo con sesiones reales. Chromium local no pudo abrir su socket y el navegador remoto no alcanzó el servidor local. El código incluye adaptación para 320px y navegación de seis opciones, pero no se presenta como verificado en dispositivos reales.

### Reproducir pruebas PostgreSQL locales

Instala `@electric-sql/pglite@0.5.15` en una carpeta de herramientas separada; no utiliza una base alojada. Ejecuta `scripts/test-personal-finances-db.mjs` con `PGLITE_MODULE` apuntando al URL file:// de su módulo dist/index.js. El script crea roles y usuarios exclusivamente sintéticos en PostgreSQL local en memoria.

La prueba alojada necesita acceso SQL de operador, usa solo una fila sintética y termina siempre en ROLLBACK cuando todas las aserciones pasan. Si falla una aserción, no confirmes la transacción; revierte antes de continuar. No uses una cuenta real para pruebas de navegador con importes inventados persistentes.

## Publicación y reversión

La migración es aditiva y no altera datos anteriores. Desplegar primero el esquema y después la aplicación. Para revertir la interfaz, desplegar el commit anterior y conservar la tabla privada: no borrar datos de usuarios ni deshacer restricciones RLS.
