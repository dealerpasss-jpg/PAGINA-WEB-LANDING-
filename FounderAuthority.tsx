export default function FounderAuthority() {
  return (
    <section className="bg-texture-cream py-16 md:py-24">
      <div className="container-content">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="flex aspect-[4/5] items-center justify-center rounded-card border border-dashed border-black/25 bg-charcoal text-center">
            <p className="max-w-[220px] text-sm font-medium text-muted">[INSERTAR FOTO REAL DEL FUNDADOR]</p>
          </div>

          <div>
            <span className="eyebrow-light"><span className="dot" />Autoridad</span>
            <h2 className="mt-4 text-3xl md:text-4xl">
              Aprende de personas que realmente operan dentro del mercado.
            </h2>
            <p className="mt-4 leading-relaxed text-black/70">
              DealerPass nace de la experiencia de un dealer certificado que conoce el proceso real de búsqueda,
              análisis, puja, documentación y comercialización de vehículos.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "[INSERTAR HISTORIA DEL FUNDADOR]",
                "[INSERTAR LICENCIA VERIFICABLE CON DATOS SENSIBLES OCULTOS]",
                "[INSERTAR FOTOGRAFÍAS REALES EN PATIOS O SUBASTAS]",
                "[INSERTAR VIDEO DE PRESENTACIÓN]",
              ].map((ph) => (
                <div key={ph} className="rounded-card border border-dashed border-black/25 p-4 text-xs text-black/60">
                  {ph}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
