"use client";

import { useState } from "react";
import { faqs } from "@/data/faq";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-texture-cream py-16 md:py-24">
      <div className="container-content">
        <span className="eyebrow-light"><span className="dot" />Preguntas frecuentes</span>
        <h2 className="mt-4 max-w-xl text-3xl md:text-4xl">Resolvemos tus dudas.</h2>

        <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {faqs.map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-medium">{item.q}</span>
                <span className={`flex-none font-display text-xl font-extrabold text-black transition-transform ${open === i ? "rotate-45 text-neon" : ""}`}>
                  +
                </span>
              </button>
              {open === i && <p className="pb-5 text-sm leading-relaxed text-black/70">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
