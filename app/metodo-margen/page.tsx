export const metadata = { title: "Método MARGEN | DealerPass", description: "Organiza costos, reparación y oferta máxima antes de una compra." };
import MarginMethod from "@/components/MarginMethod";
import CalculatorPreview from "@/components/CalculatorPreview";
import FinalCTA from "@/components/FinalCTA";
export default function MetodoMargenPage() {
  return (
    <>
      <CalculatorPreview />
      <MarginMethod />
      <FinalCTA />
    </>
  );
}
