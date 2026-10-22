import { NextResponse } from "next/server";
import {
  identity,
  database,
  origin,
  sameOrigin,
  checked,
} from "@/lib/academy/server";
import { stripe, accessFor, catalogue, priceId } from "@/lib/academy/billing";
import { isPlan, canCheckout } from "@/lib/academy/policy";
export async function POST(request: Request) {
  const back = (message: string) =>
    NextResponse.redirect(
      new URL("/mi-cuenta?message=" + encodeURIComponent(message), origin()),
      303,
    );
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const who = await identity();
  if (!who) return NextResponse.redirect(new URL("/ingresar", origin()), 303);
  const form = await request.formData();
  const plan = form.get("plan");
  if (!isPlan(plan)) return new Response("Invalid plan", { status: 400 });
  if (process.env.PAYMENTS_ENABLED !== "true")
    return back("Los pagos todavía no están habilitados.");
  try {
    const db = database();
    const { data: vip } = checked(
      await db
        .from("vip_applications")
        .select("status")
        .eq("user_id", who.user.id)
        .maybeSingle(),
    );
    if (!canCheckout(plan, vip?.status === "approved"))
      return back(
        "Elite requiere reunión 1 a 1 y aprobación del equipo antes del pago.",
      );
    const access = await accessFor(who.user.id);
    if (access.plans.includes(plan)) return back("Ya tienes este plan activo.");
    if (
      plan !== "academy" &&
      access.states.some((s) => s.active && s.plan !== "academy")
    )
      return back(
        "Ya tienes una membresía activa. Contacta al equipo para cambiarla sin duplicar cobros.",
      );
    const { count } = checked(
      await db
        .from("lessons")
        .select("id", { count: "exact", head: true })
        .eq("published", true)
        .contains("allowed_plans", [plan]),
    );
    if (!count)
      return back(
        "Este plan todavía no tiene formación publicada. Te avisaremos cuando esté disponible.",
      );
    const price = await stripe().prices.retrieve(priceId(plan));
    const expected = catalogue[plan];
    if (
      !price.active ||
      price.currency !== "usd" ||
      price.unit_amount !== expected.amount ||
      (price.recurring?.interval || null) !== expected.interval ||
      (price.recurring && price.recurring.interval_count !== 1)
    )
      throw new Error("Price configuration mismatch");
    let { data: purchase } = checked(
      await db
        .from("purchases")
        .select("id,plan,session_id")
        .eq("user_id", who.user.id)
        .eq("status", "pending")
        .maybeSingle(),
    );
    if (purchase && purchase.plan !== plan)
      return back(
        "Tienes un pago pendiente para otro plan. Complétalo o espera a que caduque para cambiar de plan.",
      );
    if (purchase?.session_id) {
      const existing = await stripe().checkout.sessions.retrieve(
        purchase.session_id,
      );
      if (existing.status === "open" && existing.url)
        return NextResponse.redirect(existing.url, 303);
      return back("Estamos comprobando tu pago. Actualiza tu cuenta.");
    }
    if (!purchase) {
      const result = await db
        .from("purchases")
        .insert({ user_id: who.user.id, plan })
        .select("id,plan,session_id")
        .single();
      if (result.error)
        return back(
          "Ya se está preparando un pago. Inténtalo de nuevo en unos segundos.",
        );
      purchase = result.data;
    }
    const metadata = { purchase_id: purchase.id, user_id: who.user.id, plan };
    const session = await stripe().checkout.sessions.create(
      {
        mode: expected.interval ? "subscription" : "payment",
        customer_email: who.user.email,
        client_reference_id: who.user.id,
        metadata,
        line_items: [{ price: price.id, quantity: 1 }],
        allow_promotion_codes: false,
        success_url: origin() + "/mi-cuenta?pago=recibido",
        cancel_url: origin() + "/mi-cuenta?pago=cancelado",
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        ...(expected.interval
          ? { subscription_data: { metadata } }
          : {
              payment_intent_data: { metadata },
              customer_creation: "always" as const,
            }),
      },
      { idempotencyKey: "checkout-" + purchase.id },
    );
    checked(
      await db
        .from("purchases")
        .update({ session_id: session.id })
        .eq("id", purchase.id),
    );
    if (!session.url) throw new Error("Missing checkout URL");
    return NextResponse.redirect(session.url, 303);
  } catch {
    return back(
      "No pudimos preparar el pago. No se ha habilitado ningún acceso. Inténtalo de nuevo o contacta al equipo.",
    );
  }
}
