import AccountShell from "@/components/AccountShell";
import TeamNav from "@/components/TeamNav";
import LessonForm from "@/components/LessonForm";
import { requireTeam } from "@/lib/academy/team-server";
import { database } from "@/lib/academy/server";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;estado?:string;message?:string}>}) {
 const who=await requireTeam("/equipo/clases");const admin=who.profile.role==="admin";const q=await searchParams;
 const result=await database().from("lessons").select("*").order("position").order("id");
 const search=(q.q||"").trim().slice(0,160).toLocaleLowerCase();const lessons=(result.data||[]).filter(l=>(!search||(l.title+" "+l.module_title).toLocaleLowerCase().includes(search))&&(q.estado==="borrador"?!l.published:q.estado==="publicada"?l.published:true));
 return <AccountShell kicker="DEALERPASS / FORMACIÓN" title="Una escuela con estructura."><TeamNav admin={admin}/><p>Organiza las clases por módulo y orden. Solo las clases publicadas se muestran a los estudiantes de los planes seleccionados.</p>{q.message&&<p role="status" className="account-notice">{q.message}</p>}
 {admin&&<details className="dashboard-panel team-editor"><summary>Crear nueva clase</summary><LessonForm/></details>}
 <form className="team-search" method="get"><label htmlFor="lesson-search">Buscar clase o módulo</label><div><input id="lesson-search" name="q" defaultValue={q.q||""} maxLength={160}/><select aria-label="Estado de publicación" name="estado" defaultValue={q.estado||"todas"}><option value="todas">Todas</option><option value="borrador">Borradores</option><option value="publicada">Publicadas</option></select><button className="btn-primary">Filtrar</button></div></form>
 {result.error?<p role="alert">No pudimos cargar las clases. Inténtalo nuevamente.</p>:<><p>{lessons.length} clases encontradas.</p>{!lessons.length&&<div className="dashboard-panel"><h2>Tu biblioteca empieza aquí.</h2><p>Crea una clase en borrador, añade contenido y revisa la vista previa antes de publicarla.</p></div>}{lessons.map(l=><article className="dashboard-panel" key={l.id}><span className="account-tag">{l.published?"Publicada":"Borrador"} · Orden {l.position} · {l.allowed_plans.join(", ")||"Sin planes asignados"}</span><h2>{l.title}</h2><p>{l.module_title}</p><Link href={"/equipo/clases/"+l.id}>Vista previa de la clase</Link>{admin&&<details className="team-editor"><summary>Editar contenido y acceso</summary><LessonForm lesson={l}/></details>}</article>)}</>}
 </AccountShell>;
}
