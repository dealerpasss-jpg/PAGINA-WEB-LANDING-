import { NextResponse } from "next/server";
import {
  identity,
  database,
  checked,
  origin,
  sameOrigin,
} from "@/lib/academy/server";
import { isPlan } from "@/lib/academy/policy";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const who = await identity();
  if (who?.profile.role !== "admin")
    return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const action = String(form.get("action"));
  const db = database();
  const back = (message: string) =>
    NextResponse.redirect(
      new URL("/equipo?message=" + encodeURIComponent(message), origin()),
      303,
    );
  try {
    let target = "";
    if (action === "vip") {
      const status = String(form.get("status"));
      target = String(form.get("user_id"));
      const note = String(form.get("review_note") || "").trim();
      const raw = String(form.get("meeting_at") || "");
      const date = raw ? new Date(raw + "Z") : null;
      if (
        !["requested", "meeting", "approved", "rejected"].includes(status) ||
        note.length > 2000
      )
        return back("Revisa la evaluación.");
      if (
        status === "approved" &&
        (!date ||
          !Number.isFinite(date.getTime()) ||
          date.getTime() > Date.now() ||
          note.length < 11)
      )
        return back(
          "Para aprobar Elite debes registrar una reunión ya realizada y una evaluación de al menos 11 caracteres.",
        );
      checked(
        await db
          .from("vip_applications")
          .update({
            status,
            meeting_at: date?.toISOString() || null,
            review_note: note,
            reviewed_by: who.user.id,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", target)
          .select("user_id")
          .single(),
      );
    } else if (action === "role") {
      const email = String(form.get("email") || "")
        .trim()
        .toLowerCase();
      const role = String(form.get("role"));
      if (!["student", "collaborator"].includes(role))
        return back("Permiso no válido.");
      const { data: profile } = checked(
        await db
          .from("profiles")
          .select("id,role")
          .eq("email", email)
          .maybeSingle(),
      );
      if (!profile)
        return back(
          "La persona debe registrarse, confirmar su correo e iniciar sesión primero.",
        );
      if (profile.role === "admin")
        return back(
          "No se modifican cuentas administradoras desde este formulario.",
        );
      target = profile.id;
      checked(await db.from("profiles").update({ role }).eq("id", target));
    } else if (action === "lesson") {
      const title = String(form.get("title") || "").trim(),
        module_title = String(form.get("module_title") || "").trim(),
        body = String(form.get("body") || "").trim(),
        asset_path = String(form.get("asset_path") || "").trim();
      const allowed_plans = form.getAll("allowed_plans").filter(isPlan);
      const position = Number(form.get("position"));
      const published = form.get("published") === "yes";
      if (
        !title ||
        title.length > 160 ||
        !module_title ||
        module_title.length > 160 ||
        body.length > 50000 ||
        asset_path.length > 500 ||
        asset_path.includes("..") ||
        asset_path.includes(":") ||
        asset_path.startsWith("/") ||
        !Number.isInteger(position) ||
        position < 0 ||
        position > 10000
      )
        return back("Revisa los datos de la clase.");
      if (published && (!allowed_plans.length || (!body && !asset_path)))
        return back(
          "Una clase publicada necesita contenido y al menos un plan con acceso.",
        );
      if (asset_path) {
        const check = await db.storage
          .from("academy-private")
          .createSignedUrl(asset_path, 60);
        if (check.error)
          return back("No encontramos el material en el depósito privado.");
      }
      const values = {
        title,
        module_title,
        body,
        asset_path: asset_path || null,
        allowed_plans,
        position,
        published,
      };
      const id = String(form.get("id") || "");
      const result = id
        ? await db
            .from("lessons")
            .update(values)
            .eq("id", id)
            .select("id")
            .single()
        : await db.from("lessons").insert(values).select("id").single();
      checked(result);
      if (!result.data) throw new Error("Missing lesson");
      target = result.data.id;
    } else return back("Acción no válida.");
    checked(
      await db
        .from("academy_audit")
        .insert({ actor: who.user.id, action, target }),
    );
    return back("Cambios guardados.");
  } catch {
    return back(
      "No pudimos completar la operación. Revisa los datos e inténtalo de nuevo.",
    );
  }
}
