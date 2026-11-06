import { NextResponse } from "next/server";
import { identity, origin, sameOrigin } from "@/lib/academy/server";
import { accessFor, stripe } from "@/lib/academy/billing";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const who = await identity();
  if (!who) return new Response("Unauthorized", { status: 401 });
  try {
    const { states } = await accessFor(who.user.id);
    const customer =
      states.find((s) => s.active && s.plan !== "academy")?.customer ||
      states.find((s) => s.customer)?.customer;
    if (!customer) throw new Error("No customer");
    const session = await stripe().billingPortal.sessions.create({
      customer,
      return_url: origin() + "/mi-cuenta",
    });
    return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.redirect(
      new URL(
        "/mi-cuenta?message=No+se+pudo+abrir+la+gestión+de+pagos.",
        origin(),
      ),
      303,
    );
  }
}
