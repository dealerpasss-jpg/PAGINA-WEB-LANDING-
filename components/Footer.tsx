import ArrowIcon from "@/components/ArrowIcon";
import Link from "next/link";
import Logo from "./Logo";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-signature wrap" aria-hidden="true">
        TU SIGUIENTE <span>CAPÍTULO.</span>
        <i>
          <ArrowIcon />
        </i>
      </div>
      <div className="wrap footer-top">
        <div>
          <Link href="/#main-content" aria-label="DealerPass, inicio"><Logo variant="dark" /></Link>
          <p>Acceso. Criterio. Control.</p>
        </div>
        <div>
          <span className="footer-label">Explora</span>
          <Link href="/academy">Academia</Link>
          <Link href="/vehiculos">Vehículos</Link>
          <Link href="/metodo-margen">Método MARGEN</Link>
          <Link href="/planes">Planes</Link>
        </div>
        <div>
          <span className="footer-label">Tu espacio</span>
          <Link href="/mi-cuenta">Mi cuenta</Link>
          <Link href="/aula">Mi formación</Link>
          <Link href="/vip">Programa Elite</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
        <div>
          <span className="footer-label">Información</span>
          <Link href="/legal/terminos">Términos</Link>
          <Link href="/legal/privacidad">Privacidad</Link>
          <Link href="/legal/reembolsos">Reembolsos</Link>
          <Link href="/legal/membresias">Membresías</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <p>© {new Date().getFullYear()} DealerPass.</p>
        <p>
          La formación no garantiza adjudicación, condición ni rentabilidad. El
          acceso a subastas depende del plan y de las condiciones aplicables.
        </p>
        <Link href="#main-content">
          Volver arriba <ArrowIcon direction="up" />
        </Link>
      </div>
    </footer>
  );
}
