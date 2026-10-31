import AccountShell from "@/components/AccountShell";
import TeamNav from "@/components/TeamNav";
import { requireTeam } from "@/lib/academy/team-server";
import { validRecordId } from "@/lib/academy/team-policy";
import { database } from "@/lib/academy/server";
import { experiences, goals } from "@/lib/academy/profile";
import { plans } from "@/data/plans";
import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}) {
 await requireTeam("/equipo/estudiantes",true);const {id}=await params;if(!validRecordId(id))notFound();
 const db=database();const profile=await db.from("profiles").select("id,email,created_at").eq("id",id).eq("role","student").maybeSingle();
 if(profile.error)throw new Error("Student lookup failed");if(!profile.data)notFound();
 const [account,progress,purchases]=await Promise.all([db.auth.admin.getUserById(id),db.from("lesson_progress").select("lesson_id,completed_at,lessons(title,module_title)").eq("user_id",id).order("completed_at",{ascending:false}),db.from("purchases").select("id,plan,status,created_at").eq("user_id",id).order("created_at",{ascending:false})]);
 const m=account.data.user?.user_metadata||{};const val=(k:string)=>typeof m[k]==="string"?m[k]:"Sin completar";
 const date=(d:string)=>new Intl.DateTimeFormat("es",{dateStyle:"medium",timeZone:"America/New_York"}).format(new Date(d));
 const option=(o:Record<string,string>,k:string)=>Object.hasOwn(o,val(k))?o[val(k)]:"Sin completar";
 const progressRows=(progress.data||[]).map(p=>({...p,lesson:(Array.isArray(p.lessons)?p.lessons[0]:p.lessons) as {title:string;module_title:string}|null}));
 const states:Record<string,string>={active:"Activo registrado",pending:"Pendiente",expired:"Expirado",inactive:"Inactivo"};
 return <AccountShell kicker="DEALERPASS / ESTUDIANTE" title={m.first_name ? `${val("first_name")} ${val("last_name")}` : "Ficha del estudiante"}><TeamNav admin /><p>{profile.data.email}</p>
 <div className="dashboard-columns"><section className="dashboard-panel"><h2>Perfil y contacto</h2>{account.error ? <p role="alert">No pudimos cargar los datos del perfil.</p> : <dl className="team-facts"><dt>País / región</dt><dd>{val("country")} / {val("region")}</dd><dt>Teléfono</dt><dd>{val("phone")||"No indicado"}</dd><dt>Experiencia</dt><dd>{option(experiences,"experience")}</dd><dt>Objetivo</dt><dd>{option(goals,"goal")}</dd><dt>Idioma preferido</dt><dd>{m.language==="es"?"Español":m.language==="en"?"Inglés":"Sin completar"}</dd><dt>Promociones por correo</dt><dd>{m.marketing_email===true?"Aceptadas":"No aceptadas"}</dd><dt>Promociones por WhatsApp</dt><dd>{m.marketing_whatsapp===true?"Aceptadas":"No aceptadas"}</dd></dl>}<p className="dashboard-footnote">Preferencias indicadas por el estudiante. Consulta su consentimiento vigente antes de enviar promociones.</p></section>
 <section className="dashboard-panel"><h2>Planes y compras</h2><p className="dashboard-footnote">Estado guardado en el sistema. El acceso del estudiante se verifica con el procesador de pagos; esta ficha no modifica permisos ni confirma un nuevo cobro.</p>{purchases.error ? <p>No pudimos cargar las compras.</p> : purchases.data?.length ? purchases.data.map(p=><article className="account-row" key={p.id}><div><h3>{plans.find(x=>x.id===p.plan)?.name||p.plan}</h3><p>{states[p.status]||"Por verificar"} · {date(p.created_at)}</p></div></article>) : <p>No tiene compras registradas.</p>}</section></div>
 <section className="dashboard-panel"><h2>Historial de aprendizaje</h2>{progress.error ? <p>No pudimos cargar el avance.</p> : <><p>{progress.data?.length||0} clases marcadas como completadas.</p>{progressRows.map(p=><article className="account-row" key={p.lesson_id}><div><span className="account-tag">{p.lesson?.module_title}</span><h3>{p.lesson?.title||"Clase no disponible"}</h3></div><span>{date(p.completed_at)}</span></article>)}{!progress.data?.length&&<p>El estudiante todavía no ha marcado clases como completadas.</p>}</>}</section></AccountShell>;
}
