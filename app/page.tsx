import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import ArrowIcon from "@/components/ArrowIcon";
import Reveal from "@/components/Reveal";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import { vehicleCatalogue } from "@/data/vehicle-catalogue";
import { marginMethod } from "@/data/margen";
import "./home-editorial.css";

const money = new Intl.NumberFormat("es-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const routes = [
  { number: "01", title: "Aprende a mirar.", description: "Historial, condición y documentación. Empieza con las preguntas correctas.", href: "/academy", link: "Conoce la academia" },
  { number: "02", title: "Ponle números.", description: "Reparación, gastos y margen. Define tu límite antes de levantar la mano.", href: "/metodo-margen#calculadora", link: "Prueba la calculadora" },
  { number: "03", title: "Elige tu camino.", description: "Compara la formación y el acompañamiento según tu experiencia.", href: "/planes", link: "Explora los planes" },
];

export default function HomePage() {
  return <>
    <Hero />
    <div className="home-editorial">
      <section className="he-section he-route" id="experiencia" aria-labelledby="route-title">
        <Reveal className="he-intro">
          <div><span className="he-eyebrow">01 / EL RECORRIDO DEALERPASS</span><h2 id="route-title">No es solo comprar.<br /><span>Es saber decidir.</span></h2></div>
          <p>El precio de martillo es apenas el comienzo. Conecta lo que ves, lo que cuesta y lo que viene después.</p>
        </Reveal>
        <div className="he-route-grid">{routes.map(route => <Link className="he-route-link" href={route.href} key={route.number}>
          <span className="he-route-number">{route.number}</span><div><h3>{route.title}</h3><p>{route.description}</p><span className="he-inline-link">{route.link} <ArrowIcon /></span></div>
        </Link>)}</div>
      </section>

      <section className="he-section he-academy" aria-labelledby="academy-home-title">
        <Reveal className="he-academy-art">
          <div className="he-art-label"><span>DEALERPASS ACADEMY</span><span>FORMACIÓN EN ESPAÑOL</span></div>
          <figure className="he-academy-portrait">
            <div className="brand-photo-frame"><Image src="/brand/academy-brand-scene.webp" alt="Imagen editada de tres personas junto a un vehículo en un taller." width={1152} height={2048} sizes="(max-width: 460px) calc(100vw - 36px), 420px" /></div>
            <figcaption><span aria-hidden="true" />Formación y criterio para tu próxima compra.</figcaption>
          </figure>
        </Reveal>
        <Reveal className="he-academy-copy" delay={0.1}>
          <span className="he-eyebrow">02 / CONSTRUYE TU CRITERIO</span><h2 id="academy-home-title">La mejor herramienta<br />no está en el taller.<br /><span>Está en lo que sabes.</span></h2>
          <p>Una ruta de formación en español para entender el proceso completo: desde leer un lote hasta preparar su comercialización.</p>
          <ol className="he-syllabus"><li><span>01</span><div><strong>Entiende la subasta</strong><small>Plataformas, títulos y responsabilidades.</small></div></li><li><span>02</span><div><strong>Evalúa la oportunidad</strong><small>Historial, condición y costos reales.</small></div></li><li><span>03</span><div><strong>Prepara el siguiente paso</strong><small>Compra, preparación y comercialización.</small></div></li></ol>
          <Link href="/academy" className="he-primary">Explorar la formación <ArrowIcon /></Link>
          <p className="he-disclosure">Consulta el temario y las condiciones. Los pagos permanecen en preparación; crear tu cuenta no activa una membresía.</p>
          <figure className="he-academy-illustration">
            <Image src="/brand/editorial-academy.webp" alt="Ilustración de un mentor y estudiantes evaluando un vehículo naranja." width={1254} height={1254} sizes="(max-width: 420px) 208px, (max-width: 800px) 180px, 160px" />
            <figcaption><span>DEL DETALLE AL CRITERIO</span><strong>Aprende a ver lo que otros pasan por alto.</strong><small>Ilustración de marca.</small></figcaption>
          </figure>
        </Reveal>
      </section>

      <section className="he-method" aria-labelledby="method-home-title">
        <div className="he-method-inner">
          <Reveal className="he-method-copy"><span className="he-eyebrow">03 / MÉTODO MARGEN</span><h2 id="method-home-title">Antes de pujar,<br /><span>cambia la perspectiva.</span></h2><p>Seis variables. Una evaluación más completa. Dale una estructura a tu decisión y después llévala a los números.</p><Link href="/metodo-margen#calculadora" className="he-primary">Calcular una compra <ArrowIcon /></Link><small>Una estimación no garantiza rentabilidad.</small></Reveal>
          <div className="he-method-map" aria-label="Las seis variables del método MARGEN">{marginMethod.map((item, index) => <Link href="/metodo-margen#metodo-margen" className="he-method-row" key={item.letter}><span className="he-method-index">0{index + 1}</span><strong>{item.letter}</strong><span>{item.word}</span><ArrowIcon direction="up-right" /></Link>)}</div>
        </div>
      </section>

      <section className="he-section he-inventory" aria-labelledby="inventory-home-title">
        <Reveal className="he-intro"><div><span className="he-eyebrow">04 / VEHÍCULOS DEALERPASS</span><h2 id="inventory-home-title">Cada carro,<br /><span>con su propia historia.</span></h2></div><div><p>Explora fotografías, características y precios. Revisa cada detalle antes de dar el siguiente paso.</p><Link href="/vehiculos" className="he-inline-link">Ver los {vehicleCatalogue.length} vehículos <ArrowIcon /></Link></div></Reveal>
        <div className="he-inventory-grid">{vehicleCatalogue.slice(0,3).map(vehicle => <Link className="he-vehicle" href={`/vehiculos/${vehicle.slug}`} key={vehicle.slug}>
          <div className="he-vehicle-image"><Image src={vehicle.photos[0].src} alt={vehicle.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"/><span>{vehicle.photos.length} fotos <ArrowIcon direction="up-right" /></span></div>
          <div className="he-vehicle-meta"><span>{vehicle.specs.find(([label])=>label==='Millaje')?.[1]} · {vehicle.specs.find(([label])=>label==='Transmisión')?.[1]}</span><h3>{vehicle.title}</h3><div><strong>{money.format(vehicle.price/100)}</strong><span className="he-vehicle-arrow">Ver carro <ArrowIcon /></span></div></div>
        </Link>)}</div><p className="he-disclosure">Datos proporcionados por el vendedor. Consulta condiciones y fotografías en cada ficha.</p>
      </section>
      <Testimonials />
      <FAQ compact />
      <section className="he-section he-close" aria-labelledby="elite-home-title"><div><span className="he-eyebrow">DEALERPASS ELITE / ADMISIÓN INDIVIDUAL</span><h2 id="elite-home-title">Tu siguiente capítulo<br />empieza con<br /><span>una conversación.</span></h2></div><div className="he-close-action"><span className="he-close-mark" aria-hidden="true"><ArrowIcon direction="up-right" /></span><p>Primero conocemos tu experiencia y tus objetivos. Después evaluamos juntos si Elite es para ti.</p><Link href="/vip" className="he-primary">Solicitar entrevista <ArrowIcon /></Link><small>Acceso sujeto a evaluación y aprobación.</small></div></section>
    </div>
  </>;
}
