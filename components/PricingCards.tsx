"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { plans } from "@/data/plans";
import { track } from "@/lib/analytics";

const eventByPlan: Record<string, "click_plan_starter" | "click_plan_academy" | "click_plan_pro" | "click_plan_elite"> = {
  starter: "click_plan_starter",
  academy: "click_plan_academy",
  pro: "click_plan_pro",
  elite: "click_plan_elite",
};

export default function PricingCards() {
  return (
    <section id="planes" className="bg-texture-cream py-16 md:py-24">
      <div className="container-content">
        <div className="max-w-2xl">
          <span className="eyebrow-light"><span className="dot" />Planes</span>
          <h2 className="mt-4 text-3xl md:text-4xl">Elige tu ruta hacia la subasta.</h2>
          <p className="mt-4 text-sm leading-relaxed text-black/70">
            Precios de referencia iniciales, sujetos a actualización. Los fees de la subasta, impuestos, transporte,
            membresías y costos de terceros no están incluidos, salvo que se indique expresamente.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              className={`card flex flex-col ${plan.badge ? "border-neon" : ""}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
            >
              {plan.badge && (
                <span className="mb-3 inline-flex w-fit items-center rounded-md bg-neon px-3 py-1 text-xs font-bold uppercase text-black">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-display text-lg font-extrabold">{plan.name}</h3>
              <p className="mt-1 text-xs text-muted">{plan.tagline}</p>

              <div className="mt-5">
                <span className="font-display text-3xl font-extrabold text-neon">{plan.price}</span>
                <span className="ml-1 text-sm text-muted">{plan.priceSuffix}</span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-cream/80">
                    <span className="mt-1 h-1.5 w-1.5 flex-none rounded-sm bg-neon" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.id === "elite" ? "/vip" : `/mi-cuenta?plan=${plan.id}`}
                onClick={() => track(eventByPlan[plan.id], { plan: plan.id })}
                className="btn-primary mt-6 w-full"
              >
                {plan.id === "elite" ? "Solicitar reunión 1 a 1" : plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-xs text-black/60">
          No se procesan pagos definitivos hasta confirmar precios, términos y enlaces con el equipo de DealerPass.
        </p>
      </div>
    </section>
  );
}
