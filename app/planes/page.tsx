import type { Metadata } from "next";
import Link from "next/link";
import AcademyPresentation from "@/components/AcademyPresentation";
import PlanComparison from "@/components/PlanComparison";
import PricingCards from "@/components/PricingCards";
import FAQ from "@/components/FAQ";
import { PurchaseGuide, SalesClose, LearningPreview } from "@/components/SalesJourney";
export const metadata: Metadata = { title: "Planes | DealerPass", description: "Compara formación, acceso y acompañamiento. Elige tu siguiente paso con condiciones claras." };
export default function PlanesPage() {
  return <>
    <section className="page-intro wrap">
      <span className="kicker"><i /> ELIGE TU SIGUIENTE PASO</span>
      <h1>Un plan para cada etapa de tu camino.</h1>
      <p>Aprende a analizar una subasta con Academy, explora el acceso inicial con Starter o combina formación y acompañamiento con Pro.</p>
      <div className="plans-actions"><a className="button" href="#comparar">Comparar planes ↓</a><Link className="text-link" href="/academy">Conocer la academia ↗</Link></div>
    </section>
    <AcademyPresentation plansPage />
    <section className="wrap sales-comparison" id="planes"><div id="comparar" /><PlanComparison /></section>
    <LearningPreview />
    <PricingCards comparison={false} />
    <PurchaseGuide />
    <FAQ />
    <SalesClose />
  </>;
}
