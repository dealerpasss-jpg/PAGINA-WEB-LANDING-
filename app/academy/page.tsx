import type { Metadata } from "next";
import Link from "next/link";
import AcademyPresentation from "@/components/AcademyPresentation";
import ArrowIcon from "@/components/ArrowIcon";
import styles from "./academy.module.css";
import AcademySection from "@/components/AcademySection";
import Instructors from "@/components/Instructors";
import FAQ from "@/components/FAQ";
import { LearningPreview, PurchaseGuide, SalesClose } from "@/components/SalesJourney";
import { plans } from "@/data/plans";
export const metadata: Metadata = { title: "Academia | DealerPass", description: "Conoce el temario, los instructores y lo que incluye DealerPass Academy." };
export default function AcademyPage() {
  const academy = plans.find(plan => plan.id === "academy")!;
  return <div className={styles.page}>
    <section className={`wrap ${styles.hero}`} aria-labelledby="academy-title">
      <span className="kicker"><i /> DEALERPASS ACADEMY</span>
      <h1 id="academy-title">Aprende a mirar más allá del precio de un carro.</h1>
      <p className={styles.description}>Una formación en español para conectar historial, condición, costos y comercialización antes de tomar una decisión.</p>
      <nav className={styles.actions} aria-label="Explorar Academy">
        <a className={styles.primary} href="#academy-oferta">Ver qué incluye Academy <ArrowIcon direction="down" /></a>
        <a className={styles.secondary} href="#temario">Explorar el temario <ArrowIcon direction="down" /></a>
      </nav>
      <div className={styles.overview} aria-label="Tu recorrido por la academia"><span><b>01</b> Conoce DealerPass</span><span><b>02</b> Explora la formación</span><span><b>03</b> Elige tu siguiente paso</span></div>
    </section>
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
      <div className="plans-actions"><Link className="button" href="/mi-cuenta?plan=academy">Elegir Academy <ArrowIcon direction="right" /></Link><Link className="text-link" href="/planes#comparar">Comparar con Starter y Pro</Link></div>
    </section>
    <PurchaseGuide />
    <FAQ compact />
    <SalesClose academy />
  </div>;
}
