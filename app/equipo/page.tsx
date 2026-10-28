import TeamNav from "@/components/TeamNav";
import { isTeamRole } from "@/lib/academy/team-policy";
import AccountShell from "@/components/AccountShell";
import { requireIdentity, database, checked } from "@/lib/academy/server";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const who = await requireIdentity("/equipo");
  if (!isTeamRole(who.profile.role))
    return (
      <AccountShell title="Área exclusiva del equipo.">
        <p>Tu cuenta no tiene acceso a la administración.</p>
        <Link href="/aula">Ir a mi formación</Link>
      </AccountShell>
    );
  const db = database();
  const { data: lessons } = checked(
    await db.from("lessons").select("*").order("position"),
  );
  const admin = who.profile.role === "admin";
  const applications = admin
    ? checked(
        await db
          .from("vip_applications")
          .select("*,profiles!vip_applications_user_id_fkey(email)")
          .order("updated_at", { ascending: false }),
      ).data
    : [];
  return (
    <AccountShell team kicker="DEALERPASS / CENTRO DE OPERACIONES" title={admin ? "Tu negocio, en perspectiva." : "El espacio de tu equipo."}>
      <p>
        {admin
          ? "Administra las clases, las solicitudes VIP y los permisos del equipo."
          : "Consulta la formación en preparación. Las decisiones de admisión y los permisos requieren un administrador."}
      </p>
      <section className="workspace-operations"><div><span className="dashboard-eyebrow">{admin ? "ADMINISTRACIÓN" : "FORMACIÓN INTERNA"}</span><h2>Menos vueltas.<br />Más claridad.</h2><p>Elige una tarea y continúa donde hace falta.</p><Link className="dashboard-cta" href={admin ? "/mi-cuenta/inversiones" : "/equipo/clases"}>{admin ? "Ver vehículos y cuentas" : "Ver biblioteca"} →</Link></div><div className="workspace-operations-summary"><span>{admin ? "SOLICITUDES POR ATENDER" : "CLASES PUBLICADAS"}</span><strong>{admin ? applications?.filter(a=>a.status === "requested" || a.status === "meeting").length || 0 : lessons?.filter(l=>l.published).length || 0}</strong><p>{admin ? "Solicitudes recibidas o en coordinación de reunión." : "Contenido disponible en la biblioteca."}</p>{admin && <a href="#admisiones">Revisar admisiones →</a>}</div></section>
      <TeamNav admin={admin} />
      <div className="dashboard-stats">{admin && <article><span>ESTUDIANTES</span><strong>Personas y progreso</strong><Link href="/equipo/estudiantes">Abrir directorio</Link></article>}<article><span>FORMACIÓN</span><strong>{lessons?.filter(l=>l.published).length||0} publicadas</strong><Link href="/equipo/clases">Gestionar biblioteca</Link></article><article><span>EN PREPARACIÓN</span><strong>{lessons?.filter(l=>!l.published).length||0} borradores</strong><Link href="/equipo/clases?estado=borrador">Revisar borradores</Link></article></div>
      {searchParams.message && (
        <p className="account-notice" role="status">
          {searchParams.message}
        </p>
      )}
      {admin && (
        <>
          <h2 id="admisiones">Solicitudes Elite</h2>
          {!applications?.length && <p>No hay solicitudes pendientes.</p>}
          {applications?.map((a) => (
            <details key={a.user_id} className="account-card workspace-application">
              <summary>{a.profiles?.email}<span>{({requested:"Recibida",meeting:"Reunión",approved:"Aprobada",rejected:"No aprobada"} as Record<string,string>)[a.status] || a.status}</span></summary>
              <p>
                {a.phone} · {a.status}
              </p>
              <p>
                <strong>Experiencia:</strong> {a.experience}
              </p>
              <p>
                <strong>Objetivos:</strong> {a.goals}
              </p>
              <form className="account-form" method="post" action="/api/team">
                <input type="hidden" name="action" value="vip" />
                <input type="hidden" name="user_id" value={a.user_id} />
                <label>
                  Decisión
                  <select name="status" defaultValue={a.status}>
                    <option value="requested">Solicitud recibida</option>
                    <option value="meeting">Coordinar reunión</option>
                    <option value="approved">
                      Aprobar admisión después de la reunión
                    </option>
                    <option value="rejected">
                      No aprobar / retirar admisión
                    </option>
                  </select>
                </label>
                <label>
                  Fecha y hora de reunión (UTC)
                  <input
                    name="meeting_at"
                    type="datetime-local"
                    defaultValue={a.meeting_at?.slice(0, 16)}
                  />
                </label>
                <label>
                  Notas de la evaluación
                  <textarea
                    name="review_note"
                    defaultValue={a.review_note || ""}
                    maxLength={2000}
                  />
                </label>
                <button className="btn-primary">Guardar evaluación</button>
              </form>
            </details>
          ))}
          <h2 id="permisos" className="mt-12">Permisos de colaboradores</h2>
          <form
            method="post"
            action="/api/team"
            className="account-card account-form"
          >
            <p>
              La persona debe crear y confirmar su cuenta primero. Solo el
              administrador puede asignarle acceso al equipo.
            </p>
            <input type="hidden" name="action" value="role" />
            <label>
              Correo de la cuenta
              <input name="email" type="email" required />
            </label>
            <label>
              Permiso
              <select name="role">
                <option value="collaborator">
                  Colaborador · consulta de formación interna
                </option>
                <option value="student">
                  Estudiante · sin acceso al equipo
                </option>
              </select>
            </label>
            <button className="btn-primary">Actualizar permiso</button>
          </form>

        </>
      )}
    </AccountShell>
  );
}
