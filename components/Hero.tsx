import Image from "next/image";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-top">
        <div className="hero-heading">
          <span className="kicker">
            <i />
            FORMACIÓN & CULTURA AUTOMOTRIZ
          </span>
          <h1>
            El siguiente nivel
            <br />
            empieza con <em>criterio.</em>
          </h1>
        </div>
        <div className="hero-aside">
          <p>
            Entiende la subasta.
            <br />
            Aprende a evaluar cada oportunidad.
            <br />
            Decide con una visión más clara.
          </p>
          <Link href="/academy" className="button">
            Explorar la academia <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
      <div className="hero-image">
        <Image
          src="/brand/editorial-coupe.webp"
          alt="Composición editorial de un coupé plateado en un espacio arquitectónico"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-image-caption">
          <span>DEALERPASS JOURNAL / 01</span>
          <span>LA DIFERENCIA ESTÁ EN CÓMO DECIDES.</span>
        </div>
        <a
          href="#experiencia"
          className="hero-scroll"
          aria-label="Descubrir DealerPass"
        >
          ↓
        </a>
      </div>
      <div className="wrap hero-foot">
        <span>ACCESO. CRITERIO. CONTROL.</span>
        <span>Formación en español · Subastas en Estados Unidos</span>
      </div>
    </section>
  );
}
