"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

const modules = [
  "Cómo funciona el negocio",
  "Plataformas y tipos de subastas",
  "Licencias, brokers y responsabilidades",
  "Lectura de lotes",
  "Títulos e historiales",
  "Evaluación de daños",
  "Costos y oferta máxima",
  "Estrategias de puja",
  "Pago, transporte y documentación",
  "Reparación y preparación",
  "Publicación y comercialización",
  "Control de capital, margen e inventario",
];

export default function AcademySection() {
  return (
    <section id="academy" className="border-y border-edge bg-texture-charcoal py-16 md:py-24">
      <div className="container-content grid gap-12 md:grid-cols-2">
        <div>
          <span className="eyebrow">DealerPass Academy</span>
          <h2 className="mt-4 text-3xl text-cream md:text-4xl">
            Aprende el proceso completo antes de arriesgar tu dinero.
          </h2>
          <p className="mt-4 leading-relaxed text-cream/70">
            Nuestra plataforma educativa en español para aprender a analizar, comprar y comercializar vehículos de
            subastas estadounidenses.
          </p>
          <Link
            href="/academy"
            className="btn-primary mt-8 inline-flex"
            onClick={() => track("click_academy", { source: "academy_section" })}
          >
            Conocer DealerPass Academy
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {modules.map((m, i) => (
            <div key={m} className="flex items-start gap-3 rounded-card border border-edge bg-black p-3.5">
              <span className="font-display text-xs font-extrabold text-neon">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm text-cream/85">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
