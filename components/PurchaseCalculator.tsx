"use client";
import { useEffect, useId, useReducer, useRef, useState, type FormEvent } from 'react';
import { calculatorFields, parseCalculatorAmount } from '@/lib/academy/calculator';
import { calculatorDraftReducer, emptyCalculatorDraft, hasCalculatorInput } from '@/lib/academy/calculator-draft';
import { calculatorGuide, calculatorLabels, calculatorSources, costIndexes } from '@/lib/academy/calculator-guide';
import ArrowIcon from './ArrowIcon';
import styles from './PurchaseCalculator.module.css';
const money = (cents: number) => new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const steps = ['Venta', 'Gastos', 'Objetivo'];
const questions = ['¿En cuánto podrías vender el carro?', '¿Cuánto gastarías además de la compra?', '¿Cuánto quieres que te quede?'];
const formatHelp = 'Sin separador de miles: 12000. Punto o coma solo para decimales, por ejemplo 12000,50.';

function AmountField({ id, label, value, hint, invalid, onChange, large = false }: { id: string; label: string; value: string; hint?: string; invalid: boolean; onChange: (value: string) => void; large?: boolean }) {
  return <div className={`${styles.field} ${large ? styles.largeField : ''}`}>
    <label htmlFor={id}>{label}</label>
    <div className={styles.input}><span aria-hidden="true">$</span><input id={id} type="text" inputMode="decimal" autoComplete="off" maxLength={12} placeholder="Escribe un monto" value={value} aria-invalid={invalid} aria-describedby={`${id}-help${invalid ? ` ${id}-error` : ''}`} onChange={event => onChange(event.target.value)} /></div>
    <small id={`${id}-help`}>{hint || formatHelp}</small>
    {invalid && <small className={styles.error} id={`${id}-error`}>Ingresa un monto válido de 0 a 999999999, con hasta 2 decimales.{label === 'Venta estimada' ? ' La venta debe ser mayor que cero.' : ''}</small>}
  </div>;
}

