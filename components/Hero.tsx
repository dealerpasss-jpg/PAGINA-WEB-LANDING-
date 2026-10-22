import ScrollFilm from "./ScrollFilm";
export default function Hero() {
  return (
    <section className="hero hero-film">
      <ScrollFilm />
      <div className="auction-proof wrap">
        <div>
          <span className="proof-symbol" aria-hidden>
            ↗
          </span>
          <p>
            <strong>Aprende desde cero</strong>
            <span>Una ruta de formación en español.</span>
          </p>
        </div>
        <div>
          <span className="proof-symbol" aria-hidden>
            ◎
          </span>
          <p>
            <strong>Analiza antes de pujar</strong>
            <span>Historial, costos y oferta máxima.</span>
          </p>
        </div>
        <a href="#testimonios">
          <span className="proof-number">
            3.000<span>+</span>
          </span>
          <p>
            <strong>Personas formadas</strong>
            <span>
              Conoce sus experiencias <span aria-hidden>↗</span>
            </span>
          </p>
        </a>
      </div>
      <div className="kinetic-band" aria-label="Acceso. Criterio. Control.">
        <div className="kinetic-track" aria-hidden="true">
          ACCESO<span>↗</span>CRITERIO<span>↗</span>CONTROL<span>↗</span>ACCESO
          <span>↗</span>CRITERIO<span>↗</span>CONTROL<span>↗</span>
        </div>
      </div>
    </section>
  );
}
