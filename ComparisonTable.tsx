import { comparisonRows, plans } from "@/data/plans";

export default function ComparisonTable() {
  return (
    <section className="border-y border-edge bg-texture-charcoal py-16 md:py-24">
      <div className="container-content">
        <span className="eyebrow">Comparativa</span>
        <h2 className="mt-4 text-3xl text-cream md:text-4xl">Compara los planes en detalle.</h2>

        {/* Tabla en desktop */}
        <div className="mt-10 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-edge">
                <th className="py-3 pr-4 font-medium text-muted">Incluye</th>
                {plans.map((p) => (
                  <th key={p.id} className="px-4 py-3 font-display font-extrabold text-cream">
                    {p.name.replace("DealerPass ", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-edge/60">
                  <td className="py-3 pr-4 font-medium text-cream/85">{row.label}</td>
                  <td className="px-4 py-3 text-cream/70">{row.starter}</td>
                  <td className="px-4 py-3 text-cream/70">{row.academy}</td>
                  <td className="px-4 py-3 text-cream/70">{row.pro}</td>
                  <td className="px-4 py-3 text-cream/70">{row.elite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tarjetas desplegables en móvil */}
        <div className="mt-8 space-y-3 md:hidden">
          {plans.map((p) => (
            <details key={p.id} className="card">
              <summary className="cursor-pointer font-display text-base font-extrabold">
                {p.name.replace("DealerPass ", "")}
              </summary>
              <ul className="mt-4 space-y-2.5">
                {comparisonRows.map((row) => (
                  <li key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{row.label}</span>
                    <span className="text-right font-medium text-cream/85">
                      {row[p.id as "starter" | "academy" | "pro" | "elite"]}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted">
          * La disponibilidad de cada plataforma depende del plan, el estado y las condiciones de acceso de terceros.
        </p>
      </div>
    </section>
  );
}
