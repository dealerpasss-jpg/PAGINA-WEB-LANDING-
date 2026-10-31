"use client";
import PlanComparison from "@/components/PlanComparison";
import ArrowIcon from "@/components/ArrowIcon";

import Link from "next/link";
import { plans } from "@/data/plans";
import { track } from "@/lib/analytics";
export default function PricingCards({ comparison = true }: { comparison?: boolean }) {
  return (
    <section className="wrap pricing-section" id={comparison ? "planes" : "detalle-planes"}>
      {comparison && <PlanComparison />}
      <div className="pricing-grid">
        {plans
          .filter((p) => p.id !== "elite")
          .map((p, i) => (
            <article
              className={`plan-card ${p.id === "academy" ? "plan-featured" : ""}`}
              key={p.id}
            >
              <div className="plan-top">
                <span>
                  0{i + 1} / {p.id.toUpperCase()}
                </span>
                {p.id === "academy" && (
                  <span className="plan-marker" aria-label="Formación" />
                )}
              </div>
              <h2>{p.name.replace("DealerPass ", "")}</h2>
              <p className="plan-description">{p.tagline}</p>
              <div className="plan-price">
                {p.price.replace("USD ", "$")}
                <span>USD · {p.priceSuffix}</span>
              </div>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>
                    {f.replace("[INSERTAR TARIFA]", "(por confirmar)")}
                  </li>
                ))}
              </ul>
              <Link
                className="button"
                href={`/mi-cuenta?plan=${p.id}`}
                onClick={() =>
                  track(
                    p.id === "starter"
                      ? "click_plan_starter"
                      : p.id === "academy"
                        ? "click_plan_academy"
                        : "click_plan_pro",
                    { plan: p.id },
                  )
                }
              >
                Elegir {p.name.replace("DealerPass ", "")}{" "}
                <span aria-hidden>
                  <ArrowIcon />
                </span>
              </Link>
            </article>
          ))}
      </div>
      <p className="pricing-note">
        Precios de referencia en revisión. Los cargos de subasta, impuestos,
        transporte y costos de terceros no están incluidos salvo indicación
        expresa. Los pagos permanecen en preparación.
      </p>
      <div className="elite-plan">
        <div>
          <span className="kicker">
            <i />
            ADMISIÓN INDIVIDUAL
          </span>
          <h2>DealerPass Elite</h2>
          <p>
            Una conversación 1 a 1 para conocer tu experiencia, tus objetivos y
            evaluar si calificas.
          </p>
        </div>
        <div>
          <p className="elite-price">
            $2,999 <span>USD / año · Referencia</span>
          </p>
          <Link className="button button-light" href="/vip">
            Solicitar entrevista <ArrowIcon />
          </Link>
          <small>Sujeto a evaluación y aprobación.</small>
        </div>
      </div>
    </section>
  );
}
