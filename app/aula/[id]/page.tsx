import ArrowIcon from "@/components/ArrowIcon";
import { notFound } from "next/navigation";
import Link from "next/link";
import AccountShell from "@/components/AccountShell";
import { requireIdentity, database, checked } from "@/lib/academy/server";
import { accessFor } from "@/lib/academy/billing";
import { canOpenLesson } from "@/lib/academy/policy";
export const dynamic = "force-dynamic";
export default async function Page({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;
  const who = await requireIdentity();
  const db = database();
  const { data: lesson } = checked(
    await db
      .from("lessons")
      .select("*")
      .eq("id", params.id)
      .eq("published", true)
      .maybeSingle(),
  );
  if (!lesson) notFound();
  let plans: string[] = [];
  try {
    plans = (await accessFor(who.user.id)).plans;
  } catch {
    return (
      <AccountShell title="Verificación temporalmente no disponible.">
        <p>Intenta abrir la clase de nuevo en unos minutos.</p>
      </AccountShell>
    );
  }
  if (!canOpenLesson(plans, lesson.allowed_plans))
    return (
      <AccountShell title="Esta clase requiere otro plan.">
        <p>
          El contenido está reservado para los planes habilitados por
          DealerPass.
        </p>
        <Link href="/mi-cuenta" className="btn-primary">
          Ver mis opciones
        </Link>
      </AccountShell>
    );
  let asset: string | undefined;
  if (lesson.asset_path) {
    const { data } = checked(
      await db.storage
        .from("academy-private")
        .createSignedUrl(lesson.asset_path, 300),
    );
    if (!data) throw new Error("Missing asset");
    asset = data.signedUrl;
  }
  return (
    <AccountShell kicker={lesson.module_title} title={lesson.title}>
      <div className="account-links">
        <Link href="/aula">
          <ArrowIcon direction="left" /> Volver a mi formación
        </Link>
      </div>
      {asset &&
        (/\.(mp4|webm)$/i.test(lesson.asset_path) ? (
          <video
            controls
            controlsList="nodownload"
            preload="metadata"
            src={asset}
          />
        ) : (
          <a
            href={asset}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Abrir material de la clase
          </a>
        ))}
      <article className="account-card account-prose">{lesson.body}</article>
      <form method="post" action="/api/progress" className="account-links">
        <input type="hidden" name="lesson" value={lesson.id} />
        <button className="btn-primary">Marcar como completada</button>
      </form>
    </AccountShell>
  );
}
