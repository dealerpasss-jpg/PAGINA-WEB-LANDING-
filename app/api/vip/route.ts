import { NextResponse } from "next/server";
import { identity, sameOrigin, database, origin } from "@/lib/academy/server";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const who = await identity();
  if (!who) return new Response("Unauthorized", { status: 401 });
  const form = await request.formData();
  const phone = String(form.get("phone") || "").trim(),
    experience = String(form.get("experience") || "").trim(),
    goals = String(form.get("goals") || "").trim();
  if (
    phone.length < 7 ||
    phone.length > 40 ||
    experience.length < 20 ||
    experience.length > 2000 ||
    goals.length < 20 ||
    goals.length > 2000 ||
    form.get("consent") !== "yes"
  )
    return new Response("Invalid input", { status: 400 });
  const { error } = await database()
    .from("vip_applications")
    .insert({ user_id: who.user.id, phone, experience, goals });
  return NextResponse.redirect(
    new URL(
      "/vip?message=" +
        encodeURIComponent(
          error
            ? "Ya existe una solicitud o no pudimos guardarla. Revisa el estado en tu cuenta."
            : "Solicitud recibida. El equipo revisará tu perfil para coordinar la reunión.",
        ),
      origin(),
    ),
    303,
  );
}
