import PurchaseCalculator from './PurchaseCalculator';
export default function CalculatorPreview() {
  return <section id="calculadora" className="calculator-section"><div className="wrap"><div className="section-heading"><span className="kicker"><i />DEALERPASS / CALCULADORA</span><div><h2>¿Cuánto puedes pagar<br />por ese carro?</h2><p>Completa 3 pasos para estimar tu puja máxima. Puedes empezar con un ejemplo y luego cambiar los números por los tuyos.</p></div></div><PurchaseCalculator /></div></section>;
}
