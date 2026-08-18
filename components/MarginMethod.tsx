"use client";

import { useEffect, useState } from "react";
import { marginMethod } from "@/data/margen";

export default function MarginMethod() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const current = marginMethod[active];

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % marginMethod.length);
    }, 2600);
    return () => clearInterval(id);
  }, [autoplay]);

  function handleSelect(i: number) {
    setAutoplay(false);
    setActive(i);
  }

  return (
    <section id="metodo-margen" className="relative overflow-hidden bg-texture-black py-16 md:py-24">
      <div aria-hidden className="glow-neon absolute -z-10 -right-20 top-10 h-64 w-64 rounded-full" />
      <div className="container-content">
        <span className="eyebrow">Método MARGEN</span>
        <h2 className="mt-4 max-w-xl text-3xl text-cream md:text-4xl">
          No te enseñamos a &ldquo;ganar subastas&rdquo;. Te enseñamos a evaluar negocios.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/60">
          El Método MARGEN organiza las seis variables que debes revisar antes de pujar.
        </p>

        <div className="mt-12 flex gap-1.5 overflow-x-auto pb-2 sm:gap-2">
          {marginMethod.map((m, i) => (
            <button
              key={m.letter}
              onClick={() => handleSelect(i)}
              aria-pressed={active === i}
              className={`flex h-14 w-14 flex-none items-center justify-center rounded-md border font-display text-xl font-extrabold transition-colors sm:h-16 sm:w-16 ${
                active === i ? "border-neon bg-neon text-black" : "border-edge bg-charcoal text-cream/50 hover:text-cream"
              }`}
            >
              {m.letter}
            </button>
          ))}
        </div>

        <div className="mt-8 max-w-xl rounded-card border border-edge bg-charcoal p-6">
          <p className="section-label">
            {current.letter} — {current.word}
          </p>
          <p className="mt-2 text-lg leading-relaxed text-cream">{current.description}</p>
        </div>

        <p className="mt-10 font-display text-xl font-extrabold text-neon">Compra con números, no con emoción.</p>
      </div>
    </section>
  );
}
