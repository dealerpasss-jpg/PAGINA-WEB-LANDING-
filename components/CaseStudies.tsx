const rows = [
  "Vehículo",
  "Precio ganador",
  "Buyer fee",
  "Impuestos",
  "Transporte",
  "Reparación",
  "Documentación",
  "Costo total",
  "Días en inventario",
  "Precio de salida",
  "Resultado",
  "Aprendizaje",
];

export default function CaseStudies() {
  return (
    <section className="border-y border-edge bg-texture-charcoal py-16 md:py-24">
      <div className="container-content">
        <span className="eyebrow">Casos reales</span>
        <h2 className="mt-4 max-w-xl text-3xl text-cream md:text-4xl">
          No mostramos solamente el precio de compra y venta.
        </h2>
        <p className="mt-3 text-cream/70">Mostramos lo que realmente ocurrió en la operación.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card card-dashed">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Caso {n}</p>
              <div className="space-y-1.5">
                {rows.map((r) => (
                  <div key={r} className="flex items-center justify-between text-xs">
                    <span className="text-muted">{r}</span>
                    <span className="font-medium text-cream/40">[CASO REAL PENDIENTE]</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
