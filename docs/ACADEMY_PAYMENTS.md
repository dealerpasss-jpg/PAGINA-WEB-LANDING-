# DealerPass: cuentas, pagos, formación y admisión Elite

## Estado de esta entrega

Implementación preparada en una rama de revisión. No se ha habilitado producción ni se han cobrado pagos. La cuenta Stripe conectada es un entorno de prueba. Supabase no tenía proyectos al revisar la conexión.

Esta rama añade la academia al repositorio Next.js conectado a Vercel. El workspace de inventario/finanzas y el rediseño más reciente alojados en Sites siguen siendo otro proyecto; esta entrega NO los migra ni comparte todavía sus datos.

## Flujos implementados

- `/ingresar`: registro con correo/contraseña, confirmación de correo, inicio de sesión y recuperación. La contraseña mínima es de 12 caracteres. Todos los registros reciben rol estudiante.
- `/mi-cuenta`: estado comprobado de planes, inicio de Checkout, gestión de facturación y contraseña.
- `/aula`: catálogo publicado, bloqueo por plan y progreso por usuario. Los cuerpos y archivos de clases se sirven solo tras autorización.
- `/vip`: solicitud Elite sin pago público. Administrador registra reunión realizada, evaluación y aprobación; entonces aparece el pago en la cuenta del aspirante. La formación VIP exige aprobación vigente Y pago vigente.
- `/equipo`: administradores gestionan clases, planes permitidos, solicitudes Elite y roles. Colaboradores tienen consulta de formación interna; no pueden aprobarse, cambiar roles o conceder accesos.
- Las clases se crean como contenido real. No se han inventado cursos, videos ni las 83 clases previstas en documentos anteriores.

## Precios provisionales (no activar sin confirmar)

| Plan | USD | Cobro |
| --- | ---: | --- |
| Starter | 199 | mensual |
| Academy | 697 | único |
| Pro | 499 | mensual |
| Elite | 2,999 | anual, solo después de admisión |

Son los importes heredados del proyecto. El servidor comprueba que los Price IDs coincidan con importe, moneda y recurrencia. Para modificarlos, actualizar `data/plans.ts`, `lib/academy/billing.ts` y los Price IDs. No se admiten importes ni roles enviados por el navegador. La duración del acceso de Academy no tiene vencimiento programado en esta versión; hay que confirmar la política comercial antes de vender. La comunidad temporal no está implementada.

No hay acceso implícito por jerarquía de precio: cada clase declara exactamente sus planes permitidos. Cuando Pro y Elite incluyan todo Academy, marcar los tres planes en cada clase correspondiente. Starter solo recibe las clases que se le asignen expresamente.

## Activación en entorno de prueba

1. Elegir la organización de Supabase y crear un proyecto dedicado. Ejecutar `supabase/migrations/20261022_academy.sql` después de inspeccionar el esquema existente. Las tablas tienen RLS y no permiten acceso directo a usuarios anónimos o autenticados. Solo el servidor usa la clave de servicio.
2. Configurar Supabase Auth: email/password, confirmación de correo obligatoria, contraseña mínima 12, rate limits y SMTP del dominio. Configurar Site URL y redirect permitido `<APP_URL>/auth/callback` (incluidas variantes query). El flujo PKCE debe completarse en el mismo navegador donde comenzó el registro o recuperación. Probar entregabilidad real del correo.
3. Configurar las variables de `.env.example` en Vercel Preview. APP_URL debe ser el origen exacto del preview, sin rutas; en producción será el dominio elegido. Las claves de servicio y Stripe nunca llevan prefijo NEXT_PUBLIC.
4. Registrar e iniciar sesión con la cuenta del propietario. Verificar el UUID en Supabase Auth. Asignar `profiles.role='admin'` a ESE UUID desde el panel SQL, después de comprobar su correo confirmado. No existe autoproclamación de administrador desde la web.
5. Crear productos y precios en Stripe TEST con los importes confirmados. Guardar sus IDs. No crear enlaces públicos de pago para Elite. Configurar Customer Portal para cancelación al final de período y método de pago, SIN cambios de precio/plan desde el portal (especialmente Elite).
6. Registrar webhook `/api/stripe/webhook` con la versión de API de Stripe SDK 23 (`2026-09-30.endive`) y guardar el signing secret. Eventos: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, customer.subscription.updated/deleted, invoice.paid/payment_failed, charge.refunded, charge.dispute.created/closed. El webhook valida firma sobre el cuerpo original y registra idempotentemente. Los eventos Checkout vinculan y sincronizan la compra. Los otros eventos se registran; la autorización vuelve a consultar Stripe en cada visita, por lo que nunca concede acceso a partir de un evento antiguo ni del parámetro de éxito.
7. Subir archivos reales al bucket PRIVADO `academy-private`. Crear clases y asignar planes en `/equipo`. Nunca poner material del curso en `public/`. Los enlaces firmados vencen a los cinco minutos; no son DRM y el usuario puede guardar material autorizado.
8. Mantener `PAYMENTS_ENABLED=false` hasta confirmar precios, textos legales, contenido y configuración. Después habilitar solo en Preview con claves TEST para ejecutar la matriz de pruebas.
9. Probar íntegramente los casos de abajo. Después configurar las credenciales LIVE en producción, volver a validar productos/precios/webhook/dominio y aprobar el despliegue. No reutilizar claves, IDs ni firmas del entorno TEST.

