import type { Metadata } from "next";
import AcademySection from "@/components/AcademySection";
import MarginMethod from "@/components/MarginMethod";
import FinalCTA from "@/components/FinalCTA";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "DealerPass Academy | Educación en español para subastas de vehículos",
  description: "Aprende a analizar, comprar y comercializar vehículos de subastas estadounidenses con DealerPass Academy.",
};

export default function AcademyPage() {
  return (
    <>
      <div className="bg-texture-black pt-16 md:pt-24">
        <div className="container-content">
          <span className="eyebrow">DealerPass Academy</span>
          <h1 className="mt-4 max-w-2xl text-4xl text-cream md:text-5xl">
            Aprende el proceso completo antes de arriesgar tu dinero.
          </h1>
        </div>
      </div>
      <Reveal><AcademySection /></Reveal>
      <Reveal><MarginMethod /></Reveal>
      <FinalCTA />
    </>
  );
}
