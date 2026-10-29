"use client";
import { useId, useState } from 'react';
import { calculatorExample, calculatorFields, calculatorScenario, parseCalculatorAmount } from '@/lib/academy/calculator';
import styles from './PurchaseCalculator.module.css';
const money = (cents: number) => new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const labels = ['Venta estimada', 'Subasta y dealer', 'Transporte', 'Reparaciones', 'Impuestos', 'Título y otros gastos', 'Imprevistos', 'Ganancia objetivo'];
export default function PurchaseCalculator() {
  const id = useId();
  const [values, setValues] = useState<string[]>(Array(8).fill(''));
  const [bid, setBid] = useState('');
  const [example, setExample] = useState(false);
  const result = calculatorScenario(values);
  const bidCents = parseCalculatorAmount(bid);
  const projected = result && bidCents !== null ? result.sale - result.costs - bidCents : null;
  const missing = values.filter(value => !value.trim()).length;
  const errors = values.map((value, i) => value.trim() !== '' && (parseCalculatorAmount(value) === null || (i === 0 && parseCalculatorAmount(value) === 0)));
  function update(index: number, value: string) { setValues(old => old.map((v, i) => index === i ? value : v)); }
  function field(index: number) {
    const item = calculatorFields[index];
    return <label className={styles.field} key={item.key} htmlFor={`${id}-${item.key}`}><span>{labels[index]}</span><div className={styles.input}><span aria-hidden="true">$</span><input id={`${id}-${item.key}`} type="text" inputMode="decimal" autoComplete="off" maxLength={12} placeholder="0.00" value={values[index]} aria-invalid={errors[index]} aria-describedby={`${id}-format${errors[index] ? ` ${id}-${item.key}-error` : ''}`} onChange={event => update(index, event.target.value)} /></div>{errors[index] && <small className={styles.error} id={`${id}-${item.key}-error`}>{index === 0 && parseCalculatorAmount(values[index]) === 0 ? 'La venta debe ser mayor que cero.' : 'Usa de 0 a 999999999, sin separador de miles y con hasta 2 decimales.'}</small>}</label>;
  }
  return <div className={styles.calculator}>
    <div className={styles.toolbar}><span className={styles.currency}>USD <span>· Dólares estadounidenses</span></span><div><button type="button" onClick={() => { setValues([...calculatorExample]); setBid(''); setExample(true); }}>Usar ejemplo</button><button type="button" onClick={() => { setValues(Array(8).fill('')); setBid(''); setExample(false); }}>Limpiar</button></div></div>
    {example && <p className={styles.example}><span />Ejemplo ilustrativo. Cambia los valores por los de tu carro.</p>}
    <div className={styles.layout}><div className={styles.formArea}>
      <section className={styles.step}><h3><span>01</span> Venta y ganancia</h3><div className={styles.fields}>{[0,7].map(field)}</div></section>
      <section className={styles.step}><h3><span>02</span> Gastos de la operación</h3><div className={styles.fields}>{[1,2,3,4,5,6].map(field)}</div></section>
      <p id={`${id}-format`} className={styles.format}>Escribe 0 si no aplica. Para doce mil: <strong>12000</strong>. Punto o coma solo para decimales.</p>
      <details className={styles.help}><summary>¿Qué incluyo en cada campo?</summary><p>No incluyas el precio de compra en los gastos ni cuentes un gasto dos veces.</p><dl>{calculatorFields.map((item,index) => <div key={item.key}><dt>{labels[index]}</dt><dd>{item.hint}</dd></div>)}</dl></details>
    </div><aside className={styles.result} aria-label="Resultado de la calculadora"><div className={styles.resultMain} aria-live="polite" aria-atomic="true">
      <span className={styles.eyebrow}>03 / TU PUJA MÁXIMA</span><h3 className={result && result.maximum > 0 ? styles.amount : styles.empty}>{result ? result.maximum > 0 ? money(result.maximum) : 'Sin margen para pujar' : 'Por calcular'}</h3>
      <p className={styles.resultCaption}>{result ? result.maximum > 0 ? 'Por el carro, antes de comisiones.' : 'Revisa los gastos y tu objetivo.' : errors.some(Boolean) ? 'Revisa los montos señalados.' : `Completa ${missing} ${missing === 1 ? 'campo' : 'campos'} para ver tu límite.`}</p>
      {result && <><div className={styles.goal}><span>Ganancia objetivo</span><strong>{money(result.profit)}</strong></div>{result.maximum <= 0 && <p className={styles.warning}>Gastos y objetivo consumen toda la venta{result.maximum < 0 ? ` y la superan en ${money(-result.maximum)}` : ''}.</p>}</>}
    </div>
    {result && <details className={styles.breakdown}><summary>Ver desglose del cálculo</summary><dl><div><dt>Venta estimada</dt><dd>{money(result.sale)}</dd></div><div><dt>− Gastos y reserva</dt><dd>{money(result.costs)}</dd></div><div><dt>− Ganancia objetivo</dt><dd>{money(result.profit)}</dd></div><div><dt>= Límite calculado</dt><dd>{money(result.maximum)}</dd></div></dl></details>}
    <details className={styles.bid}><summary>Evaluar una oferta que tengo en mente</summary><label htmlFor={`${id}-bid`}>Tu posible puja <small>Precio de martillo, sin comisiones.</small></label><div className={styles.input}><span aria-hidden="true">$</span><input id={`${id}-bid`} type="text" inputMode="decimal" autoComplete="off" maxLength={12} placeholder="0.00" value={bid} onChange={event => setBid(event.target.value)} aria-invalid={bid.trim() !== '' && bidCents === null} aria-describedby={`${id}-bid-result`} /></div><div id={`${id}-bid-result`} aria-live="polite">{bid.trim() !== '' && bidCents === null ? <p className={styles.warning}>Usa un monto válido, sin separador de miles y con hasta 2 decimales.</p> : projected !== null && result ? <><p>Inversión con reserva: <strong>{money((bidCents ?? 0) + result.costs)}</strong></p><p>{projected < 0 ? 'Pérdida estimada' : 'Ganancia estimada'}: <strong>{money(projected)}</strong></p><p className={projected < result.profit ? styles.warning : undefined}>{projected < result.profit ? `${money(result.profit - projected)} por debajo de tu objetivo.` : 'Alcanzas tu objetivo con estos supuestos.'}</p></> : bid.trim() !== '' ? <p>Completa los campos para evaluar esta oferta.</p> : null}</div></details>
    <p className={styles.disclaimer}>Estimación, no garantía de ganancia. Confirma tarifas, inspecciona el carro y revisa su valor de venta.</p><small className={styles.unsaved}>No se guarda al salir o recargar.</small>
    </aside></div>
  </div>;
}
