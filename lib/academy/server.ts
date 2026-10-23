import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { safeNext } from "./policy";
import { redirect } from "next/navigation";
export function configured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
export function origin() {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL missing");
  return new URL(value).origin;
}
export function database() {
  if (!configured()) throw new Error("Accounts not configured");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function auth() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Refreshed by middleware. */
          }
        },
      },
    },
  );
}
export async function identity() {
  if (!configured()) return null;
  const {
    data: { user },
  } = await (await auth()).auth.getUser();
  if (!user || !user.email_confirmed_at) return null;
  const db = database();
  const { error: insertError } = await db
    .from("profiles")
    .upsert(
      { id: user.id, email: user.email?.toLowerCase() },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (insertError) throw insertError;
  const { data: profile, error } = await db
    .from("profiles")
    .select("id,email,role")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return { user, profile };
}
export async function requireIdentity(next = "/mi-cuenta") {
  const who = await identity();
  if (!who) redirect("/ingresar?next=" + encodeURIComponent(safeNext(next)));
  return who;
}
export function sameOrigin(request: Request) {
  return !!process.env.APP_URL && request.headers.get("origin") === origin();
}
export function checked<T extends { error: unknown }>(result: T): T {
  if (result.error) throw result.error;
  return result;
}
