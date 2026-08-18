export default function Testimonials() {
  return (
    <section className="border-y border-edge bg-texture-charcoal py-16 md:py-24">
      <div className="container-content">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow">Testimonios</span>
          <span className="rounded-md bg-black px-3 py-1 text-xs font-semibold text-muted">Próximamente</span>
        </div>
        <h2 className="mt-4 max-w-xl text-3xl text-cream md:text-4xl">
          Esta sección se activará con testimonios verificados.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card card-dashed text-sm text-muted">
              <p>[INSERTAR TESTIMONIO VERIFICADO]</p>
              <p className="mt-4 font-medium text-cream/40">[INSERTAR NOMBRE Y AUTORIZACIÓN]</p>
              <p className="mt-1 text-xs">[INSERTAR RESULTADO CON CONTEXTO]</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
