import { passwordError } from "@/lib/academy/password";
import { readProfile } from "@/lib/academy/profile";
import { NextResponse } from "next/server";
import { auth, configured, origin, sameOrigin } from "@/lib/academy/server";
import { safeNext } from "@/lib/academy/policy";
export async function POST(request: Request) {
  if (!configured())
    return NextResponse.json(
      { error: "Estamos preparando el acceso. Inténtalo más tarde." },
      { status: 503 },
    );
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Solicitud no válida." },
      { status: 403 },
    );
  const form = await request.formData();
  const action = String(form.get("action"));
  const next = safeNext(form.get("next"));
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const client = await auth();
  let message = "";
  if (action === "logout") {
    await client.auth.signOut();
    return NextResponse.redirect(new URL("/ingresar", origin()), 303);
  }
  if (action === "reset") {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: origin() + "/auth/callback?next=" + encodeURIComponent("/auth/nueva-contrasena"),
    });
    if (!error) return NextResponse.redirect(new URL("/ingresar?mode=enviado&next=" + encodeURIComponent(next), origin()), 303);
    message = "No pudimos enviar el enlace en este momento. Espera unos minutos y vuelve a intentarlo.";
  } else if (action === "password") {
    const {
      data: { user },
    } = await client.auth.getUser();
    const problem = !user
      ? "El enlace caducó o la sesión terminó. Solicita un nuevo enlace."
      : passwordError(password, String(form.get("confirm_password") || ""));
    if (problem) return NextResponse.redirect(new URL("/auth/nueva-contrasena?message=" + encodeURIComponent(problem), origin()), 303);
    const { error } = await client.auth.updateUser({ password });
    if (error) return NextResponse.redirect(new URL("/auth/nueva-contrasena?message=" + encodeURIComponent("No pudimos guardar la contraseña. Elige una distinta a la anterior o solicita un nuevo enlace."), origin()), 303);
    await client.auth.signOut();
    return NextResponse.redirect(new URL("/ingresar?message=" + encodeURIComponent("Contraseña actualizada. Ingresa con tu nueva contraseña."), origin()), 303);
  } else if (
    action === "signup" &&
    password.length >= 12 &&
    password.length <= 256 &&
    email.length < 255 &&
    form.get("consent") === "yes"
  ) {
    const profile = readProfile(form);
    if (profile.error) return NextResponse.redirect(new URL("/ingresar?mode=registro&next=" + encodeURIComponent(next) + "&message=" + encodeURIComponent(profile.error), origin()), 303);
    const destination = "/mi-cuenta/perfil?welcome=1&next=" + encodeURIComponent(next);
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { ...profile.data, terms_accepted_at: new Date().toISOString(), terms_version: "2026-10-24", preferences_updated_at: new Date().toISOString() },
        emailRedirectTo:
          origin() + "/auth/callback?next=" + encodeURIComponent(destination),
      },
    });
    message = error
      ? "No pudimos registrar la cuenta. Revisa los datos o intenta recuperar tu contraseña."
      : "Revisa tu correo para confirmar tu cuenta antes de entrar.";
  } else if (action === "login") {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (!error) return NextResponse.redirect(new URL(next, origin()), 303);
    message =
      "No pudimos iniciar sesión. Revisa tu correo, contraseña y confirmación de email.";
  } else
    message =
      "Revisa los datos. La contraseña debe tener al menos 12 caracteres.";
  return NextResponse.redirect(
    new URL(
      "/ingresar?mode=" + (action === "signup" ? "registro" : action === "reset" ? "recuperar" : "login") + "&message=" +
        encodeURIComponent(message) +
        "&next=" +
        encodeURIComponent(next),
      origin(),
    ),
    303,
  );
}
