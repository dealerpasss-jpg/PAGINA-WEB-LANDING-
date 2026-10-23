import ArrowIcon from "@/components/ArrowIcon";
import type { Metadata } from "next";
import { PageIntro, PrivateCTA } from "@/components/BrandSections";
import AcademySection from "@/components/AcademySection";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Academia | DealerPass",
  description:
    "Una ruta de formación en español para comprender las subastas de vehículos.",
};
export default function AcademyPage() {
  return (
    <>
      <PageIntro
        label="DEALERPASS ACADEMY"
        title="Aprender cambia tu forma de comprar."
        description="Conecta cada etapa del negocio automotriz. Del primer análisis a una decisión con números, contexto y criterio."
      />
      <div className="wrap academy-banner">
        <span>ACCESO. CRITERIO. CONTROL.</span>
        <p>
          Tu mejor inversión empieza
          <br />
          por lo que sabes.
        </p>
        <Link className="button button-light" href="/planes">
          Ver planes de formación <ArrowIcon />
        </Link>
      </div>
      <AcademySection />
      <PrivateCTA />
    </>
  );
}
