import type { Metadata } from "next";
import MarginMethod from "@/components/MarginMethod";
import CalculatorPreview from "@/components/CalculatorPreview";
import FinalCTA from "@/components/FinalCTA";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Método MARGEN | DealerPass",
  description: "Las seis variables que debes revisar antes de pujar en una subasta de vehículos.",
};

export default function MetodoMargenPage() {
  return (
    <>
      <MarginMethod />
      <Reveal><CalculatorPreview /></Reveal>
      <FinalCTA />
    </>
  );
}
