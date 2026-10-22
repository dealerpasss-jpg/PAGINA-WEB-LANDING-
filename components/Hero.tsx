import Image from "next/image";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="hero hero-immersive">
      <div className="wrap hero-top">
        <div className="hero-heading">
          <span className="kicker">
            <i />
            EL ACCESO ES SOLO EL PRINCIPIO
          </span>
          <h1>
            Tu próxima oportunidad.
            <br />
            <em>Una nueva perspectiva.</em>
          </h1>
        </div>
        <div className="hero-aside">
          <p>
            Formación, método y cultura automotriz.
            <br />
            Aprende a mirar la subasta con otros ojos.
          </p>
          <Link href="/academy" className="button">
            Explorar DealerPass <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
      <div className="hero-cinema hover-scene">
        <div className="cinema-photo">
          <Image
            src="/brand/editorial-coupe.webp"
            alt="Composición editorial de un coupé plateado en arquitectura contemporánea"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="cinema-shade" />
        <div className="cinema-wordmark" aria-hidden="true">
          DEALERPASS
        </div>
        <span className="cinema-edition">THE NEXT PERSPECTIVE / 001</span>
        <div className="cinema-float cinema-float-left">
          <span className="mini-label">
            <i /> EL MÉTODO
          </span>
          <strong>
            MARGEN<span>↗</span>
          </strong>
          <div className="mini-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <small>Seis variables. Una visión completa.</small>
        </div>
        <Link
          href="/metodo-margen#calculadora"
          className="cinema-float cinema-float-right"
        >
          <span className="mini-label">
            ANTES DE PUJAR <span>↗</span>
          </span>
          <strong>
            Haz los
            <br />
            números.
          </strong>
          <span className="mini-card-link">
            Explorar la calculadora <span>↗</span>
          </span>
        </Link>
        <div className="cinema-bottom">
          <span>
            FORMACIÓN EN ESPAÑOL
            <br />
            SUBASTAS EN ESTADOS UNIDOS
          </span>
          <a href="#experiencia" className="cinema-discover">
            Desliza. Cambia la perspectiva.<span aria-hidden>↓</span>
          </a>
        </div>
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
