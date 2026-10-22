import type { Metadata } from "next";
import PricingCards from "@/components/PricingCards";
import FAQ from "@/components/FAQ";
import { PageIntro } from "@/components/BrandSections";
export const metadata: Metadata = {
  title: "Planes | DealerPass",
  description:
    "Encuentra la formación y el acompañamiento para tu siguiente etapa.",
};
export default function PlanesPage() {
  return (
    <>
      <PageIntro
        label="PLANES DEALERPASS"
        title="Tu punto de partida. Tu siguiente etapa."
        description="Elige el camino que se adapta a tu experiencia. Compara la formación, los recursos y el acompañamiento de cada plan."
      />
      <PricingCards />
      <FAQ />
    </>
  );
}
