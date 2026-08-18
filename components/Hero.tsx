"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { track } from "@/lib/analytics";
import { marginMethod } from "@/data/margen";
import CountUp from "@/components/CountUp";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-texture-black">
      <div aria-hidden className="glow-neon absolute -z-10 -left-16 bottom-0 h-56 w-56 rounded-full" />
      <div className="container-content grid gap-6 pt-20 pb-10 md:grid-cols-2 md:items-center md:gap-14 md:pt-28 md:pb-24">
        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="eyebrow">Acceso de dealer + educación en español</span>
          <h1 className="mt-6 text-4xl leading-[1.05] text-cream md:text-5xl">
            Tu <span className="text-neon">pase de entrada</span> a las subastas profesionales de Estados Unidos.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/75 md:text-lg">
            Accede mediante dealers certificados y aprende a analizar, comprar y comercializar vehículos con
            herramientas, formación y acompañamiento profesional.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/planes" className="btn-primary" onClick={() => track("view_pricing", { source: "hero" })}>
              Ver planes
            </Link>
            <Link href="/academy" className="btn-outline" onClick={() => track("click_academy", { source: "hero" })}>
              Conocer la academia
            </Link>
          </div>

          <div className="ticker-wrap mt-8 max-w-md">
            <div className="ticker-track text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {[0, 1].map((rep) => (
                <span key={rep} className="flex items-center gap-6">
                  <span>Copart</span>
                  <span className="text-cream/20">•</span>
                  <span>IAA</span>
                  <span className="text-cream/20">•</span>
                  <span>ADESA</span>
                  <span className="text-cream/20">•</span>
                  <span>Manheim</span>
                  <span className="text-cream/20">•</span>
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-muted">
            La disponibilidad de cada plataforma depende del plan, el estado y las condiciones de acceso aplicables.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto hidden w-full max-w-md md:block"
        >
          {/* Tarjeta principal: dashboard de evaluación */}
          <div className="card relative z-10">
            <div className="flex items-center justify-between">
              <span className="section-label">Evaluación de vehículo</span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-neon/15 px-2.5 py-1 text-xs font-bold text-neon">
                <span className="h-1.5 w-1.5 rounded-sm bg-neon" /> Completada
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-card border border-edge bg-black p-4">
                <p className="text-xs text-muted">Costo total estimado</p>
                <p className="mt-1 font-display text-xl font-extrabold text-cream">
                  <CountUp end={8420} prefix="$" />
                </p>
              </div>
              <div className="rounded-card border border-edge bg-black p-4">
                <p className="text-xs text-muted">Oferta máxima</p>
                <p className="mt-1 font-display text-xl font-extrabold text-neon">
                  <CountUp end={5100} prefix="$" />
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Oferta máxima / Costo total</span>
                <span className="text-neon">61%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-sm bg-edge">
                <div className="h-full w-[61%] rounded-sm bg-neon" />
              </div>
            </div>

            <div className="mt-5">
              <p className="section-label mb-2">Método MARGEN</p>
              <div className="flex gap-1.5">
                {marginMethod.map((m) => (
                  <div
                    key={m.letter}
                    className="flex h-9 flex-1 items-center justify-center rounded-md border border-edge bg-black font-display text-sm font-extrabold text-cream"
                  >
                    {m.letter}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tarjeta flotante: dealer certificado */}
          <div className="card absolute -bottom-6 -left-6 hidden w-52 sm:block">
            <p className="text-xs text-muted">Acceso vía</p>
            <p className="mt-1 font-display text-sm font-extrabold text-cream">Dealer certificado</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-sm bg-edge">
              <div className="h-full w-3/4 rounded-sm bg-neon" />
            </div>
          </div>

          <div aria-hidden className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-neon/10 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
