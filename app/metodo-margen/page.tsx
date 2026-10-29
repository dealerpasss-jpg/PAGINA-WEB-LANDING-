export const metadata = { title: "Método MARGEN | DealerPass", description: "Organiza costos, reparación y oferta máxima antes de una compra." };
import { PageIntro } from "@/components/BrandSections";
import MarginMethod from "@/components/MarginMethod";
import CalculatorPreview from "@/components/CalculatorPreview";
import FinalCTA from "@/components/FinalCTA";
export default function MetodoMargenPage() {
  return (
    <>
      <PageIntro
        label="EL MÉTODO DEALERPASS"
        title="Compra con números. Decide con criterio."
        description="MARGEN organiza seis variables para que puedas mirar una oportunidad con perspectiva, antes de comprometer tu capital."
      />
      <CalculatorPreview />
      <MarginMethod />
      <FinalCTA />
    </>
  );
}
