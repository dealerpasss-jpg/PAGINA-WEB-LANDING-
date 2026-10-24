import AccountShell from "@/components/AccountShell";
import PurchaseCalculator from "@/components/PurchaseCalculator";
import { requireIdentity } from "@/lib/academy/server";
import { accessFor } from "@/lib/academy/billing";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page() {
  const who=await requireIdentity("/mi-cuenta/calculadora");
  let active=false, failed=false;
  try { active=(await accessFor(who.user.id)).plans.length>0; } catch {failed=true;}
  return <AccountShell title="Cada costo cuenta." kicker="DEALERPASS / CALCULADORA"><p>Prepara un escenario de compra antes de definir tu puja.</p>{active ? <PurchaseCalculator /> : <div className="account-notice"><p>{failed ? "No pudimos verificar tu acceso. Inténtalo nuevamente." : "La calculadora está incluida en los planes de DealerPass. Necesitas un plan activo para utilizarla."}</p><Link href="/mi-cuenta">Volver a mi espacio</Link></div>}</AccountShell>;
}
