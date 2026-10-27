export const metadata = { title: "Programa Elite | DealerPass", description: "Conoce el proceso de solicitud y entrevista individual de DealerPass Elite." };
import ArrowIcon from "@/components/ArrowIcon";
import AccountShell from "@/components/AccountShell";
import { configured, identity, database, checked } from "@/lib/academy/server";
import Link from "next/link";
export const dynamic = "force-dynamic";
const labels: Record<string, string> = {
  requested: "Solicitud recibida",
  meeting: "Reunión en preparación",
  approved: "Admisión aprobada",
  rejected: "Solicitud no aprobada",
};
export default async function Page({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const who = await identity();
  let application = null;
  if (who) {
    const result = checked(
      await database()
        .from("vip_applications")
        .select("status,meeting_at")
        .eq("user_id", who.user.id)
        .maybeSingle(),
    );
    application = result.data;
  }
  return (
    <AccountShell
      kicker="DEALERPASS / ELITE"
      title="Un grupo selecto. Una conversación primero."
    >
      <p>
        Elite comienza con una reunión individual. Queremos conocer tu
        experiencia, tus objetivos y si podemos acompañarte de la forma
        adecuada.
      </p>
      <div className="account-grid">
        <article className="account-card">
          <span className="account-tag">01 / Solicitud</span>
          <h2>Cuéntanos sobre ti.</h2>
          <p>Completa tu perfil y tus objetivos.</p>
        </article>
        <article className="account-card">
          <span className="account-tag">02 / Reunión 1 a 1</span>
          <h2>Conozcámonos.</h2>
          <p>
            El equipo coordinará contigo la reunión y evaluará tu solicitud.
          </p>
        </article>
        <article className="account-card">
          <span className="account-tag">03 / Admisión</span>
          <h2>Ingreso por aprobación.</h2>
          <p>
            Solo después de aprobarte habilitaremos el pago y, una vez
            confirmado, el acceso VIP.
          </p>
        </article>
      </div>
      {searchParams.message && (
        <p role="status" className="account-notice">
          {searchParams.message}
        </p>
      )}
      {application ? (
        <div className="account-notice">
          <p>{labels[application.status]}</p>
          {application.status === "approved" && (
            <Link href="/mi-cuenta">
              Continuar con mi admisión <ArrowIcon direction="right" />
            </Link>
          )}
        </div>
      ) : who ? (
        <form
          method="post"
          action="/api/vip"
          className="account-card account-form"
        >
          <label>
            Teléfono para coordinar la reunión
            <input
              name="phone"
              type="tel"
              minLength={7}
              maxLength={40}
              required
            />
          </label>
          <label>
            Tu experiencia en subastas
            <textarea
              name="experience"
              minLength={20}
              maxLength={2000}
              required
            />
          </label>
          <label>
            ¿Qué buscas lograr con DealerPass Elite?
            <textarea name="goals" minLength={20} maxLength={2000} required />
          </label>
          <label className="account-check">
            <input name="consent" type="checkbox" value="yes" required />
            Autorizo que DealerPass me contacte para evaluar mi solicitud.
          </label>
          <button className="btn-primary">Solicitar reunión 1 a 1</button>
        </form>
      ) : (
        <div className="account-links">
          <Link
            className="btn-primary"
            href="/ingresar?mode=registro&next=/vip"
          >
            Crear cuenta y solicitar reunión
          </Link>
          <Link href="/ingresar?next=/vip">Ya tengo cuenta</Link>
        </div>
      )}
      {!configured() && (
        <p>Las solicitudes estarán disponibles cuando abramos el registro.</p>
      )}
    </AccountShell>
  );
}
