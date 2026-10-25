import type { Metadata } from "next";
import Link from "next/link";
import AcademyPresentation from "@/components/AcademyPresentation";
import { PageIntro } from "@/components/BrandSections";
import AcademySection from "@/components/AcademySection";
import Instructors from "@/components/Instructors";
import FAQ from "@/components/FAQ";
import { LearningPreview, PurchaseGuide, SalesClose } from "@/components/SalesJourney";
import { plans } from "@/data/plans";
export const metadata: Metadata = { title: "Academia | DealerPass", description: "Conoce el temario, los instructores y lo que incluye DealerPass Academy." };
export default function AcademyPage() {
  const academy = plans.find(plan => plan.id === "academy")!;
  return <>
    <PageIntro label="DEALERPASS ACADEMY" title="Aprende a mirar más allá del precio de un carro." description="Una formación en español para conectar historial, condición, costos y comercialización antes de tomar una decisión." />
    <div className="wrap plans-actions"><a className="button" href="#academy-oferta">Ver qué incluye Academy ↓</a><a className="text-link" href="#temario">Explorar el temario</a></div>
    <AcademyPresentation />
    <LearningPreview />
    <div id="temario"><AcademySection /></div>
    <Instructors />
    <section className="section wrap sales-offer" id="academy-oferta">
      <span className="kicker"><i /> TU FORMACIÓN</span><h2>Esto incluye DealerPass Academy.</h2>
      <p>{academy.tagline}</p><ul className="editorial-list">{academy.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      <p className="sales-price">{academy.price} <span>· {academy.priceSuffix}</span></p>
      <p>Academy prioriza la formación. No incluye acceso a plataformas de subastas. La duración del acceso, la comunidad y el calendario de sesiones se confirmarán antes de habilitar la compra.</p>
      <p className="pricing-note">Precio de referencia en revisión. Los pagos permanecen en preparación. Crear tu cuenta no activa una membresía.</p>
      <div className="plans-actions"><Link className="button" href="/mi-cuenta?plan=academy">Elegir Academy →</Link><Link className="text-link" href="/planes#comparar">Comparar con Starter y Pro</Link></div>
    </section>
    <PurchaseGuide />
    <FAQ compact />
    <SalesClose academy />
  </>;
}
