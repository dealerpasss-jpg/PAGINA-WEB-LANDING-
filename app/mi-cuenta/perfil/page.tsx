import AccountShell from "@/components/AccountShell";
import ProfileFields from "@/components/ProfileFields";
import { requireIdentity } from "@/lib/academy/server";
import { safeNext } from "@/lib/academy/policy";
import { experiences, goals } from "@/lib/academy/profile";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page({searchParams}: {searchParams: Promise<{next?: string; welcome?: string; message?: string}>}) {
  const query = await searchParams;
  const next = safeNext(query.next);
  const who = await requireIdentity("/mi-cuenta/perfil?next=" + encodeURIComponent(next));
  const values = who.user.user_metadata || {};
  return <AccountShell compact kicker="DEALERPASS / TU PERFIL" title={query.welcome ? "Cuéntanos sobre ti." : "Tu perfil y preferencias."}>
    <p>Queremos conocer tu experiencia y lo que buscas. Estos datos no cambian tu plan ni tus permisos.</p>
    {query.message && <p role="status" className="account-notice">{query.message}</p>}
    <form action="/api/profile" method="post" className="account-card account-form">
      <input type="hidden" name="next" value={next} />
      <ProfileFields values={values} />
      <label>¿Qué experiencia tienes comprando en subastas?<select name="experience" defaultValue={values.experience || ""} required><option value="" disabled>Selecciona una opción</option>{Object.entries(experiences).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
      <label>¿Cuál es tu objetivo principal?<select name="goal" defaultValue={values.goal || ""} required><option value="" disabled>Selecciona una opción</option>{Object.entries(goals).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
      <label>¿En qué idioma prefieres la formación?<select name="language" defaultValue={values.language || ""} required><option value="" disabled>Selecciona una opción</option><option value="es">Español</option><option value="en">Inglés</option></select><small>Registramos tu preferencia. La disponibilidad de clases depende del programa.</small></label>
      <button className="btn-primary">Guardar y continuar</button>
    </form>
    <div className="account-links"><Link href={next}>{query.welcome ? "Completar más tarde" : "Volver a mi espacio"}</Link></div>
  </AccountShell>;
}
