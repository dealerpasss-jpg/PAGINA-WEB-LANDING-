import AccountShell from "@/components/AccountShell";
import TeamNav from "@/components/TeamNav";
import { requireTeam } from "@/lib/academy/team-server";
import { database } from "@/lib/academy/server";
import { directoryPage } from "@/lib/academy/team-policy";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}) {
 await requireTeam("/equipo/estudiantes",true);
 const query=await searchParams;const page=directoryPage(query.page), q=(query.q||"").trim().slice(0,254);
 const db=database();
 let request=db.from("profiles").select("id,email,created_at",{count:"exact"}).eq("role","student").order("created_at",{ascending:false}).order("id");
 if(q) request=request.ilike("email","%"+q.replace(/[\\%_]/g,"\\$&")+"%");
 const result=await request.range((page-1)*20,page*20-1);
 const rows=result.data||[];
 const ids=rows.map(r=>r.id);
 const progress=ids.length ? await db.from("lesson_progress").select("user_id").in("user_id",ids) : {data:[],error:null};
 const counts=new Map<string,number>();for(const p of progress.data||[])counts.set(p.user_id,(counts.get(p.user_id)||0)+1);
 const pageLink=(n:number)=>"/equipo/estudiantes?page="+n+"&q="+encodeURIComponent(q);
 return <AccountShell kicker="DEALERPASS / ADMINISTRACIÓN" title="Cada estudiante, un camino."><TeamNav admin /><p>Consulta las cuentas de estudiantes que ya han ingresado a DealerPass. Abre una ficha para ver los datos personales y el avance.</p>
 <form method="get" className="team-search"><label htmlFor="student-search">Buscar por correo</label><div><input id="student-search" name="q" type="search" defaultValue={q} maxLength={254} placeholder="Correo del estudiante"/><button className="btn-primary">Buscar</button><Link href="/equipo/estudiantes">Limpiar</Link></div></form>
 {result.error ? <p role="alert" className="account-notice">No pudimos cargar los estudiantes. Inténtalo nuevamente.</p> : <section className="dashboard-panel"><h2>{result.count||0} estudiantes {q ? "encontrados" : "registrados"}</h2>{!rows.length && <p>No hay estudiantes para mostrar en esta página.</p>}<div className="team-table-wrap"><table className="team-table"><thead><tr><th>Estudiante</th><th>Registro</th><th>Clases marcadas</th><th>Ficha</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.email}</td><td>{new Intl.DateTimeFormat("es",{dateStyle:"medium",timeZone:"America/New_York"}).format(new Date(r.created_at))}</td><td>{progress.error ? "No disponible" : counts.get(r.id)||0}</td><td><Link href={"/equipo/estudiantes/"+r.id}>Ver estudiante</Link></td></tr>)}</tbody></table></div><div className="account-links">{page>1&&<Link href={pageLink(page-1)}>Anterior</Link>}<span>Página {page}</span>{page*20<(result.count||0)&&<Link href={pageLink(page+1)}>Siguiente</Link>}</div></section>}
 </AccountShell>;
}
