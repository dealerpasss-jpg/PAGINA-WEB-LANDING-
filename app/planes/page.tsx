import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PricingCards from "@/components/PricingCards";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import ArrowIcon from "@/components/ArrowIcon";
import { comparisonRows, plans } from "@/data/plans";
export const metadata: Metadata = { title: "Planes | DealerPass", description: "Conoce la experiencia DealerPass y compara tu formación y acompañamiento." };
const experiences = [
  { title: "Entender la subasta", text: "Historial, condición y documentación: aprende qué revisar antes de pujar.", image: "/brand/editorial-inspection.webp" },
  { title: "Aprender acompañado", text: "Conceptos, preguntas y casos para construir tu propio criterio.", image: "/brand/editorial-academy.webp" },
  { title: "Decidir con números", text: "Conecta los costos con una oferta máxima y un escenario de venta.", image: "/brand/editorial-costs.webp" },
];
export default function PlanesPage() {
  return <>
    <section className="wrap plans-welcome">
      <div><span className="kicker"><i /> LA EXPERIENCIA DEALERPASS</span>
        <h1>Aprende el proceso.<br />Encuentra tu próximo paso.</h1>
        <p>Una comunidad que comparte tu interés por las subastas. Conoce cómo aprendemos, compara las opciones y elige el acompañamiento que necesitas.</p>
        <div className="plans-actions"><a className="button" href="#planes">Comparar paquetes <ArrowIcon direction="down" /></a><Link className="text-link" href="/ingresar?mode=registro">Crear mi perfil <ArrowIcon /></Link></div>
        <div className="plans-proof"><strong>3.000+</strong><span>personas se han formado con nosotros</span></div>
      </div>
      <div className="plans-hero-art"><Image src="/brand/editorial-academy.webp" alt="Ilustración de un mentor y estudiantes analizando un vehículo" fill priority sizes="(max-width: 800px) 100vw, 50vw" /><span>EL CONOCIMIENTO SE COMPARTE.</span></div>
    </section>
    <section className="wrap plans-experience" aria-labelledby="experience-title">
      <span className="kicker"><i /> APRENDER. COMPARTIR. APLICAR.</span>
      <h2 id="experience-title">Más contexto para cada decisión.</h2>
      <div className="experience-gallery">{experiences.map((item) => <article key={item.title}><div><Image src={item.image} alt={`Ilustración: ${item.title}`} fill sizes="(max-width: 800px) 100vw, 33vw" /></div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      <p className="illustration-note">Ilustraciones de la experiencia educativa. Las actividades y el acompañamiento dependen del plan.</p>
    </section>
    <section className="wrap plans-heading"><span className="kicker"><i /> TU FORMACIÓN, A TU RITMO</span><h2>Elige desde dónde quieres avanzar.</h2><p>Compara el alcance y la modalidad de pago. Puedes crear tu perfil antes de elegir; crear una cuenta no activa una membresía.</p></section>
    <PricingCards />
    <section className="wrap plans-comparison"><details><summary>Ver la comparación completa de los planes</summary><div className="plans-table-scroll" tabIndex={0} role="region" aria-label="Comparación de planes"><table><caption>Qué incluye cada opción</caption><thead><tr><th scope="col">Incluye</th>{plans.map(p=><th scope="col" key={p.id}>{p.name.replace("DealerPass ","")}</th>)}</tr></thead><tbody>{comparisonRows.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{plans.map(p=><td key={p.id}>{row[p.id]}</td>)}</tr>)}</tbody></table></div><p>* La disponibilidad de plataformas depende del plan, del estado y de las condiciones de terceros.</p></details></section>
    <section className="wrap plans-steps"><h2>Tu camino empieza aquí.</h2><ol><li><span>01</span><h3>Crea tu perfil</h3><p>Regístrate con tu correo y confirma tu cuenta.</p></li><li><span>02</span><h3>Elige tu formación</h3><p>Revisa el alcance, precio y condiciones del paquete.</p></li><li><span>03</span><h3>Entra a tu dashboard</h3><p>Consulta tu formación cuando el pago esté confirmado. Elite requiere entrevista y aprobación previa.</p></li></ol><Link className="text-link" href="/ingresar">Ya tengo cuenta · Ingresar <ArrowIcon /></Link></section>
    <Testimonials />
    <FAQ />
  </>;
}
