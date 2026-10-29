"use client";
import { useId, useState } from 'react';
import { calculatorExample, calculatorFields, calculatorScenario, parseCalculatorAmount } from '@/lib/academy/calculator';
import styles from './PurchaseCalculator.module.css';
const money = (cents: number) => new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
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
    return <label className={styles.field} key={item.key} htmlFor={`${id}-${item.key}`}><span>{item.label}</span><small id={`${id}-${item.key}-hint`}>{item.hint}</small><div className={styles.input}><span aria-hidden="true">USD</span><input id={`${id}-${item.key}`} type="text" inputMode="decimal" autoComplete="off" maxLength={12} placeholder={index === 0 ? 'Ej. 12000' : '0.00'} value={values[index]} aria-invalid={errors[index]} aria-describedby={`${id}-${item.key}-hint${errors[index] ? ` ${id}-${item.key}-error` : ''}`} onChange={event => update(index, event.target.value)} /></div>{errors[index] && <small className={styles.error} id={`${id}-${item.key}-error`}>{index === 0 && parseCalculatorAmount(values[index]) === 0 ? 'La venta estimada debe ser mayor que cero.' : 'Usa un monto de 0 a 999999999, con máximo 2 decimales y sin separador de miles.'}</small>}</label>;
  }
  return <div className={styles.calculator}>
    <div className={styles.toolbar}><p>Todos los valores son en <strong>dólares (USD)</strong>. Escribe 0 si un gasto no aplica. No dejes costos sin revisar. Para doce mil escribe <strong>12000</strong>, sin separador de miles. Usa punto o coma solo para decimales.</p><div><button type="button" onClick={() => { setValues([...calculatorExample]); setBid(''); setExample(true); }}>Cargar ejemplo</button><button type="button" onClick={() => { setValues(Array(8).fill('')); setBid(''); setExample(false); }}>Limpiar</button></div></div>
    {example && <p className={styles.example}>Ejemplo ilustrativo cargado. No corresponde a un carro real ni a tarifas verificadas. Reemplaza los valores por los tuyos.</p>}
    <div className={styles.layout}><div className={styles.steps}>
      <section className={styles.step}><h3><span>1</span> Estima el precio de venta</h3>{field(0)}</section>
      <section className={styles.step}><h3><span>2</span> Suma los gastos de la operación</h3><p>No incluyas aquí el precio de compra del carro ni repitas un gasto en dos campos.</p><div className={styles.fields}>{[1,2,3,4,5,6].map(field)}</div></section>
      <section className={styles.step}><h3><span>3</span> Define tu ganancia objetivo</h3>{field(7)}</section>
    </div><aside className={styles.result} aria-label="Resultado de la calculadora"><div aria-live="polite" aria-atomic="true">
      <span className={styles.eyebrow}>TU LÍMITE DE COMPRA</span><h3>{result ? result.maximum > 0 ? money(result.maximum) : 'No conviene pujar con estos números' : 'Completa tu escenario'}</h3>
      {!result && <p>{errors.some(Boolean) ? 'Revisa los montos señalados para calcular.' : `Faltan ${missing} ${missing === 1 ? 'campo' : 'campos'}. Los espacios en blanco no se toman como cero.`}</p>}
      {result && <><p>Es el máximo estimado que puedes pagar <strong>por el carro en la subasta</strong> para mantener tu ganancia objetivo. Las comisiones van aparte.</p><dl className={styles.breakdown}><div><dt>Venta estimada</dt><dd>{money(result.sale)}</dd></div><div><dt>− Gastos y reserva</dt><dd>{money(result.costs)}</dd></div><div><dt>− Ganancia objetivo</dt><dd>{money(result.profit)}</dd></div><div><dt>= Límite calculado</dt><dd>{money(result.maximum)}</dd></div></dl>{result.maximum <= 0 && <p className={styles.warning}>Los gastos y tu objetivo consumen todo el precio de venta{result.maximum < 0 ? ` y lo superan en ${money(-result.maximum)}` : ''}. Revisa el escenario antes de ofertar.</p>}</>}
    </div>
    <div className={styles.bid}><label htmlFor={`${id}-bid`}>¿Tienes una puja en mente? <small>Opcional · precio de martillo, sin comisiones.</small></label><div className={styles.input}><span aria-hidden="true">USD</span><input id={`${id}-bid`} type="text" inputMode="decimal" autoComplete="off" maxLength={12} placeholder="Tu posible oferta" value={bid} onChange={event => setBid(event.target.value)} aria-invalid={bid.trim() !== '' && bidCents === null} aria-describedby={`${id}-bid-result`} /></div><div id={`${id}-bid-result`} aria-live="polite">{bid.trim() !== '' && bidCents === null ? <p className={styles.warning}>Usa un monto válido, sin separador de miles y con hasta 2 decimales.</p> : projected !== null && result ? <><p>Inversión estimada, incluida la reserva: <strong>{money((bidCents ?? 0) + result.costs)}</strong></p><p>{projected < 0 ? 'Pérdida estimada' : 'Ganancia estimada'}: <strong>{money(projected)}</strong></p><p className={projected < result.profit ? styles.warning : undefined}>{projected < result.profit ? `Quedarías ${money(result.profit - projected)} por debajo de tu objetivo.` : 'Con estos supuestos alcanzas tu objetivo.'}</p></> : bid.trim() !== '' ? <p>Completa primero los 3 pasos para evaluar esta oferta.</p> : null}</div></div>
    <p className={styles.disclaimer}>Es una estimación, no una garantía de ganancia. Confirma comisiones e impuestos para tu puja, inspecciona el carro y revisa los precios reales de venta.</p><small className={styles.unsaved}>Este cálculo no se guarda. Si sales o recargas, tendrás que volver a ingresarlo.</small>
    </aside></div>
  </div>;
}
