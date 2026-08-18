import type { Metadata } from "next";
import PricingCards from "@/components/PricingCards";
import ComparisonTable from "@/components/ComparisonTable";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Planes | DealerPass",
  description: "Compara los planes Starter, Academy, Pro y Elite de DealerPass y elige tu ruta hacia la subasta.",
};

export default function PlanesPage() {
  return (
    <>
      <div className="bg-texture-cream pt-16 md:pt-24">
        <div className="container-content">
          <span className="eyebrow-light"><span className="dot" />Planes DealerPass</span>
          <h1 className="mt-4 max-w-2xl text-4xl md:text-5xl">
            Elige la ruta que mejor se adapta a tu experiencia y objetivos.
          </h1>
        </div>
      </div>
      <Reveal><PricingCards /></Reveal>
      <Reveal><ComparisonTable /></Reveal>
      <Reveal><FAQ /></Reveal>
      <FinalCTA />
    </>
  );
}
