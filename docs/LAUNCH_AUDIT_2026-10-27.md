# DealerPass: revisión de lanzamiento · 27 octubre 2026

## Dictamen
El sitio está publicado, pero aún no está listo para abrir ventas al público. Es una plataforma en preparación con autenticación, aulas, administración e inversiones implementadas. No es un producto equivalente al alcance completo de Whop o GoHighLevel. La prioridad es cerrar la experiencia mínima de registro, compra, entrega, soporte y administración antes de aumentar funcionalidades.

## Evidencia revisada
- Navegador: portada, planes y comparación, academia, método/calculadora, vehículos, Elite, acceso y recuperación; redirección de dashboard sin sesión.
- Repositorio y configuración de despliegue: rutas, acceso por plan, formularios, contenido, pagos, perfiles e inversiones.
- Base de datos, solo lectura: 0 lecciones, 0 lecciones publicadas, 0 registros de progreso y 0 vehículos privados en el momento de revisión. Existe 1 perfil. La persistencia implementada no equivale a una prueba de recorrido real de un alumno.
- Recursos y sesiones: listas vacías en el catálogo.
- Producción: no aparecen claves de Stripe, precios Stripe, secreto de webhook, webhook de contacto ni número de WhatsApp en las variables inspeccionadas. Se mantienen los pagos en preparación.
- Condiciones legales: borradores con campos pendientes.
- Seguridad: aviso de protección de contraseñas filtradas desactivada. RLS sin políticas en tablas de academia es denegación de acceso directo; esas rutas usan validación en servidor, no debe abrirse el acceso para silenciar el aviso.

## Cambios de esta revisión
- Navegación del espacio privado con barra lateral en escritorio y enlaces desplazables en móvil; encabezado adecuado al área privada y pie compacto.
- Paneles y tarjetas con tamaños y superficies consistentes; estados de carga, error y página no encontrada.
- Comparación de planes inmediatamente tras la introducción, aviso de apertura en preparación y video preservado en bloque compacto.
- Contacto no confirma recepción cuando no hay destino configurado; formulario disponible únicamente con integración configurada. Validación, consentimiento, control de origen, límite y tiempo de espera. Sin impresión de datos personales en logs.
- Recuperación con enlace de regreso a iniciar sesión; aula conserva la ruta tras el acceso y omite un panel vacío.
- Calculadora pública conserva un resultado negativo y advierte que no hay presupuesto de puja.
- Sitemap público, robots y noindex en áreas privadas. Esto no sustituye autenticación.
- Pruebas del formulario incorporadas al comando de pruebas general.

## P0: antes de vender
- [ ] Jota + Sebastián: fijar oferta final: productos, precios, plazo de acceso, sesiones, límites de reportes, soporte y cargos por vehículo. El catálogo actual usa Starter/Academy/Pro/Elite; reconciliar con la oferta comercial acordada.
- [ ] Equipo: cargar las clases, videos y recursos prometidos para el primer plan vendible; verificar reproducción y descargas desde una cuenta con acceso. No vender un curso completo vacío.
- [ ] Jota + desarrollo: configurar Stripe de producción, precios por plan, webhook firmado y portal. Probar pago, evento duplicado, pago rechazado, cancelación, renovación, reembolso y revocación de acceso antes de habilitar cobros.
- [ ] Jota + desarrollo: correo empresarial, dominio remitente y proveedor de correo; activar plantillas reales de bienvenida, confirmación, recuperación y compra. Verificar recepción y enlace en móvil. La apariencia del mensaje actual no se volvió a probar por envío en esta auditoría.
- [ ] Jota: conectar el destino de contacto/CRM y número oficial; asignar responsable y plazo de atención. Comprobar un mensaje real de prueba recibido y respondido.
- [ ] Jota + asesoría: completar y aprobar términos, privacidad, cancelación y reembolsos. Definir entidad responsable, contacto, terceros, renovación y ventanas de reembolso; eliminar campos pendientes tras aprobación.
- [ ] Jota: respaldar la cifra de 3.000 personas y cada testimonio/foto con evidencia y autorización, o retirar/sustituir lo no verificable. No se verificó la procedencia de esos testimonios en esta revisión.
- [ ] Equipo + desarrollo: probar con cuentas separadas estudiante, colaborador, administrador e inversionista. Ninguna debe acceder a datos o funciones ajenos a su permiso.
- [ ] Jota + desarrollo: ejecutar una compra piloto y el ciclo completo de alta, confirmación, perfil, pago, clase, progreso, cierre de sesión, regreso y recuperación.

## P1: operación y experiencia
- [ ] Grabar y publicar el VSL aprobado con subtítulos y controles. Se mantiene el espacio reservado; no existe aún el video final.
- [ ] Publicar calendario de sesiones con zona horaria, responsable y acceso por plan; cargar plantillas y recursos definitivos.
- [ ] Definir dónde opera la comunidad y cómo se concede y retira el acceso; comprobar Starter, Academy, Pro y Elite.
- [ ] Cerrar flujo Elite: solicitud, coordinación, fecha visible, decisión y acceso después de aprobación y pago.
- [ ] Cargar un primer vehículo real: compra, cargos, fotos privadas, reparaciones, inversión, precio de venta y cierre. Conciliar contra comprobantes.
- [ ] Asignar dos inversionistas a vehículos distintos y verificar aislamiento de fotos, gastos y aportes; revocar uno y comprobar que pierde acceso. Validar correos pendientes antes de dar acceso.
- [ ] Definir reglas de reparto de utilidades, pérdidas y devolución de capital; el módulo actual registra aportes/devoluciones y margen, no liquida automáticamente utilidades.
- [ ] Si se ofrecerán autos públicamente: crear publicaciones revisadas y mecanismo de actualización; el catálogo público está vacío y no se alimenta automáticamente de las cuentas privadas.
- [ ] Definir soporte, responsable de alumnos y responsable de inversiones; procedimiento de problemas de pago o recuperación.

## P2: calidad y crecimiento
- [ ] Revisar en iPhone/Safari y Android/Chrome: menú, márgenes, teclado, botones, formularios, video, tablas, subida de fotos y ausencia de desbordamiento.
- [ ] Probar teclado, foco visible, etiquetas, errores, contraste y modo de movimiento reducido; comprobar rendimiento móvil real.
- [ ] Revisar copias de seguridad, recuperación, monitoreo de errores y protección de cuentas administradoras; evaluar protección de contraseñas filtradas según disponibilidad.
- [ ] Conectar medición del recorrido: planes, registro, checkout, compra y activación; verificar eventos sin datos personales innecesarios ni duplicados.
- [ ] Comprobar títulos, vistas al compartir, sitemap e indexación de páginas públicas; mantener fuera de índices las páginas privadas y borradores.
- [ ] Después de validar el recorrido: mejorar búsqueda de contenido, notificaciones, reportes y automatizaciones según uso real.

## Límites de la revisión
No se inició sesión en el navegador, no se crearon cuentas ni se enviaron mensajes, no se procesaron pagos ni se modificaron permisos o datos de clientes. No hay prueba visual de móvil físico ni recorrido privado autenticado en esta sesión. La compilación, pruebas unitarias y revisión de código no sustituyen esas pruebas de aceptación.
