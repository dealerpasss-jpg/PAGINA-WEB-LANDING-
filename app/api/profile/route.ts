import { NextResponse } from "next/server";
import { auth, configured, origin, sameOrigin } from "@/lib/academy/server";
import { readProfile } from "@/lib/academy/profile";
import { safeNext } from "@/lib/academy/policy";
export async function POST(request: Request) {
  if (!configured()) return NextResponse.json({error:"Acceso no disponible."},{status:503});
  if (!sameOrigin(request)) return NextResponse.json({error:"Solicitud no válida."},{status:403});
  const client = await auth();
  const {data:{user}} = await client.auth.getUser();
  if (!user?.email_confirmed_at) return NextResponse.json({error:"Inicia sesión para editar tu perfil."},{status:401});
  const form = await request.formData();
  const next = safeNext(form.get("next"));
  const result = readProfile(form, true);
  let message = result.error;
  if (result.data) {
    const {error} = await client.auth.updateUser({data:{...result.data, preferences_updated_at:new Date().toISOString()}});
    if (!error) return NextResponse.redirect(new URL(next, origin()),303);
    message = "No pudimos guardar tu perfil. Inténtalo nuevamente.";
  }
  return NextResponse.redirect(new URL("/mi-cuenta/perfil?next="+encodeURIComponent(next)+"&message="+encodeURIComponent(message || "Revisa tus datos."),origin()),303);
}