## Matriz de pruebas previa al lanzamiento

- Registro nuevo, confirmación, correo ya registrado, credenciales inválidas, cierre y recuperación de sesión.
- Pago correcto de Academy, Starter y Pro; tarjeta rechazada; Checkout cancelado/expirado; doble clic; webhooks duplicados y retrasados; acceso inmediato después del retorno.
- Una URL de éxito o session ID ajeno nunca concede acceso. Sin sesión, no se puede pagar ni leer cursos privados. Un estudiante no puede escribir roles, publicaciones, admisiones ni compras mediante APIs o directamente en Supabase.
- Acceso a clase incluida y bloqueo de otra, progreso aislado entre dos alumnos, archivos fuera de `public/` y enlaces firmados vencidos.
- Renovación pagada, renovación fallida, cancelación inmediata y al final del período, reembolso total, disputa. La política actual deniega acceso si el estado no es active o el último recibo no tiene pago válido; no hay período de gracia. Reembolso parcial conserva el acceso; total lo revoca. Confirmar estas políticas con el negocio.
- Elite: solicitud sin botón de pago; POST de checkout rechazado sin aprobación; aprobación sin reunión pasada rechazada; pago después de aprobación; acceso solo tras cobro; retiro de aprobación bloquea el contenido. Retirar admisión NO cancela ni reembolsa automáticamente una suscripción existente: el equipo debe resolver la facturación en Stripe.
- Colaborador no puede modificar roles, aprobar Elite o publicar clases. Administrador sí; operaciones se registran en academy_audit. Probar revocación de rol en la siguiente petición.

## Decisiones técnicas y límites

La fuente de verdad para el acceso es Stripe consultado desde el servidor (sesión asociada al UUID y compra creada por el servidor). Las suscripciones requieren estado active, período vigente, precio esperado y última factura pagada con cargo no reembolsado totalmente ni disputado. La compra única requiere PaymentIntent exitoso y cargo válido. Ante errores de Stripe se deniega temporalmente el acceso con mensaje de reintento. Esto prioriza exactitud a costa de llamadas adicionales a Stripe; antes de crecer conviene una cola de reconciliación y caché con vencimiento corto.

El portal se abre para el customer asociado a la compra, nunca a un customer ID del cliente. Cambiar de membresía requiere asistencia para no duplicar suscripciones; no hay prorrateos automáticos. La reserva de Checkout usa un índice único para impedir dos pagos pendientes simultáneos e idempotency key por compra.

Los precios heredados, el dominio, SMTP, política de reembolsos/cancelación, duración de Academy y contenido real requieren confirmación comercial. La UI de carga directa de archivos, calendario de reservas, notificaciones al equipo, comunidad y migración del workspace completo no forman parte de esta rama.

Next.js se actualizó desde 14.2.35 a 16.4.2 porque la auditoría detectó vulnerabilidades en la dependencia original. Node >=22.13 es requerido por los scripts de pruebas y SDKs. Se adaptaron cookies, params y searchParams asíncronos y proxy de sesiones. Se conservan logo y colores, y se quita el montaje del video de preload.

## Comandos

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
```

## Verificación local realizada

- Build de producción con Next.js 16.4.2: correcto; validación TypeScript correcta.
- Cinco pruebas automatizadas de política: VIP, asignación de planes, renovación/expiración/reembolso, redirecciones y lista de planes: correctas.
- Auditoría de dependencias de producción: 0 vulnerabilidades reportadas.
- ESLint: 0 errores; 2 advertencias preexistentes en el endpoint de leads.
- Smoke HTTP sin credenciales: ingresar/mi-cuenta/vip responden 200; aula/equipo redirigen a ingresar; checkout sin sesión redirige; API de equipo deniega con 403; webhook sin configuración responde 503.
- No se pudo abrir el preview local en el navegador remoto (ERR_BLOCKED_BY_CLIENT). No se declara validación visual ni móvil.
- Pendiente: proyecto real Supabase, configuración de Auth, pagos sandbox de punta a punta, políticas RLS ejecutadas en base real, emails, sesiones autenticadas y despliegue Vercel Preview.
