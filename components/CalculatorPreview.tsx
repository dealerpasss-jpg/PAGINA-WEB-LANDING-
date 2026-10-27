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
    const {
      salePrice,
      auctionFees,
      taxes,
      transport,
      repair,
      documentation,
      contingency,
      margin,
    } = values;
    return (
      salePrice -
        auctionFees -
        taxes -
        transport -
        repair -
        documentation -
        contingency -
        margin
    );
  }, [values]);

  function handleChange(key: keyof typeof initial, raw: string) {
    if (!touched) track("use_calculator");
    setTouched(true);
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    setValues((v) => ({ ...v, [key]: Number.isFinite(n) ? n : 0 }));
  }

  return (
    <section id="calculadora" className="calculator-section">
      <div className="wrap">
        <div className="section-heading">
          <span className="kicker">
            <i />
            DEALERPASS / BID CALCULATOR
          </span>
          <div>
            <h2>
              Antes de pujar,
              <br />
              pon los números en orden.
            </h2>
            <p>
              Explora un escenario educativo. Cambia los valores para entender
              cómo cada costo influye en tu oferta máxima.
            </p>
          </div>
        </div>
        <div className="calculator-grid">
          <div className="calculator-fields">
            {fields.map((f) => (
              <label key={f.key}>
                <span>{f.label}</span>
                <div>
                  <span>USD</span>
                  <input
                    aria-label={f.label}
                    inputMode="decimal"
                    value={values[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                  />
                </div>
              </label>
            ))}
          </div>
          <div className="calculator-result">
            <span className="kicker">OFERTA MÁXIMA ESTIMADA</span>
            <div aria-live="polite">
              <strong>${maxBid.toLocaleString("en-US")}</strong>
              <span>USD / escenario ilustrativo</span>
              {maxBid <= 0 && <p className="calculator-warning">Este escenario no deja presupuesto para pujar. Revisa los costos y tu objetivo antes de continuar.</p>}
            </div>
            <p>
              El resultado es una estimación educativa. Los costos definitivos y
              la rentabilidad dependen de cada operación.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
