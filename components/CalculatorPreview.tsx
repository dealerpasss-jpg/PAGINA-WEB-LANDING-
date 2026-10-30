import PurchaseCalculator from './PurchaseCalculator';
import styles from './PurchaseCalculator.module.css';
export default function CalculatorPreview() {
  return <section id="calculadora" className={styles.publicSection}><div className="wrap"><header className={styles.publicHeading}><span>DEALERPASS / CALCULADORA</span><h1>¿Hasta cuánto puedes pujar?</h1><p>Tres preguntas, una decisión más clara. Usa tus valores para encontrar tu límite de compra.</p></header><PurchaseCalculator /></div></section>;
}
