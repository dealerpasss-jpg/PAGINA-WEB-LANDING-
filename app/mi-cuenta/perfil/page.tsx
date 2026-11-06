import AccountShell from "@/components/AccountShell";
import ProfileEditor from "@/components/ProfileEditor";
import { requireIdentity } from "@/lib/academy/server";
import { safeNext } from "@/lib/academy/policy";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page({searchParams}: {searchParams: Promise<{next?: string; welcome?: string; message?: string}>}) {
  const query = await searchParams;
  const next = safeNext(query.next);
  const who = await requireIdentity("/mi-cuenta/perfil?next=" + encodeURIComponent(next));
  const values = who.user.user_metadata || {};
  return <AccountShell compact kicker="DEALERPASS / TU PERFIL" title={query.welcome ? "Cuéntanos sobre ti." : "Tu perfil y preferencias."}>
    <p>Elige cómo quieres que te llamemos y cuéntanos qué buscas en DealerPass.</p>
    {query.message && <p role="status" className="account-notice">{query.message}</p>}
    <ProfileEditor values={values} next={next} />
    <div className="account-links"><Link href={next}>{query.welcome ? "Completar más tarde" : "Volver a mi espacio"}</Link></div>
  </AccountShell>;
}
