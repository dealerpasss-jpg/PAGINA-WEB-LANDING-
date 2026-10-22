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
  const who = await requireIdentity();
  if (who.profile.role === "student")
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
    <AccountShell kicker="DEALERPASS / EQUIPO" title="Formación y admisiones.">
      <p>
        {admin
          ? "Administra las clases, las solicitudes VIP y los permisos del equipo."
          : "Consulta la formación en preparación. Las decisiones de admisión y los permisos requieren un administrador."}
      </p>
      {searchParams.message && (
        <p className="account-notice" role="status">
          {searchParams.message}
        </p>
      )}
      {admin && (
        <>
          <h2>Solicitudes Elite</h2>
          {!applications?.length && <p>No hay solicitudes pendientes.</p>}
          {applications?.map((a) => (
            <article key={a.user_id} className="account-card">
              <h2>{a.profiles?.email}</h2>
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
            </article>
          ))}
          <h2 className="mt-12">Permisos de colaboradores</h2>
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
          <h2 className="mt-12">Publicar formación</h2>
          <LessonForm />
        </>
      )}
      <h2 className="mt-12">Biblioteca de clases</h2>
      {!lessons?.length && (
        <p>No hay clases cargadas. No se han creado contenidos de ejemplo.</p>
      )}
      {lessons?.map((l) => (
        <article className="account-card" key={l.id}>
          <span className="account-tag">
            {l.published ? "Publicada" : "Borrador"} ·{" "}
            {l.allowed_plans.join(", ")}
          </span>
          <h2>
            {l.module_title} / {l.title}
          </h2>
          {admin ? (
            <LessonForm lesson={l} />
          ) : (
            <p className="account-prose">{l.body}</p>
          )}
        </article>
      ))}
    </AccountShell>
  );
}
function LessonForm({
  lesson,
}: {
  lesson?: {
    id: string;
    title: string;
    module_title: string;
    position: number;
    body: string;
    asset_path: string;
    allowed_plans: string[];
    published: boolean;
  };
}) {
  return (
    <form method="post" action="/api/team" className="account-form">
      <input type="hidden" name="action" value="lesson" />
      <input type="hidden" name="id" value={lesson?.id || ""} />
      <label>
        Módulo
        <input
          name="module_title"
          maxLength={160}
          required
          defaultValue={lesson?.module_title}
        />
      </label>
      <label>
        Título de la clase
        <input
          name="title"
          maxLength={160}
          required
          defaultValue={lesson?.title}
        />
      </label>
      <label>
        Orden
        <input
          name="position"
          type="number"
          min={0}
          max={10000}
          defaultValue={lesson?.position || 0}
        />
      </label>
      <label>
        Contenido
        <textarea name="body" maxLength={50000} defaultValue={lesson?.body} />
      </label>
      <label>
        Ruta del video o material privado
        <input
          name="asset_path"
          placeholder="modulo-1/clase-1.mp4"
          maxLength={500}
          defaultValue={lesson?.asset_path || ""}
        />
        <small>
          Sube primero el archivo al depósito privado academy-private en
          Supabase.
        </small>
      </label>
      <fieldset>
        <legend>Planes con acceso</legend>
        {["starter", "academy", "pro", "elite"].map((p) => (
          <label className="account-check" key={p}>
            <input
              type="checkbox"
              name="allowed_plans"
              value={p}
              defaultChecked={lesson?.allowed_plans.includes(p)}
            />
            {p}
          </label>
        ))}
      </fieldset>
      <label className="account-check">
        <input
          type="checkbox"
          name="published"
          value="yes"
          defaultChecked={lesson?.published}
        />
        Publicar clase
      </label>
      <button className="btn-primary">
        {lesson ? "Guardar cambios" : "Crear clase"}
      </button>
    </form>
  );
}
