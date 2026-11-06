# Dinero recibido para invertir

Ruta: `/mi-cuenta/finanzas/capital`, disponible desde Finanzas personales para cada cuenta confirmada.

## Uso

Registra por separado el dinero recibido de cada persona: nombre, concepto, capital, moneda, fecha y notas. Cada abono devuelto tiene importe, fecha, medio de pago y notas. La lista muestra capital recibido, total devuelto, saldo por devolver e historial de abonos. Los resúmenes USD y COP permanecen separados y usan aritmética exacta en centavos.

No crea operaciones bancarias, movimientos de caja, compromisos de rentabilidad, intereses ni relaciones automáticas con vehículos. Un saldo cero significa que se registró la devolución del capital, no una confirmación bancaria. Los nombres escritos no conceden acceso a esas personas.

El capital y sus datos descriptivos pueden corregirse con control de versión. La moneda queda fija. No se puede reducir el capital por debajo de lo ya devuelto ni mover su fecha después de un abono histórico. Los abonos no se reescriben: se anulan y se registra la corrección; el original permanece en el historial. Restaurar un abono vuelve a validar el saldo. No hay borrado definitivo.

## Seguridad y coherencia

- Tablas separadas `personal_investment_funds` y `personal_investment_repayments`; no cambia las tablas de vehículos ni el libro personal existente.
- La identidad verificada sale de `auth.getUser()`. Se exige correo confirmado y se rechazan sesiones anónimas. El formulario solo lleva una marca de cuenta para detectar cambios de sesión.
- RLS ENABLE/FORCE y SELECT/INSERT/UPDATE limitados al propietario; no hay bypass para administradores de la aplicación. UPDATE tiene USING y WITH CHECK. No hay permisos DELETE ni privilegios para anon/service_role.
- Autorizaciones por columna y triggers SECURITY INVOKER impiden cambiar identidades, moneda, versiones o importes históricos. La clave foránea compuesta obliga a que fondo y abono pertenezcan a la misma cuenta.
- Cada abono bloquea y actualiza la versión del capital antes de verificar fechas y saldo. Las operaciones simultáneas se serializan; las transacciones con una instantánea antigua deben abortar y reintentarse.
- `personal_investment_snapshot()` es STABLE, SECURITY INVOKER, sin argumentos, con search_path fijo y filtro de `auth.uid()`. Obtiene ambos conjuntos en una sola instantánea JSON sin paginación ni límite de filas de PostgREST.
- UUID estable, bloqueo de envíos repetidos y reconciliación tras un resultado incierto evitan duplicar altas. Los errores conservan el formulario. Las actualizaciones exigen versión y exactamente una fila afectada.
- Ruta dinámica con política privada/no-store del proxy y noindex. Sin datos financieros en localStorage, consola ni exportaciones públicas. Es aislamiento entre cuentas de la aplicación, no cifrado de extremo a extremo frente a operadores de infraestructura.

## Pruebas

- Modelos, acciones simuladas y render estático de React: saldos exactos, monedas, estados, historial, texto escapado, formularios, navegación, versiones, reintentos y rechazo de propietarios ajenos.
- `scripts/test-investment-funding-db.mjs`: 97 aserciones en PostgreSQL local PGlite, con usuarios A/B/admin sintéticos, anónimo/service_role, permisos, RLS, abonos parciales/completos, límites, versiones, corrección, atomicidad y más de 1100 filas por instantánea.
- `scripts/test-investment-funding-concurrency.mjs`: 16 escenarios con sesiones simultáneas en PostgreSQL 17.7 real, tanto READ COMMITTED como REPEATABLE READ. Comprueba espera de bloqueo y resultado de abonos contra abonos, cambios de capital/fecha, restauraciones y versiones antiguas.
- `tests/investment-funding-hosted-rollback.sql`: comprobación alojada dentro de BEGIN/ROLLBACK, con una identidad existente sin imprimirla, sin crear usuarios ni conservar registros sintéticos. Se debe verificar después que no quedó ninguna fila de prueba.

Para repetir las pruebas locales, instala `@electric-sql/pglite@0.3.14` en una carpeta de herramientas externa y apunta `PGLITE_MODULE` a su dist/index.js. La cabecera del script de concurrencia contiene las versiones exactas de PostgreSQL y pg y la instrucción de ejecución; levanta un servidor efímero solo en loopback y elimina sus datos al terminar. No añade dependencias a la aplicación.

La cobertura de base de datos no sustituye una sesión real de navegador. No se ha verificado manualmente el guardado autenticado ni el diseño en un dispositivo móvil real. Tampoco se han inyectado fallos de red en PostgREST real; los reintentos se prueban con acciones simuladas y restricciones reales de duplicados.

## Verificación del 6 de noviembre de 2026

`npm run verify` completó 252 pruebas, TypeScript, build y revisión estructural. Lint solo conserva la advertencia anterior en analytics. Las 97 aserciones locales y los 16 escenarios de concurrencia pasaron. La migración principal alojada tiene versión `20261106023811`; el índice de propietario y la normalización equivalente de las políticas tienen versión `20261106024102`. La comprobación alojada pasó y una consulta posterior confirmó cero fondos y abonos de prueba, con las 14 unidades y 18 gastos de vehículos sin cambios. Los advisors de rendimiento no muestran avisos para las dos tablas nuevas; los de las tablas previas permanecen. El advisor de seguridad no añadió avisos: permanecen la protección de contraseñas filtradas desactivada y las tablas antiguas con RLS sin políticas.

## Publicación y reversión

Aplicar primero la migración aditiva y después publicar la aplicación. Revisar advisors y comprobar la ruta sin sesión. Ante una reversión, volver al commit anterior de interfaz y conservar las tablas privadas y sus políticas; nunca borrar datos del usuario ni relajar RLS.
