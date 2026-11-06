import { NextResponse } from "next/server";
import { stripe, syncPurchase } from "@/lib/academy/billing";
import { database, checked } from "@/lib/academy/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET)
    return new Response("Not configured", { status: 503 });
  let event;
  try {
    event = stripe().webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") || "",
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    const db = database();
    const { data: done } = checked(
      await db
        .from("stripe_events")
        .select("id")
        .eq("id", event.id)
        .maybeSingle(),
    );
    if (done) return NextResponse.json({ received: true });
    // Checkout binds the signed event to the server-created purchase. Authorization always rechecks Stripe live.
    if (event.type.startsWith("checkout.session.")) {
      const session = event.data.object as {
        id: string;
        metadata?: { purchase_id?: string };
        client_reference_id?: string;
      };
      if (session.metadata?.purchase_id) {
        const { data: p } = checked(
          await db
            .from("purchases")
            .select("id,user_id,plan,session_id")
            .eq("id", session.metadata.purchase_id)
            .maybeSingle(),
        );
        if (p && p.user_id === session.client_reference_id) {
          if (!p.session_id) {
            checked(
              await db
                .from("purchases")
                .update({ session_id: session.id })
                .eq("id", p.id)
                .is("session_id", null),
            );
            p.session_id = session.id;
          }
          await syncPurchase(p);
        }
      }
    }
    // Renewal/cancellation/refund/dispute events are recorded; request-time reconciliation is authoritative.
    checked(
      await db
        .from("stripe_events")
        .upsert(
          { id: event.id, type: event.type },
          { onConflict: "id", ignoreDuplicates: true },
        ),
    );
    return NextResponse.json({ received: true });
  } catch {
    return new Response("Retry processing", { status: 500 });
  }
}
