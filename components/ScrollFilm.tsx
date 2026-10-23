"use client";
import ArrowIcon from "@/components/ArrowIcon";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { testimonials } from "@/data/testimonials";
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const t = clamp(v);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export default function ScrollFilm() {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let progress = 0;
    let previousTime = 0;
    let initialized = false;
    const draw = (time: number) => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const target = media.matches
        ? 0
        : clamp(-rect.top / Math.max(1, rect.height - innerHeight));
      const dt = Math.min(48, previousTime ? time - previousTime : 16.67);
      previousTime = time;
      if (!initialized || media.matches) {
        progress = target;
        initialized = true;
      } else {
        progress += (target - progress) * (1 - Math.exp(-dt / 190));
      }
      if (Math.abs(target - progress) < 0.0001) progress = target;
      const p = progress;
      const close = smooth((p - 0.06) / 0.28),
        leave = smooth((p - 0.29) / 0.34),
        drive = smooth((p - 0.48) / 0.52);
      const firstBlend = smooth(close / 0.5);
      const lastBlend = smooth((close - 0.5) / 0.5);
      el.style.setProperty("--film-open-opacity", String(1 - firstBlend));
      el.style.setProperty(
        "--film-half-opacity",
        String(firstBlend * (1 - lastBlend)),
      );
      el.style.setProperty("--film-closed-opacity", String(lastBlend));
      el.style.setProperty("--film-close", String(close));
      el.style.setProperty("--film-leave", String(leave));
      el.style.setProperty("--film-drive", String(drive));
      el.style.setProperty("--film-progress", String(p));
      el.style.setProperty("--film-copy-fade", String(smooth((p - 0.43) / 0.13)));
      el.style.setProperty("--film-arrival-fade", String(smooth((p - 0.59) / 0.15)));
      el.style.setProperty(
        "--film-hand-x",
        `${Math.pow(leave, 1.35) * 82 - close * 1.5}%`,
      );
      el.style.setProperty(
        "--film-hand-y",
        `${leave * leave * 55 + Math.sin(close * Math.PI) * -1.5}%`,
      );
      el.style.setProperty("--film-hand-angle", `${leave * 19 - close * 3}deg`);
      el.style.setProperty(
        "--film-car-x",
        `${2 + (1 - drive) * 28 - Math.sin(drive * Math.PI) * 4}%`,
      );
      el.style.setProperty("--film-car-y", `${-4 + (1 - drive) * -15}%`);
      el.style.setProperty("--film-car-angle", `${-3 * (1 - drive)}deg`);
      el.style.setProperty("--film-car-scale", String(0.26 + drive * 0.52));
      el.style.setProperty(
        "--film-car-opacity",
        String(smooth((p - 0.49) / 0.14)),
      );
      setChapter((prev) => {
        const next = p < 0.27 ? 0 : p < 0.56 ? 1 : 2;
        return prev === next ? prev : next;
      });
      if (progress !== target) frame = requestAnimationFrame(draw);
      else previousTime = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    draw(performance.now());
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <section
      ref={root}
      className="film-track"
      aria-label="De la llave al camino: una historia controlada por el desplazamiento"
    >
      <div className="film-stage" data-chapter={chapter}>
        <div className="film-canvas" aria-hidden="true">
          <Image
            className="film-road"
            src="/brand/film-road.webp"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="film-car">
            <Image src="/brand/film-car.webp" alt="" fill priority sizes="100vw" />
          </div>
          <div className="film-hand">
            <Image
              className="film-hand-open"
              src="/brand/film-open.webp"
              alt=""
              fill
              priority
              sizes="100vw"
            />
            <Image
              className="film-hand-half"
              src="/brand/film-half.webp"
              priority
              alt=""
              fill
              sizes="100vw"
            />
            <Image
              className="film-hand-closed"
              src="/brand/film-closed.webp"
              priority
              alt=""
              fill
              sizes="100vw"
            />
          </div>
        </div>
        <div className="film-readability" />
        <div className="film-copy">
          <span className="kicker">
            <i />
            DEALERPASS / TU SIGUIENTE PASO
          </span>
          <h1>
            El conocimiento
            <br />
            te da las llaves.
          </h1>
          <p>
            Aprende a comprar en subastas de Estados Unidos. Evalúa cada
            oportunidad y toma el control de tu próxima decisión.
          </p>
          <div className="film-actions">
            <Link className="button" href="/academy">
              Conocer la formación{" "}
              <span aria-hidden>
                <ArrowIcon />
              </span>
            </Link>
            <Link className="text-link" href="/planes">
              Ver planes{" "}
              <span aria-hidden>
                <ArrowIcon />
              </span>
            </Link>
          </div>
          <a className="film-trust" href="#testimonios">
            <span className="hero-avatars" aria-hidden="true">
              {testimonials.slice(0, 4).map((t) => (
                <Image
                  key={t.name}
                  src={t.avatarUrl!}
                  alt=""
                  width={36}
                  height={36}
                />
              ))}
            </span>
            <span>
              <strong>Más de 3.000 personas</strong>
              <small>se han formado con nosotros.</small>
            </span>
            <span aria-hidden>
              <ArrowIcon />
            </span>
          </a>
        </div>
        <div className="film-arrival">
          <span className="kicker">
            <i />
            DE LA FORMACIÓN A LA DECISIÓN
          </span>
          <h2>
            Tu siguiente paso
            <br />
            empieza aquí.
          </h2>
          <Link className="button" href="/academy">
            Explorar la academia{" "}
            <span aria-hidden>
              <ArrowIcon />
            </span>
          </Link>
        </div>
        <div className="film-controls">
          <div className="film-chapters" aria-label="Etapa de la animación">
            <span aria-current={chapter === 0 ? "step" : undefined}>
              01 / Las llaves
            </span>
            <span aria-current={chapter === 1 ? "step" : undefined}>
              02 / La decisión
            </span>
            <span aria-current={chapter === 2 ? "step" : undefined}>
              03 / El camino
            </span>
          </div>
          <a href="#experiencia">
            Saltar animación{" "}
            <span aria-hidden>
              <ArrowIcon direction="down" />
            </span>
          </a>
          <div className="film-progress" aria-hidden="true">
            <span />
          </div>
        </div>
        <span className="film-scroll-hint">
          Desliza para continuar{" "}
          <span aria-hidden>
            <ArrowIcon direction="down" />
          </span>
        </span>
      </div>
    </section>
  );
}
