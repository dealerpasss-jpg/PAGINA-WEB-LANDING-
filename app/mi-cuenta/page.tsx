import AccountShell from "@/components/AccountShell";
import {
  configured,
  requireIdentity,
  database,
  checked,
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
  const who = await requireIdentity();
  let active: string[] = [];
  let failed = false;
  try {
    active = (await accessFor(who.user.id)).plans;
  } catch {
    failed = true;
  }
  const { data: vip } = checked(
    await database()
      .from("vip_applications")
      .select("status")
      .eq("user_id", who.user.id)
      .maybeSingle(),
  );
  return (
    <AccountShell title="Tu siguiente paso, más claro.">
      <p>
        {who.user.email} ·{" "}
        {who.profile.role === "student" ? "Estudiante" : "Equipo DealerPass"}
      </p>
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
      <div className="account-links">
        <Link href="/aula">Ir a mi formación →</Link>
        {who.profile.role !== "student" && (
          <Link href="/equipo">Panel del equipo</Link>
        )}
        <form action="/api/account" method="post">
          <input type="hidden" name="action" value="logout" />
          <button>Cerrar sesión</button>
        </form>
      </div>
      <h2>Elige cómo quieres avanzar.</h2>
      <div className="account-grid">
        {plans.map((plan) => (
          <article key={plan.id} className="account-card">
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
            {plan.id === "elite" && vip?.status !== "approved" ? (
              <>
                <p>
                  Primero tendremos una reunión 1 a 1. Evaluaremos si este grupo
                  es adecuado para ti antes de ofrecerte el ingreso.
                </p>
                <Link href="/vip">Solicitar reunión →</Link>
              </>
            ) : active.includes(plan.id) ? (
              <Link href="/aula">Ver mi formación →</Link>
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
      <div className="account-links">
        <form action="/api/billing-portal" method="post">
          <button>Gestionar pagos y cancelar membresía</button>
        </form>
        <Link href="/mi-cuenta?password=1">Cambiar contraseña</Link>
      </div>
      {searchParams.password && (
        <form
          method="post"
          action="/api/account"
          className="account-card account-form"
        >
          <input type="hidden" name="action" value="password" />
          <label>
            Nueva contraseña
            <input
              name="password"
              type="password"
              minLength={12}
              autoComplete="new-password"
              required
            />
          </label>
          <button className="btn-primary">Guardar contraseña</button>
        </form>
      )}
    </AccountShell>
  );
}
