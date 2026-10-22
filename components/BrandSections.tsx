import Link from "next/link";
import Image from "next/image";
import Reveal from "./Reveal";
export function Experience() {
  return (
    <section id="experiencia" className="section wrap">
      <Reveal>
        <div className="section-heading">
          <span className="kicker">
            <i />
            01 / LA EXPERIENCIA DEALERPASS
          </span>
          <div>
            <h2>
              Una compra empieza
              <br />
              mucho antes de pujar.
            </h2>
            <p>
              El precio es solo una parte. Aprende a mirar el historial, los
              costos y la salida de cada vehículo con una metodología que
              conecta el proceso completo.
            </p>
          </div>
        </div>
      </Reveal>
      <div className="experience-grid">
        {[
          {
            n: "01",
            t: "Comprende",
            p: "Conoce cómo funcionan las plataformas, los títulos y las responsabilidades de una compra.",
            link: "Conocer la formación",
            href: "/academy",
          },
          {
            n: "02",
            t: "Evalúa",
            p: "Ordena las variables de cada oportunidad: mercado, reparación, gastos y oferta máxima.",
            link: "Explorar el método",
            href: "/metodo-margen",
          },
          {
            n: "03",
            t: "Decide",
            p: "Define tu siguiente paso según tu experiencia, tus objetivos y el acompañamiento que buscas.",
            link: "Encontrar mi plan",
            href: "/planes",
          },
        ].map((s, i) => (
          <Reveal delay={i * 0.06} key={s.n}>
            <article className="experience-item">
              <span className="index">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
              <Link className="text-link" href={s.href}>
                {s.link}
                <span aria-hidden>↗</span>
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
export function AcademyPreview() {
  return (
    <section className="academy-feature">
      <div className="wrap academy-feature-grid">
        <Reveal>
          <div
            className="academy-art academy-editorial"
            aria-label="Un mentor y dos estudiantes aprenden a evaluar un vehículo"
          >
            <div className="art-top">
              DEALERPASS / ACADEMY <span>01—12</span>
            </div>
            <Image
              src="/brand/editorial-academy.webp"
              alt="Mentor y estudiantes analizando un carro en una subasta"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <div className="art-bottom">
              <span>APRENDE. ANALIZA. AVANZA.</span>
              <span className="orange-square" />
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="academy-feature-copy">
            <span className="kicker">
              <i />
              DEALERPASS ACADEMY
            </span>
            <h2>
              Tu criterio.
              <br />
              Tu mejor herramienta.
            </h2>
            <p>
              Una ruta de formación en español para entender cada etapa: desde
              leer un lote hasta calcular una compra y preparar su
              comercialización.
            </p>
            <ul className="editorial-list">
              <li>
                <span>01</span>Fundamentos de las subastas
              </li>
              <li>
                <span>02</span>Análisis de vehículos y costos
              </li>
              <li>
                <span>03</span>Compra, preparación y comercialización
              </li>
            </ul>
            <Link href="/academy" className="button">
              Descubrir la formación <span aria-hidden>↗</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
export function InventoryPreview() {
  return (
    <section className="section wrap inventory-intro">
      <Reveal>
        <div>
          <span className="kicker">
            <i />
            VEHÍCULOS DEALERPASS
          </span>
          <h2>
            La información correcta.
            <br />
            La decisión es tuya.
          </h2>
        </div>
      </Reveal>
      <Reveal>
        <p>
          Un espacio para consultar los vehículos que publiquemos, conocer sus
          detalles y hablar directamente con nuestro equipo.
        </p>
        <Link href="/vehiculos" className="text-link">
          Explorar vehículos <span aria-hidden>↗</span>
        </Link>
      </Reveal>
    </section>
  );
}
export function PrivateCTA() {
  return (
    <section className="private-section">
      <div className="wrap private-grid">
        <div>
          <span className="kicker">
            <i />
            DEALERPASS ELITE
          </span>
          <h2>
            El siguiente paso
            <br />
            merece una conversación.
          </h2>
        </div>
        <div>
          <p>
            Un programa con admisión individual. Primero conocemos tu
            experiencia y tus objetivos en una reunión 1 a 1. Después, evaluamos
            juntos si Elite es para ti.
          </p>
          <Link href="/vip" className="button button-light">
            Solicitar entrevista <span aria-hidden>↗</span>
          </Link>
          <span className="private-note">
            Acceso sujeto a evaluación y aprobación.
          </span>
        </div>
      </div>
    </section>
  );
}
export function PageIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro wrap">
      <span className="kicker">
        <i />
        {label}
      </span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
