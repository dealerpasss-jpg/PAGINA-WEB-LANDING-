import WorkspaceIcon from "@/components/WorkspaceIcon";
import ArrowIcon from "@/components/ArrowIcon";
import AccountShell from "@/components/AccountShell";
import { requireIdentity, database, checked } from "@/lib/academy/server";
import { accessFor } from "@/lib/academy/billing";
import { canOpenLesson } from "@/lib/academy/policy";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page() {
  const who = await requireIdentity("/aula");
  let plans: string[] = [];
  try {
    plans = (await accessFor(who.user.id)).plans;
  } catch {
    return (
      <AccountShell title="No pudimos verificar tu acceso.">
        <p>Inténtalo de nuevo en unos minutos.</p>
      </AccountShell>
    );
  }
  const db = database();
  const { data: lessons } = checked(
    await db
      .from("lessons")
      .select("id,title,module_title,position,allowed_plans")
      .eq("published", true)
      .order("position"),
  );
  const { data: progress } = checked(
    await db
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", who.user.id),
  );
  const available = (lessons || []).filter((l) =>
    canOpenLesson(plans, l.allowed_plans),
  );
  const completed = available.filter((l) =>
    progress?.some((p) => p.lesson_id === l.id),
  ).length;
  return (
    <AccountShell title="Aprende. Aplica. Avanza.">
      <p>Tu formación está organizada según los planes que tienes activos.</p>
      {available.length > 0 && <div className="account-card">
        <span className="account-tag">Tu progreso</span>
        <h2>
          {completed} de {available.length} clases completadas
        </h2>
        <progress
          style={{ width: "100%", accentColor: "#ff4d00" }}
          max={Math.max(available.length, 1)}
          value={completed}
        />
      </div>}
      {available.length === 0 && <section className="dashboard-panel dashboard-learning-empty"><WorkspaceIcon name="learn" /><h2>{plans.length ? "Estamos preparando tu formación." : "Tu recorrido empieza por aquí."}</h2><p>{plans.length ? "Todavía no hay clases publicadas para tu plan. Cuando estén disponibles, verás aquí tus módulos y tu avance." : "Consulta el temario y las opciones de formación antes de elegir un plan. Crear tu cuenta no activa una membresía."}</p><Link href="/academy#temario">Explorar el temario de referencia <ArrowIcon /></Link></section>}
      {!plans.length && (
        <p className="account-notice">
          No tienes un plan activo.{" "}
          <Link href="/mi-cuenta">
            Explorar planes <ArrowIcon direction="right" />
          </Link>
        </p>
      )}
      {!!lessons?.length && <div className="account-card">
        {(lessons || []).map((l) => {
          const allowed = canOpenLesson(plans, l.allowed_plans);
          return (
            <article key={l.id} className="account-row">
              <div>
                <span className="account-tag">{l.module_title}</span>
                <h3>{l.title}</h3>
                <small>
                  {progress?.some((p) => p.lesson_id === l.id)
                    ? "Completada"
                    : allowed
                      ? "Disponible en tu plan"
                      : "Requiere otro plan"}
                </small>
              </div>
              {allowed ? (
                <Link href={"/aula/" + l.id}>
                  Abrir clase <ArrowIcon direction="right" />
                </Link>
              ) : (
                <Link href="/planes">Ver planes</Link>
              )}
            </article>
          );
        })}
      </div>}
    </AccountShell>
  );
}
