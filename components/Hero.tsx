import Image from "next/image";
import AuctionArt from "./AuctionArt";
import Link from "next/link";
import { testimonials } from "@/data/testimonials";
export default function Hero() {
  return (
    <section className="hero hero-auction">
      <div className="hero-cinema auction-scene hover-scene">
        <AuctionArt />
        <div className="auction-content">
          <span className="kicker">
            <i />
            DEALERPASS / ACADEMIA DE SUBASTAS
          </span>
          <h1>
            Aprende a comprar
            <br />
            en subastas de
            <br />
            <em>Estados Unidos.</em>
          </h1>
          <p>
            Identifica oportunidades, entiende los costos y aprende a decidir
            cuánto pujar. Formación en español, paso a paso.
          </p>
          <div className="auction-actions">
            <Link href="/academy" className="button button-light">
              Conocer la formación <span aria-hidden>↗</span>
            </Link>
            <Link href="/planes" className="auction-secondary">
              Ver planes <span aria-hidden>↗</span>
            </Link>
          </div>
          <a href="#testimonios" className="hero-social">
            <span className="hero-avatars" aria-hidden="true">
              {testimonials.slice(0, 4).map((t) => (
                <Image
                  key={t.name}
                  src={t.avatarUrl!}
                  alt=""
                  width={38}
                  height={38}
                />
              ))}
            </span>
            <span>
              <strong>Más de 3.000 personas</strong>
              <small>se han formado con nosotros.</small>
            </span>
            <span className="social-arrow" aria-hidden>
              ↗
            </span>
          </a>
        </div>
      </div>
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
