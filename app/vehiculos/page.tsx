import ArrowIcon from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/BrandSections";
export const metadata: Metadata = {
  title: "Vehículos | DealerPass",
  description: "Consulta las publicaciones de vehículos de DealerPass.",
};
export default function Vehicles() {
  return (
    <>
      <PageIntro
        label="VEHÍCULOS DEALERPASS"
        title="Conoce cada detalle. Elige con confianza."
        description="Un lugar para explorar nuestro inventario publicado, revisar la información de cada vehículo y contactar al equipo."
      />
      <section className="wrap vehicle-empty">
        <span className="kicker">INVENTARIO PUBLICADO / 00</span>
        <div className="empty-line" />
        <h2>
          Estamos preparando
          <br />
          las próximas publicaciones.
        </h2>
        <p>
          Todavía no hay vehículos publicados en este catálogo. Puedes consultar
          al equipo por disponibilidad.
        </p>
        <Link href="/contacto" className="button">
          Consultar disponibilidad <ArrowIcon />
        </Link>
      </section>
    </>
  );
}
