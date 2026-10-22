"use client";
import { useEffect, useRef, useState } from "react";
import AuctionArt from "./AuctionArt";
import Link from "next/link";
const chapters = [
  {
    title: "Mira más allá del precio.",
    label: "Comprende",
    copy: "Aprende a leer el lote, su historial y su documentación. Una buena decisión empieza con las preguntas correctas.",
    href: "/academy",
    cta: "Explorar la formación",
    tags: ["Historial", "Título", "Condición"],
  },
  {
    title: "Cada costo cambia la historia.",
    label: "Evalúa",
    copy: "Conecta reparación, transporte, cargos y margen. Construye un escenario completo antes de definir tu oferta.",
    href: "/metodo-margen#calculadora",
    cta: "Probar la calculadora",
    tags: ["Reparación", "Gastos", "Oferta máxima"],
  },
  {
    title: "El siguiente paso es tuyo.",
    label: "Decide",
    copy: "Elige la formación y el acompañamiento que se ajustan a tu experiencia. Avanza con una metodología, desde la primera evaluación.",
    href: "/planes",
    cta: "Encontrar mi plan",
    tags: ["Formación", "Método", "Acompañamiento"],
  },
];
export default function ScrollExperience() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const sections = Array.from(
      el.querySelectorAll<HTMLElement>(".journey-step"),
    );
    let frame = 0;
    const measure = () => {
      frame = 0;
      const center = innerHeight * 0.55;
      const bounds = el.getBoundingClientRect();
      const travel = Math.max(
        0,
        Math.min(
          1,
          (160 - bounds.top) / Math.max(1, bounds.height - innerHeight),
        ),
      );
      el.style.setProperty("--car-travel", `${travel * 135}px`);
      let closest = 0,
        distance = Infinity;
      sections.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - center);
        if (d < distance) {
          distance = d;
          closest = i;
        }
      });
      setActive((prev) => (prev === closest ? prev : closest));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <section id="experiencia" className="journey wrap" ref={root}>
      <div className="journey-visual" data-stage={active}>
        <div className="journey-top">
          <span className="kicker">
            <i />
            EL RECORRIDO DEALERPASS
          </span>
          <span>0{active + 1} / 03</span>
        </div>
        <div className="journey-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="journey-car journey-illustration">
          <AuctionArt compact />
        </div>
        <div className="journey-overlay" aria-hidden="true">
          <span className="journey-chip">
            {chapters[active].label} <i />
          </span>
          <strong>
            {active === 0
              ? "La oportunidad"
              : active === 1
                ? "Los números"
                : "Tu siguiente nivel"}
          </strong>
          <div className="journey-bars">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <small>
            {active === 1
              ? "ANALIZA ANTES DE PUJAR"
              : active === 0
                ? "CADA DETALLE CUENTA"
                : "ACCESO. CRITERIO. CONTROL."}
          </small>
        </div>
        <div className="journey-progress" aria-label="Etapas del recorrido">
          {chapters.map((c, i) => (
            <a
              key={c.label}
              href={`#etapa-${i}`}
              aria-current={active === i ? "step" : undefined}
            >
              <span>0{i + 1}</span>
              {c.label}
            </a>
          ))}
        </div>
      </div>
      <div className="journey-copy">
        {chapters.map((c, i) => (
          <article
            className={`journey-step ${active === i ? "is-active" : ""}`}
            id={`etapa-${i}`}
            key={c.label}
          >
            <span className="kicker">
              <i />0{i + 1} / {c.label}
            </span>
            <h2>{c.title}</h2>
            <p>{c.copy}</p>
            <div className="journey-tags">
              {c.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <Link className="text-link" href={c.href}>
              {c.cta}
              <span aria-hidden>↗</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
