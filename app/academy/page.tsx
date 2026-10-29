import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ArrowIcon from '@/components/ArrowIcon';
import AcademySection from '@/components/AcademySection';
import Instructors from '@/components/Instructors';
import FAQ from '@/components/FAQ';
import { LearningPreview, PurchaseGuide, SalesClose } from '@/components/SalesJourney';
import { plans } from '@/data/plans';
import styles from './academy.module.css';

export const metadata: Metadata = { title: 'Academia | DealerPass', description: 'Conoce el temario, los instructores y lo que incluye DealerPass Academy.' };

export default function AcademyPage() {
  const academy = plans.find(plan => plan.id === 'academy')!;
  return <div className={styles.page}>
    <section className={`wrap ${styles.hero}`} aria-labelledby="academy-title">
      <div className={styles.heroCopy}><span className="kicker"><i /> DEALERPASS ACADEMY</span><h1 id="academy-title">Aprende a mirar<br /><span>más allá del precio</span><br />de un carro.</h1><p className={styles.description}>Una formación en español para conectar historial, condición, costos y comercialización antes de tomar una decisión.</p><div className={styles.actions}><a className={styles.primary} data-dp-button="primary" href="#temario">Explorar el temario <ArrowIcon direction="down" /></a><a className={styles.secondary} data-dp-button="secondary" href="#academy-oferta">Qué incluye Academy <ArrowIcon direction="right" /></a></div><p className={styles.heroNote}>Conoce el enfoque. Revisa las condiciones. Decide a tu ritmo.</p></div>
      <figure className={styles.heroMedia}><Image src="/team/juan-esteban.webp" alt="Juan Esteban, instructor de DealerPass, junto a los vehículos" fill priority sizes="(max-width: 800px) 100vw, 45vw" /><figcaption><span>FORMACIÓN EN ESPAÑOL</span><strong>El criterio se construye.<br />Una decisión a la vez.</strong><span className={styles.mediaMark} aria-hidden="true"><ArrowIcon direction="up-right" /></span></figcaption></figure>
    </section>
    <div className={`wrap ${styles.chapterNav}`}><span>EXPLORA ACADEMY</span><nav aria-label="Secciones de Academy"><a href="#enfoque">El enfoque <span>01</span></a><a href="#temario">Temario <span>02</span></a><a href="#instructores">Instructores <span>03</span></a><a href="#academy-oferta">Qué incluye <span>04</span></a></nav></div>
    <div className={`wrap ${styles.availability}`}><span className={styles.availabilityDot} aria-hidden="true"/><p><strong>Apertura en preparación.</strong> La presentación en video, las lecciones y los recursos se confirmarán antes de habilitar la compra. Crear tu cuenta no activa una membresía.</p></div>
    <LearningPreview />
    <AcademySection />
    <Instructors />
    <section className={`wrap ${styles.offer}`} aria-labelledby="academy-offer-title">
      <div className={styles.offerIntro} id="academy-oferta"><span className="kicker"><i /> TU FORMACIÓN</span><h2 id="academy-offer-title">Un punto de partida.<br /><span>Una visión más completa.</span></h2><p>{academy.tagline}</p><ul className={styles.offerFeatures}>{academy.features.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul></div>
      <aside className={styles.offerCard}><span className={styles.offerLabel}>DEALERPASS ACADEMY</span><p className={styles.offerPrice}>{academy.price}<span>{academy.priceSuffix}</span></p><p>Academy prioriza la formación. No incluye acceso a plataformas de subastas.</p><Link className={styles.primary} data-dp-button="primary" href="/mi-cuenta?plan=academy">Revisar mi elección <ArrowIcon direction="right" /></Link><Link className={styles.offerCompare} href="/planes#comparar">Comparar con Starter y Pro <ArrowIcon direction="up-right" /></Link><div className={styles.offerDisclosure}><strong>Precio de referencia en revisión.</strong><p>Los pagos permanecen en preparación. La duración del acceso, la comunidad y el calendario de sesiones se confirmarán antes de habilitar la compra.</p></div></aside>
    </section>
    <PurchaseGuide />
    <FAQ compact />
    <SalesClose academy />
  </div>;
}
