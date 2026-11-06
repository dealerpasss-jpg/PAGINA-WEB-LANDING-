import { NextResponse } from "next/server";
import {
  identity,
  database,
  sameOrigin,
  origin,
  checked,
} from "@/lib/academy/server";
import { accessFor } from "@/lib/academy/billing";
import { canOpenLesson } from "@/lib/academy/policy";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const who = await identity();
  if (!who) return new Response("Unauthorized", { status: 401 });
  const form = await request.formData();
  const id = String(form.get("lesson"));
  const db = database();
  const { data: lesson } = checked(
    await db
      .from("lessons")
      .select("id,allowed_plans")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle(),
  );
  const { plans } = await accessFor(who.user.id);
  if (!lesson || !canOpenLesson(plans, lesson.allowed_plans))
    return new Response("Forbidden", { status: 403 });
  checked(
    await db
      .from("lesson_progress")
      .upsert({ user_id: who.user.id, lesson_id: id }),
  );
  return NextResponse.redirect(new URL("/aula", origin()), 303);
}
