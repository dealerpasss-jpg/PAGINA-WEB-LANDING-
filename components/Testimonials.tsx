"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { testimonials } from "@/data/testimonials";
export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  function move(direction: number) {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("article");
    el.scrollBy({
      left: direction * ((card?.clientWidth || 320) + 24),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  return (
    <section className="testimonials-section">
      <div className="wrap">
        <div className="testimonials-head">
          <div>
            <span className="kicker">
              <i />
              EN SUS PALABRAS
            </span>
            <h2>El valor de entender.</h2>
          </div>
          <div className="carousel-controls">
            <button
              aria-label="Testimonios anteriores"
              disabled={position === 0}
              onClick={() => move(-1)}
            >
              ←
            </button>
            <button
              aria-label="Testimonios siguientes"
              disabled={position === 2}
              onClick={() => move(1)}
            >
              →
            </button>
          </div>
        </div>
        <div
          className="testimonial-track"
          ref={ref}
          tabIndex={0}
          aria-label="Testimonios de la comunidad"
          onScroll={() => {
            const el = ref.current;
            if (el)
              setPosition(
                el.scrollLeft < 2
                  ? 0
                  : el.scrollLeft + el.clientWidth >= el.scrollWidth - 3
                    ? 2
                    : 1,
              );
          }}
        >
          {testimonials.map((t) => (
            <article className="testimonial" key={t.name}>
              <span className="quote-mark" aria-hidden>
                “
              </span>
              <blockquote>{t.quote}</blockquote>
              <div className="testimonial-person">
                {t.avatarUrl && (
                  <Image src={t.avatarUrl} alt="" width={44} height={44} />
                )}
                <div>
                  <strong>{t.name}</strong>
                  <span>Comunidad DealerPass</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="carousel-hint">
          Desliza para conocer más experiencias <span aria-hidden>→</span>
        </p>
      </div>
    </section>
  );
}