export default function PurchaseCalculator() {
  const id = useId();
  const [draft, dispatch] = useReducer(calculatorDraftReducer, undefined, emptyCalculatorDraft);
  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [editing, setEditing] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const [focusRevision, setFocusRevision] = useState(0);
  const mounted = useRef(false);
  useEffect(() => { if (mounted.current) (step === 3 ? resultHeading.current : heading.current)?.focus(); else mounted.current = true; }, [step, focusRevision]);
  const guide = calculatorGuide(draft);
  const { values, bid, example } = draft;
  const { result, ready } = guide;
  const bidCents = parseCalculatorAmount(bid);
  const projected = result && bidCents !== null ? result.sale - result.costs - bidCents : null;
  const invalid = (value: string, positive = false) => (value.trim() !== '' || attempted) && (parseCalculatorAmount(value) === null || (positive && parseCalculatorAmount(value) === 0));
  function move(next: number, edit = false) { setAttempted(false); setEditing(edit); setStep(next); setFocusRevision(value => value + 1); }
  function edit(index: number) { move(index, step === 3 || editing); }
  function advance(event: FormEvent) {
    event.preventDefault();
    if (!ready[step]) { setAttempted(true); return; }
    move(editing ? 3 : step + 1);
  }
  function tool(type: 'example' | 'clear' | 'undo') {
    dispatch({ type });
    move(type === 'clear' ? 0 : 3);
  }
  const stepValues = [guide.sale !== null && guide.sale > 0 ? money(guide.sale) : 'Pendiente', guide.costs !== null ? `${money(guide.costs)}${guide.costsComplete ? '' : ' · parcial'}` : 'Pendiente', guide.profit !== null ? money(guide.profit) : 'Pendiente'];
  return <div className={styles.calculator}>
    <div className={styles.toolbar}><span className={styles.currency}>USD <span>· Dólares estadounidenses</span></span><div><button data-dp-button="secondary" data-dp-size="compact" type="button" onClick={() => tool('example')}>Usar ejemplo</button><button data-dp-button="secondary" data-dp-size="compact" type="button" disabled={!hasCalculatorInput(draft)} onClick={() => tool('clear')}>Limpiar</button></div></div>
    {draft.notice && <div className={styles.draftNotice}><p role="status">{draft.notice === 'cleared' ? 'Se limpiaron los valores.' : draft.notice === 'example' ? 'Se cargó un ejemplo ilustrativo.' : 'Restauramos tus valores anteriores.'}</p>{draft.undo && <button data-dp-button="secondary" data-dp-size="compact" type="button" onClick={() => tool('undo')}>Deshacer</button>}</div>}
    {example && <p className={styles.example}><span />Ejemplo ilustrativo. No son tarifas ni precios recomendados; reemplázalos por tus valores.</p>}
    <div className={styles.layout} data-review={step === 3}><div className={styles.formArea}>
      <nav className={styles.progress} aria-label="Pasos del cálculo">{steps.map((label, index) => <button key={label} type="button" aria-current={step === index ? 'step' : undefined} onClick={() => edit(index)}><span>{ready[index] ? '✓' : `0${index + 1}`}</span>{label}</button>)}</nav>
      <p className={styles.stepCount}>{step === 3 ? 'TU RESUMEN' : `PREGUNTA ${step + 1} DE 3`}</p>
      <h3 ref={heading} tabIndex={-1} className={styles.question}>{step === 3 ? result ? 'Un límite claro. Una mejor decisión.' : 'Revisa lo que falta por confirmar.' : questions[step]}</h3>
      {step < 3 ? <form noValidate onSubmit={advance}>
        {step === 0 && <><p className={styles.intro}>Partimos de una venta realista para calcular hacia atrás cuánto podrías pagar.</p><AmountField id={`${id}-sale`} label="Venta estimada" large value={values[0]} invalid={invalid(values[0], true)} onChange={value => dispatch({ type: 'field', index: 0, value })} /><div className={styles.source}><span>¿DÓNDE ENCUENTRO ESTE VALOR?</span><p>{calculatorSources[0]}</p></div></>}
        {step === 1 && <><p className={styles.intro}>Solo gastos adicionales. <strong>No incluyas lo que pagarías por el carro</strong> ni tu ganancia.</p>
          <div className={styles.mode} role="group" aria-label="Cómo ingresar los gastos"><button data-dp-button="chip" aria-pressed={draft.costsMode === 'total'} type="button" onClick={() => { dispatch({ type: 'cost-mode', value: 'total' }); setAttempted(false); }}>Ya tengo el total</button><button data-dp-button="chip" aria-pressed={draft.costsMode === 'details'} type="button" onClick={() => { dispatch({ type: 'cost-mode', value: 'details' }); setAttempted(false); }}>Ayúdame a sumarlos</button></div>
          {draft.costsMode === 'total' ? <><AmountField id={`${id}-total`} label="Total de gastos adicionales" large value={draft.totalCosts} invalid={invalid(draft.totalCosts)} onChange={value => dispatch({ type: 'cost-total', value })} />
            <label className={styles.confirm}><input type="checkbox" checked={draft.costsReviewed} onChange={event => dispatch({ type: 'cost-reviewed', value: event.target.checked })} /><span>Revisé comisiones de subasta y dealer, transporte, reparaciones, impuestos, documentos e imprevistos. Este total incluye lo que aplica a mi operación.</span></label>
            <p className={styles.tip}>Si aún no tienes el total, usa “Ayúdame a sumarlos” con tus cotizaciones. No pongas 0 en un gasto que todavía no conoces.</p></> : <><p className={styles.tip}>Usa tus cotizaciones. Deja pendiente lo que no conoces; escribe 0 solo si no aplica o decides no reservar ese monto.</p><div className={styles.fields}>{costIndexes.map(index => <AmountField key={index} id={`${id}-${calculatorFields[index].key}`} label={calculatorLabels[index]} value={values[index]} hint={calculatorSources[index]} invalid={invalid(values[index])} onChange={value => dispatch({ type: 'field', index, value })} />)}</div><p className={styles.format}>{formatHelp}</p><p className={styles.costSum}>Gastos ingresados <strong>{money(guide.knownCosts)}</strong>{guide.missingCosts.length > 0 && <span>Faltan {guide.missingCosts.length} por confirmar; no están incluidos en esta suma.</span>}</p></>}
        </>}
        {step === 2 && <><p className={styles.intro}>Elige tu ganancia objetivo. La restaremos junto a los gastos para encontrar tu límite de puja.</p><AmountField id={`${id}-profit`} label="Ganancia objetivo" large value={values[7]} invalid={invalid(values[7])} onChange={value => dispatch({ type: 'field', index: 7, value })} /><div className={styles.source}><span>TU OBJETIVO, NO UNA PROMESA</span><p>{calculatorSources[7]} Si no buscas ganancia, escribe 0.</p></div></>}
        {attempted && !ready[step] && <p className={styles.validation} role="alert">{step === 1 ? draft.costsMode === 'total' ? 'Escribe un total válido y confirma qué gastos incluye, o déjalo pendiente.' : 'Revisa los gastos señalados. Si falta una cotización, puedes continuar con ese dato pendiente.' : 'Revisa el monto para continuar.'}</p>}
        <div className={styles.navigation}>{step > 0 || editing ? <button data-dp-button="secondary" type="button" onClick={() => move(editing ? 3 : step - 1)}>{editing ? 'Volver al resumen' : 'Atrás'}</button> : <span />}<button data-dp-button="primary" type="submit">{editing ? 'Actualizar resumen' : step === 2 ? 'Ver mi límite' : 'Continuar'}<ArrowIcon /></button></div>
        {step === 1 && !ready[1] && <button className={styles.skip} type="button" onClick={() => move(editing ? 3 : 2)}>Lo confirmaré después →</button>}
      </form> : <div className={styles.review}>
        <p className={styles.intro}>{result ? 'Este cálculo usa tus importes. Puedes cambiar cualquier valor sin empezar de nuevo.' : 'Puedes seguir editando sin perder nada. Un gasto desconocido no es $0: necesitamos confirmarlo antes de mostrar una puja máxima.'}</p>
        {steps.map((label, index) => <button className={styles.reviewRow} type="button" key={label} onClick={() => edit(index)}><span><small>{['Venta estimada', 'Gastos adicionales', 'Ganancia objetivo'][index]}</small><strong>{stepValues[index]}</strong></span><span>{ready[index] ? 'Editar' : 'Completar'} <ArrowIcon /></span></button>)}
        {!ready[1] && draft.costsMode === 'details' && <p className={styles.tip}>Pendientes: {guide.missingCosts.map(index => calculatorLabels[index]).join(', ')}.</p>}
        <p className={styles.reviewNote}>Las comisiones pueden cambiar con la puja. Confirma la tarifa para el rango calculado antes de comprar.</p>
      </div>}
    </div><aside className={styles.result} aria-label="Resumen y resultado de la calculadora">
      <span className={styles.eyebrow}>HASTA CUÁNTO PODRÍA PUJAR</span><h3 ref={resultHeading} tabIndex={-1} className={result && result.maximum > 0 ? styles.amount : styles.empty}>{result ? result.maximum > 0 ? money(result.maximum) : 'Sin margen para pujar' : 'Tu límite, sin adivinar.'}</h3>
      <p className={styles.resultCaption}>{result ? result.maximum > 0 ? 'Precio del carro en subasta, antes de comisiones y demás gastos.' : 'Los gastos y el objetivo consumen la venta estimada.' : 'Lo calculamos cuando confirmes venta, gastos y objetivo.'}</p>
      <p className={styles.status} role="status">{ready.filter(Boolean).length} de 3 datos listos{!ready[1] ? ' · Gastos pendientes' : ''}</p>
      <dl className={styles.summary}>{['Venta estimada', 'Gastos adicionales', 'Ganancia objetivo'].map((label, index) => <div key={label}><dt>{label}</dt><dd>{stepValues[index]}</dd></div>)}</dl>
      {step === 3 && <button className={styles.editValues} data-dp-button="inverse" data-dp-size="compact" type="button" onClick={() => heading.current?.focus()}>{result ? 'Editar mis valores' : 'Completar datos pendientes'}<ArrowIcon /></button>}
      {result ? <><div className={styles.goal}><span>Inversión al pujar el máximo{result.maximum > 0 ? ', con reserva' : ''}</span><strong>{result.maximum > 0 ? money(result.maximum + result.costs) : 'No disponible'}</strong></div>{result.maximum <= 0 && <p className={styles.warning}>Gastos y objetivo consumen toda la venta{result.maximum < 0 ? ` y la superan en ${money(-result.maximum)}` : ''}.</p>}
        <details className={styles.breakdown}><summary>Ver cómo se calcula</summary><p>Venta estimada − gastos adicionales − ganancia objetivo = límite de puja.</p><dl><div><dt>Venta estimada</dt><dd>{money(result.sale)}</dd></div><div><dt>− Gastos y reserva</dt><dd>{money(result.costs)}</dd></div><div><dt>− Ganancia objetivo</dt><dd>{money(result.profit)}</dd></div><div><dt>= Límite calculado</dt><dd>{money(result.maximum)}</dd></div></dl></details></> : <p className={styles.warning}>Los importes pendientes no se cuentan como cero. Todavía no hay un límite de puja completo.</p>}
      <details className={styles.bid}><summary>¿Ya tienes una oferta en mente?</summary><label htmlFor={`${id}-bid`}>Tu posible puja <small>Precio de martillo, sin comisiones.</small></label><div className={styles.input}><span aria-hidden="true">$</span><input id={`${id}-bid`} type="text" inputMode="decimal" autoComplete="off" maxLength={12} placeholder="Escribe un monto" value={bid} onChange={event => dispatch({ type: 'bid', value: event.target.value })} aria-invalid={bid.trim() !== '' && bidCents === null} aria-describedby={`${id}-bid-result`} /></div><div id={`${id}-bid-result`} aria-live="polite">{bid.trim() !== '' && bidCents === null ? <p className={styles.warning}>Usa un monto válido, sin separador de miles y con hasta 2 decimales.</p> : projected !== null && result ? <><p>Inversión con reserva: <strong>{money((bidCents ?? 0) + result.costs)}</strong></p><p>{projected < 0 ? 'Pérdida estimada' : 'Ganancia estimada'}: <strong>{money(projected)}</strong></p><p className={projected < result.profit ? styles.warning : undefined}>{projected < result.profit ? `${money(result.profit - projected)} por debajo de tu objetivo.` : 'Alcanzas tu objetivo con estos supuestos.'}</p></> : bid.trim() !== '' ? <p>Confirma venta, gastos y objetivo para evaluar esta oferta.</p> : null}</div></details>
      <p className={styles.disclaimer}>Estimación, no garantía de ganancia. Confirma tarifas para tu puja, inspecciona el carro y revisa su valor de venta.</p><small className={styles.unsaved}>Puedes volver y editar aquí sin perder datos. No se guarda al salir o recargar.</small>
    </aside></div>
  </div>;
}
