import { greetingName } from "@/lib/academy/profile";
import { redirect } from "next/navigation";
import StudentDashboard from "@/components/StudentDashboard";
import ArrowIcon from "@/components/ArrowIcon";
import AccountShell from "@/components/AccountShell";
import {
  configured,
  requireIdentity,
  database,
} from "@/lib/academy/server";
import { accessFor } from "@/lib/academy/billing";
import { plans } from "@/data/plans";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{
    plan?: string;
    message?: string;
    password?: string;
    pago?: string;
  }>;
}) {
  const searchParams = await searchParamsPromise;
  if (searchParams.password) redirect("/auth/nueva-contrasena");
  if (!configured())
    return (
      <AccountShell title="Tu espacio está en preparación.">
        <p>
          Pronto podrás crear tu cuenta y elegir tu formación. Todavía no se
          reciben pagos.
        </p>
        <Link className="btn-primary" href="/planes">
          Explorar planes
        </Link>
      </AccountShell>
    );
  const selected = plans.find((p) => p.id === searchParams.plan);
  const who = await requireIdentity(selected ? `/mi-cuenta?plan=${selected.id}` : "/mi-cuenta");
  let active: string[] = [];
  let failed = false;
  let paymentStates: {plan:string;status:string}[] = [];
  try {
    const access = await accessFor(who.user.id);
    active = access.plans;
    paymentStates = access.states;
  } catch {
    failed = true;
  }
  const db = database();
  const [vipResult, lessonsResult, progressResult] = await Promise.all([
    db.from("vip_applications").select("status").eq("user_id", who.user.id).maybeSingle(),
    db.from("lessons").select("id,title,module_title,allowed_plans").eq("published",true).order("position"),
    db.from("lesson_progress").select("lesson_id").eq("user_id",who.user.id),
  ]);
  const vip = vipResult.error ? null : vipResult.data;
  const learningFailed = !!(lessonsResult.error || progressResult.error);
  // This force-dynamic server page takes one request-time snapshot for session filtering.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const name = greetingName(who.user.user_metadata);
  const profileComplete = ["first_name","last_name","country","region","experience","goal","language"].every(k=>!!who.user.user_metadata?.[k]);
  return (
    <AccountShell title={name ? `Hola, ${name}.` : "Bienvenido a tu espacio."}>
      <p className="account-welcome"><span className="account-role">{who.profile.role === "student" ? "Estudiante" : "Equipo DealerPass"}</span> Tu formación y herramientas, en un solo lugar.</p>
      {searchParams.message && (
        <p className="account-notice" role="status">
          {searchParams.message}
        </p>
      )}
      {searchParams.pago === "recibido" && (
        <p className="account-notice">
          Comprobamos el pago directamente con Stripe. Solo los planes
          confirmados aparecen activos.
        </p>
      )}
      {failed && (
        <p role="alert" className="account-notice">
          No pudimos verificar los pagos en este momento. Inténtalo más tarde;
          no se concede acceso sin comprobarlos.
        </p>
      )}
      {!selected && <>
      <div className="account-actions" aria-label="Acciones de tu cuenta">
        <Link className="account-action account-action-primary" href="/aula">Ir a mi formación <ArrowIcon direction="right" /></Link>
        {who.profile.role !== "student" && <Link className="account-action" href="/equipo">Panel del equipo <ArrowIcon /></Link>}
        <Link className="account-action" href="/mi-cuenta/perfil">Editar mi perfil <ArrowIcon /></Link>
        <form action="/api/account" method="post">
          <input type="hidden" name="action" value="logout" />
          <button className="account-action account-action-quiet">Cerrar sesión</button>
        </form>
      </div>
      <StudentDashboard now={now} active={active} lessons={lessonsResult.data || []} completedIds={(progressResult.data || []).map(p=>p.lesson_id)} unavailable={failed || learningFailed} profileComplete={profileComplete} paymentStates={paymentStates} />
      </>}
      {selected && <p className="account-notice">Seleccionaste {selected.name}. Revisa sus detalles abajo antes de continuar.</p>}
      <section id="planes" className={`dashboard-plan-section ${selected ? "selected-purchase" : ""}`}><span className="dashboard-eyebrow">TU SIGUIENTE PASO</span><h2>{selected ? "Revisa tu elección." : active.length ? "Explora otras formas de avanzar." : "Elige cómo quieres avanzar."}</h2>
      <div className="account-grid">
        {(selected ? [selected] : plans).map((plan) => (
          <article key={plan.id} className={`account-card ${selected?.id === plan.id ? "account-plan-selected" : ""}`}>
            <span className="account-tag">
              {active.includes(plan.id)
                ? "Plan activo"
                : plan.id === "elite"
                  ? "Admisión por entrevista"
                  : "Formación y acceso"}
            </span>
            <h2>{plan.name}</h2>
            <p>
              {plan.price} {plan.priceSuffix}
            </p>
            <p>{plan.tagline}</p>
            {selected && <><ul>{plan.features.map(feature => <li key={feature}>{feature.replace("[INSERTAR TARIFA]", "(por confirmar)")}</li>)}</ul><p>Costos de subasta, impuestos, transporte y terceros no incluidos salvo indicación expresa.</p><p><Link href="/legal/membresias">Membresías y cancelación</Link> · <Link href="/legal/reembolsos">Reembolsos</Link> · <Link href="/legal/terminos">Términos</Link></p></>}
            {plan.id === "elite" && vip?.status !== "approved" ? (
              <>
                <p>
                  Primero tendremos una reunión 1 a 1. Evaluaremos si este grupo
                  es adecuado para ti antes de ofrecerte el ingreso.
                </p>
                <Link href="/vip">
                  Solicitar reunión <ArrowIcon direction="right" />
                </Link>
              </>
            ) : active.includes(plan.id) ? (
              <Link href="/aula">
                Ver mi formación <ArrowIcon direction="right" />
              </Link>
            ) : (
              <form action="/api/checkout" method="post">
                <input type="hidden" name="plan" value={plan.id} />
                <button
                  disabled={failed || process.env.PAYMENTS_ENABLED !== "true"}
                  className="btn-primary"
                >
                  {plan.id === "elite"
                    ? "Admisión aprobada · Continuar al pago"
                    : "Elegir y pagar"}
                </button>
              </form>
            )}
          </article>
        ))}
      </div>
      {process.env.PAYMENTS_ENABLED !== "true" && (
        <p className="account-notice">
          Los precios están pendientes de confirmación. Los pagos aún no están
          habilitados.
        </p>
      )}
      {selected && <p><Link className="text-link" href="/planes#comparar">Cambiar de plan</Link> · <Link className="text-link" href="/mi-cuenta">Volver a mi espacio</Link></p>}
      </section>
    </AccountShell>
  );
}
