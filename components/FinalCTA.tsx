"use client";

import Link from "next/link";
import { getWhatsappUrl, track } from "@/lib/analytics";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-texture-black py-16 md:py-24">
      <div aria-hidden className="glow-neon absolute -z-10 left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full" />
      <div className="container-content text-center">
        <h2 className="mx-auto max-w-2xl text-3xl text-cream md:text-4xl">
          El acceso te permite pujar. El conocimiento te ayuda a comprar bien.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream/70">
          Conoce los planes de DealerPass y elige la ruta que mejor se adapte a tu experiencia, objetivos y frecuencia
          de compra.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/planes" className="btn-primary" onClick={() => track("view_pricing", { source: "final_cta" })}>
            Ver planes
          </Link>
          <a
            href={getWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("click_whatsapp", { source: "final_cta" })}
            className="btn-outline"
          >
            Hablar con un asesor
          </a>
        </div>

        <p className="mx-auto mt-6 max-w-md text-xs text-muted">
          Antes de realizar cualquier pago, revisa los términos, las tarifas, las responsabilidades y las condiciones
          del plan.
        </p>
      </div>
    </section>
  );
}
