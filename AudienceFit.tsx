const fit = [
  "Quieres aprender antes de pujar",
  "Buscas comprar tu primer vehículo",
  "Quieres comprender el costo completo",
  "Estás dispuesto a trabajar con números y procesos",
  "Entiendes que cada vehículo tiene riesgo",
  "Quieres acceso, herramientas y acompañamiento",
];

const notFit = [
  "Buscas dinero fácil",
  "Esperas ganancias garantizadas",
  "Quieres evadir requisitos legales",
  "Vas a invertir dinero destinado a gastos esenciales",
  "Esperas que otra persona asuma todas tus decisiones",
  "No estás dispuesto a investigar ni seguir un proceso",
];

export default function AudienceFit() {
  return (
    <section className="bg-texture-cream py-16 md:py-24">
      <div className="container-content">
        <span className="eyebrow-light"><span className="dot" />¿Para quién es?</span>
        <h2 className="mt-4 max-w-xl text-3xl md:text-4xl">
          Un criterio claro, antes de que decidas.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="card border-neon">
            <p className="font-display font-extrabold text-neon">Sí es para ti si...</p>
            <ul className="mt-4 space-y-3">
              {fit.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-cream/85">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-sm bg-neon" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <p className="font-display font-extrabold text-muted">No es para ti si...</p>
            <ul className="mt-4 space-y-3">
              {notFit.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-cream/50">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-sm bg-edge" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
