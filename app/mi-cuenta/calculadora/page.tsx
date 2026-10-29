import AccountShell from "@/components/AccountShell";
import PurchaseCalculator from "@/components/PurchaseCalculator";
import { requireIdentity } from "@/lib/academy/server";
import { accessFor } from "@/lib/academy/billing";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Page() {
  const who=await requireIdentity("/mi-cuenta/calculadora");
  let active=who.profile.role==='admin', failed=false;
  try { if(!active) active=(await accessFor(who.user.id)).plans.length>0; } catch {failed=true;}
  return <AccountShell team={who.profile.role!=="student"} title="¿Cuánto puedes pagar por ese carro?" kicker="DEALERPASS / CALCULADORA"><p>Completa los 3 pasos para calcular tu límite de compra. Usa un ejemplo si quieres ver cómo funciona antes de ingresar tus datos.</p>{active ? <PurchaseCalculator /> : <div className="account-notice"><p>{failed ? "No pudimos verificar tu acceso. Inténtalo nuevamente." : "La calculadora está incluida en los planes de DealerPass. Necesitas un plan activo para utilizarla."}</p><Link href="/mi-cuenta">Volver a mi espacio</Link></div>}</AccountShell>;
}
