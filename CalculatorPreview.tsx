"use client";

import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";

const fields: { key: keyof typeof initial; label: string }[] = [
  { key: "salePrice", label: "Precio estimado de venta" },
  { key: "auctionFees", label: "Fees de la subasta" },
  { key: "taxes", label: "Impuestos" },
  { key: "transport", label: "Transporte" },
  { key: "repair", label: "Reparación" },
  { key: "documentation", label: "Documentación" },
  { key: "contingency", label: "Contingencia" },
  { key: "margin", label: "Margen deseado" },
];

const initial = {
  salePrice: 12000,
  auctionFees: 900,
  taxes: 600,
  transport: 450,
  repair: 1800,
  documentation: 150,
  contingency: 400,
  margin: 1500,
};

export default function CalculatorPreview() {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState(false);

  const maxBid = useMemo(() => {
    const { salePrice, auctionFees, taxes, transport, repair, documentation, contingency, margin } = values;
    return Math.max(0, salePrice - auctionFees - taxes - transport - repair - documentation - contingency - margin);
  }, [values]);

  function handleChange(key: keyof typeof initial, raw: string) {
    if (!touched) track("use_calculator");
    setTouched(true);
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    setValues((v) => ({ ...v, [key]: Number.isFinite(n) ? n : 0 }));
  }

  return (
    <section id="calculadora" className="bg-texture-cream py-16 md:py-24">
      <div className="container-content">
        <div className="max-w-2xl">
          <span className="eyebrow-light"><span className="dot" />DealerPass Bid Calculator</span>
          <h2 className="mt-4 text-3xl md:text-4xl">
            Conoce tu oferta máxima antes de pujar.
          </h2>
          <p className="mt-4 leading-relaxed text-black/70">
            El precio ganador nunca es el costo final. Considera el precio de venta, fees, impuestos, transporte,
            reparación, documentos, contingencia y margen.
          </p>
        </div>

        <div className="mt-10 grid gap-6 rounded-card border border-edge bg-charcoal p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="text-xs font-medium text-muted">{f.label}</span>
                <div className="mt-1 flex items-center rounded-md border border-edge bg-black px-3 focus-within:border-neon">
                  <span className="text-sm text-muted">$</span>
                  <input
                    inputMode="numeric"
                    value={values[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    className="w-full bg-transparent px-2 py-2.5 text-sm text-cream outline-none"
                  />
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-col justify-between rounded-card border border-edge bg-black p-6">
            <div>
              <p className="section-label">Oferta máxima estimada</p>
              <p className="mt-2 font-display text-4xl font-extrabold text-neon">
                ${maxBid.toLocaleString("en-US")}
              </p>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              Los resultados son estimaciones educativas y no garantizan el costo definitivo ni la rentabilidad de una
              operación.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
