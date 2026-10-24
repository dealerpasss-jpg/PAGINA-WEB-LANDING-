"use client";
import ArrowIcon from "@/components/ArrowIcon";

import { useState } from "react";
import Link from "next/link";
import { marginMethod } from "@/data/margen";
export default function MarginMethod({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [active, setActive] = useState(0);
  const current = marginMethod[active];
  return (
    <section id="metodo-margen" className="section wrap method-section">
      <div className="section-heading">
        <span className="kicker">
          <i />
          {compact ? "02 / EL MÉTODO" : "MÉTODO MARGEN"}
        </span>
        <div>
          <h2>
            Menos intuición.
            <br />
            Más perspectiva.
          </h2>
          <p>
            Seis variables para evaluar una oportunidad antes de levantar la
            mano. Explora cada una.
          </p>
        </div>
      </div>
      <div className="method-grid">
        <div
          className="method-tabs"
          role="group"
          aria-label="Variables del método MARGEN"
        >
          {marginMethod.map((m, i) => (
            <button
              key={m.letter}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
              className={active === i ? "active" : ""}
            >
              <span>{m.letter}</span>
              <span>{m.word}</span>
              <span aria-hidden>
                <ArrowIcon />
              </span>
            </button>
          ))}
        </div>
        <div className="method-panel" aria-live="polite">
          <span className="method-ghost" aria-hidden>
            {current.letter}
          </span>
          <span className="kicker">MARGEN / 0{active + 1}</span>
          <div>
            <h3>{current.word}</h3>
            <p>{current.description}</p>
          </div>
          <Link
            href={compact ? "/metodo-margen#calculadora" : "#calculadora"}
            className="text-link"
          >
            Llevarlo a los números{" "}
            <span aria-hidden>
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
