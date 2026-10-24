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
      <MarginMethod />
      <CalculatorPreview />
      <FinalCTA />
    </>
  );
}
