import PurchaseCalculator from './PurchaseCalculator';
import styles from './PurchaseCalculator.module.css';
export default function CalculatorPreview() {
  return <section id="calculadora" className={styles.publicSection}><div className="wrap"><header className={styles.publicHeading}><span>DEALERPASS / CALCULADORA</span><h1>Calcula tu próxima compra.</h1><p>Define tus costos. Encuentra tu límite de puja.</p></header><PurchaseCalculator /></div></section>;
}
