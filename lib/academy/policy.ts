export const paidPlans = ["starter", "academy", "pro", "elite"] as const;
export type PaidPlan = (typeof paidPlans)[number];
export function isPlan(value: unknown): value is PaidPlan {
  return (
    typeof value === "string" &&
    (paidPlans as readonly string[]).includes(value)
  );
}
export function safeNext(value: unknown) {
  return typeof value === "string" &&
    /^\/(?![\/\\])/.test(value) &&
    !/[\\\r\n]/.test(value)
    ? value
    : "/mi-cuenta";
}
export function canOpenLesson(plans: string[], allowed: string[]) {
  return plans.some((plan) => allowed.includes(plan));
}
export function canCheckout(plan: PaidPlan, approved: boolean) {
  return plan !== "elite" || approved;
}
export function paidSubscription(
  status: string,
  periodEnd: number,
  invoicePaid: boolean,
  refunded: boolean,
  now = Date.now() / 1000,
) {
  return status === "active" && periodEnd > now && invoicePaid && !refunded;
}
