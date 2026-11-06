import PurchaseCalculator from './PurchaseCalculator';
import styles from './PurchaseCalculator.module.css';
export default function CalculatorPreview() {
  return <section id="calculadora" className={styles.publicSection}><div className="wrap"><header className={styles.publicHeading}><span>DEALERPASS / CALCULADORA</span><h1>Ponle números. Encuentra tu límite.</h1><p>Marca un monto, pulsa Siguiente. Tu límite de puja aparece al terminar.</p></header><PurchaseCalculator /></div></section>;
}
