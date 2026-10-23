"use client";
import ArrowIcon from "@/components/ArrowIcon";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";
import { testimonials } from "@/data/testimonials";
export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      paused ||
      hovered ||
      focused ||
      reduced ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let frame = 0,
      previous = 0,
      visible = false,
      offset = el.scrollLeft;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    };
    const tick = (time: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      const dt = previous ? Math.min(time - previous, 50) : 0;
      previous = time;
      const end = el.scrollWidth - el.clientWidth;
      if (end <= 1) return;
      offset += dt * 0.018;
      el.scrollLeft = Math.min(offset, end);
      if (offset >= end) {
        setPaused(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && visible && !document.hidden) {
        offset = el.scrollLeft;
        frame = requestAnimationFrame(tick);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    const visibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [paused, hovered, focused, reduced]);
  function move(direction: number) {
    setPaused(true);
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
    <section className="testimonials-section" id="testimonios">
      <div className="wrap">
        <Reveal className="testimonials-head">
          <div>
            <span className="kicker">
              <i />
              EN SUS PALABRAS
            </span>
            <h2>El valor de entender.</h2>
            <p className="testimonials-intro">
              Más de 3.000 personas se han formado con nosotros. Estas son
              algunas de sus experiencias.
            </p>
          </div>
          <div className="carousel-controls">
            {!reduced && (
              <button
                className="carousel-pause"
                aria-label={
                  paused
                    ? "Reanudar movimiento de testimonios"
                    : "Pausar movimiento de testimonios"
                }
                aria-pressed={paused}
                onClick={() => {
                  if (paused && ref.current && position === 2)
                    ref.current.scrollLeft = 0;
                  setPaused(!paused);
                }}
              >
                {paused ? "Reanudar" : "Pausar"}
              </button>
            )}
            <button
              aria-label="Testimonios anteriores"
              disabled={position === 0}
              onClick={() => move(-1)}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              aria-label="Testimonios siguientes"
              disabled={position === 2}
              onClick={() => move(1)}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </Reveal>
        <div
          className="testimonial-track"
          ref={ref}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onPointerDown={() => setPaused(true)}
          onWheel={() => setPaused(true)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setFocused(false);
          }}
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
          Desliza para leer más. El movimiento se detiene al tocar o pasar el
          cursor.{" "}
          <span aria-hidden>
            <ArrowIcon direction="right" />
          </span>
        </p>
      </div>
    </section>
  );
}
