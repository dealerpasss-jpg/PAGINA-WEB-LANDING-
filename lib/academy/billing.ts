import "server-only";
import Stripe from "stripe";
import { database, checked } from "./server";
import { isPlan, paidSubscription, type PaidPlan } from "./policy";
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    maxNetworkRetries: 2,
    timeout: 15000,
  });
}
export const catalogue: Record<
  PaidPlan,
  { amount: number; interval: "month" | "year" | null }
> = {
  starter: { amount: 19900, interval: "month" },
  academy: { amount: 69700, interval: null },
  pro: { amount: 49900, interval: "month" },
  elite: { amount: 299900, interval: "year" },
};
export function priceId(plan: PaidPlan) {
  const id = process.env[`STRIPE_PRICE_${plan.toUpperCase()}`];
  if (!id) throw new Error("Price missing");
  return id;
}
function id(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id;
}
async function validPayment(intent: string) {
  const pi = await stripe().paymentIntents.retrieve(intent, {
    expand: ["latest_charge"],
  });
  const charge = pi.latest_charge as Stripe.Charge | null;
  return (
    pi.status === "succeeded" &&
    !!charge &&
    charge.paid &&
    !charge.refunded &&
    !charge.disputed
  );
}
export async function syncPurchase(purchase: {
  id: string;
  session_id: string | null;
  user_id: string;
  plan: string;
}) {
  if (!purchase.session_id)
    return {
      active: false,
      status: "pending",
      plan: purchase.plan,
      customer: null,
    };
  const s = await stripe().checkout.sessions.retrieve(purchase.session_id);
  if (
    s.client_reference_id !== purchase.user_id ||
    s.metadata?.purchase_id !== purchase.id ||
    s.metadata?.plan !== purchase.plan
  )
    throw new Error("Purchase identity mismatch");
  let active = false;
  if (s.status === "complete" && isPlan(purchase.plan)) {
    if (
      s.mode === "payment" &&
      purchase.plan === "academy" &&
      s.payment_status === "paid" &&
      id(s.payment_intent)
    )
      active = await validPayment(id(s.payment_intent)!);
    if (s.mode === "subscription" && id(s.subscription)) {
      const sub = await stripe().subscriptions.retrieve(id(s.subscription)!, {
        expand: ["latest_invoice"],
      });
      const item = sub.items.data[0];
      const invoice = sub.latest_invoice as Stripe.Invoice | null;
      let invoicePayment = false;
      if (invoice?.status === "paid") {
        const payments = await stripe().invoicePayments.list({
          invoice: invoice.id,
          status: "paid",
          limit: 100,
        });
        for (const payment of payments.data) {
          const pi = id(payment.payment.payment_intent);
          if (pi && (await validPayment(pi))) invoicePayment = true;
        }
      }
      active =
        !!item &&
        item.price.id === priceId(purchase.plan) &&
        !sub.pause_collection &&
        paidSubscription(
          sub.status,
          item.current_period_end,
          invoice?.status === "paid",
          !invoicePayment,
        );
    }
  }
  const status =
    s.status === "open"
      ? "pending"
      : s.status === "expired"
        ? "expired"
        : active
          ? "active"
          : "inactive";
  checked(
    await database().from("purchases").update({ status }).eq("id", purchase.id),
  );
  return {
    active,
    status,
    plan: purchase.plan,
    customer: id(s.customer) || null,
  };
}
export async function accessFor(userId: string) {
  const { data } = checked(
    await database()
      .from("purchases")
      .select("id,session_id,user_id,plan")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  );
  const states = [];
  for (const purchase of data || []) states.push(await syncPurchase(purchase));
  const { data: vip } = checked(
    await database()
      .from("vip_applications")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle(),
  );
  return {
    plans: states
      .filter(
        (s) => s.active && (s.plan !== "elite" || vip?.status === "approved"),
      )
      .map((s) => s.plan),
    states,
  };
}
