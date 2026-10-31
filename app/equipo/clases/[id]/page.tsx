import AccountShell from "@/components/AccountShell";
import TeamNav from "@/components/TeamNav";
import { requireTeam } from "@/lib/academy/team-server";
import { validRecordId } from "@/lib/academy/team-policy";
import { database } from "@/lib/academy/server";
import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}) {
 const who=await requireTeam("/equipo/clases");const {id}=await params;if(!validRecordId(id))notFound();const db=database();
 const result=await db.from("lessons").select("*").eq("id",id).maybeSingle();if(result.error)throw new Error("Lesson preview unavailable");const lesson=result.data;if(!lesson)notFound();
 const asset=lesson.asset_path?await db.storage.from("academy-private").createSignedUrl(lesson.asset_path,300):null;
 return <AccountShell kicker={lesson.module_title} title={lesson.title}><TeamNav admin={who.profile.role==="admin"}/><p className="account-notice">Vista interna · {lesson.published?"Clase publicada":"Borrador"} · Planes: {lesson.allowed_plans.join(", ")||"ninguno"}. Esta vista no registra progreso.</p>{asset?.error&&<p role="alert">No pudimos abrir el archivo adjunto. Revisa su ruta.</p>}{asset?.data?.signedUrl&&(/\.(mp4|webm)$/i.test(lesson.asset_path)?<video controls preload="metadata" src={asset.data.signedUrl}/>:<a href={asset.data.signedUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Abrir material privado</a>)}<article className="account-card account-prose">{lesson.body||"Esta clase todavía no tiene texto."}</article></AccountShell>;
}
