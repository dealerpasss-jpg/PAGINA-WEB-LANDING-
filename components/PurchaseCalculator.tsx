"use client";
import { useEffect, useId, useReducer, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { parseCalculatorAmount } from '@/lib/academy/calculator';
import { calculatorDraftReducer, emptyCalculatorDraft, hasCalculatorInput } from '@/lib/academy/calculator-draft';
import { calculatorGuide, calculatorLabels, calculatorSources, costIndexes } from '@/lib/academy/calculator-guide';
import { focusCalculatorHeading } from '@/lib/academy/calculator-focus';
import { calculatorKeypadEdit, type CalculatorKey, type CalculatorSelection } from '@/lib/academy/calculator-keypad';
import { calculatorToolNavigation, type CalculatorView } from '@/lib/academy/calculator-device';
import ArrowIcon from './ArrowIcon';
import styles from './PurchaseCalculator.module.css';
const money = (cents: number) => new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const questions = ['¿En cuánto lo venderías?', '¿Cuánto suman los gastos?', '¿Cuánto quieres ganar?'];
const detailQuestions = ['¿Cuánto cobran subasta y dealer?', '¿Cuánto cuesta el transporte?', '¿Cuánto cuesta repararlo?', '¿Cuánto pagarías en impuestos?', '¿Cuánto cuestan título y trámites?', '¿Cuánto reservas para imprevistos?'];
const digits = ['7','8','9','4','5','6','1','2','3','0'] as const;

export default function PurchaseCalculator() {
  const id = useId();
  const [draft, dispatch] = useReducer(calculatorDraftReducer, undefined, emptyCalculatorDraft);
  const [step, setStep] = useState(0);
  const [detail, setDetail] = useState(0);
  const [editing, setEditing] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [keyMessage, setKeyMessage] = useState('');
  const [focusRevision, setFocusRevision] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const amountInput = useRef<HTMLInputElement>(null);
  const undoView = useRef<CalculatorView | null>(null);
  const [keypadRevision, setKeypadRevision] = useState(0);
  const mounted = useRef(false);
  const selection = useRef<CalculatorSelection | null>(null);
  useEffect(() => { if (selection.current) amountInput.current?.setSelectionRange(selection.current.start, selection.current.end); }, [keypadRevision]);
  useEffect(() => { if (mounted.current) focusCalculatorHeading(heading.current); else mounted.current = true; }, [step, detail, focusRevision]);
  const guide = calculatorGuide(draft);
  const detailed = step === 1 && draft.costsMode === 'details';
  const fieldIndex = step === 0 ? 0 : step === 2 ? 7 : costIndexes[detail];
  const raw = step === 4 ? draft.bid : step === 1 && !detailed ? draft.totalCosts : draft.values[fieldIndex];
  const parsed = parseCalculatorAmount(raw);
  const currentValid = parsed !== null && (step !== 0 || parsed > 0);
  const invalid = (raw.trim() !== '' || attempted) && !currentValid;
  const question = step === 4 ? '¿Cuánto piensas pujar?' : detailed ? detailQuestions[detail] : questions[step];
  const fieldLabel = step === 4 ? 'Tu posible puja' : step === 1 && !detailed ? 'Total de gastos adicionales' : calculatorLabels[fieldIndex];
  const result = step === 3 ? guide.result : null;
  const bidCents = parseCalculatorAmount(draft.bid);
  const projected = result && bidCents !== null ? result.sale - result.costs - bidCents : null;
  const stepValues = [guide.sale !== null && guide.sale > 0 ? money(guide.sale) : 'Pendiente', guide.costs !== null ? `${money(guide.costs)}${guide.costsComplete ? '' : ' · parcial'}` : 'Pendiente', guide.profit !== null ? money(guide.profit) : 'Pendiente'];

  function move(next: number, edit = false, nextDetail = 0) {
    setStep(next); setDetail(nextDetail); setEditing(edit); setAttempted(false); setKeyMessage(''); selection.current = null; setFocusRevision(value => value + 1);
  }
  function change(value: string) {
    if (step === 4) dispatch({ type: 'bid', value });
    else if (step === 1 && !detailed) dispatch({ type: 'cost-total', value });
    else dispatch({ type: 'field', index: fieldIndex, value });
    setKeyMessage('');
  }
  function press(key: CalculatorKey) {
    const edit = calculatorKeypadEdit(raw, key, selection.current);
    if (!edit.accepted) { setKeyMessage('Hasta 9 cifras y 2 decimales. Puedes borrar o corregir el monto.'); return; }
    change(edit.value); selection.current = { start: edit.caret, end: edit.caret }; setKeypadRevision(value => value + 1);
  }
  function advance(event?: FormEvent) {
    event?.preventDefault();
    if (!currentValid || (step === 1 && !detailed && !draft.costsReviewed)) { setAttempted(true); return; }
    if (detailed && detail < 5) { move(1, editing, detail + 1); return; }
    move(editing || step === 4 ? 3 : step + 1);
  }
  function skip() {
    if (detailed && detail < 5) move(1, editing, detail + 1);
    else move(editing ? 3 : 2);
  }
  function back() {
    if (detailed && detail > 0) move(1, editing, detail - 1);
    else if (editing || step === 4) move(3);
    else move(Math.max(0, step - 1), false, step === 2 && draft.costsMode === 'details' ? 5 : 0);
  }
  function keyboard(event: KeyboardEvent<HTMLFormElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    const target = event.target as HTMLElement;
    if (target.closest('summary')) return;
    if (event.key === 'Enter' && !target.closest('button, a, input[type="checkbox"]')) { event.preventDefault(); advance(); return; }
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    const key = /^\d$/.test(event.key) ? event.key as CalculatorKey : ['.',','].includes(event.key) ? 'decimal' : event.key === 'Backspace' ? 'backspace' : event.key === 'Delete' ? 'clear' : null;
    if (key) { event.preventDefault(); press(key); }
  }
  function tool(type: 'example' | 'clear' | 'undo') {
    if (type === 'undo' && !draft.undo) return;
    const next = calculatorToolNavigation({ step, detail, editing }, undoView.current, type, calculatorDraftReducer(draft, { type }) !== draft, hasCalculatorInput(draft));
    undoView.current = next.undo; dispatch({ type }); move(next.view.step, next.view.editing, next.view.detail);
  }

  return <div className={styles.calculator}>
    <div className={styles.device}>
      <div className={styles.deviceBar}><span className={styles.deviceName}>DealerPass Calc</span><span>USD</span></div>
      {draft.example && <p className={styles.example}>Ejemplo ilustrativo · reemplaza los importes por los tuyos.</p>}
      {step !== 3 ? <form noValidate onSubmit={advance} onKeyDown={keyboard}>
        <div className={styles.screen}>
          <div className={styles.screenMeta}><span>{step === 4 ? 'COMPROBAR UNA OFERTA' : `PREGUNTA ${step + 1} DE 3${detailed ? ` · GASTO ${detail + 1} DE 6` : ''}`}</span><span className={styles.dots} aria-hidden="true">{[0,1,2].map(index => <i key={index} data-active={index === step} />)}</span></div>
          <h3 ref={heading} tabIndex={-1} className={styles.question}>{question}</h3>
          <label htmlFor={`${id}-amount`} className={styles.amountLabel}>{fieldLabel}</label>
          <div className={styles.screenAmount}><span aria-hidden="true">$</span><input ref={amountInput} id={`${id}-amount`} aria-describedby={`${id}-hint${invalid ? ` ${id}-error` : ''}`} aria-invalid={invalid} data-long={raw.length > 8} inputMode="decimal" type="text" autoComplete="off" maxLength={12} placeholder="—" value={raw} onChange={event => { change(event.target.value); selection.current = { start: event.target.selectionStart ?? event.target.value.length, end: event.target.selectionEnd ?? event.target.value.length }; }} onSelect={event => { selection.current = { start: event.currentTarget.selectionStart ?? raw.length, end: event.currentTarget.selectionEnd ?? raw.length }; }} /></div>
          <p id={`${id}-hint`} className={styles.screenHint}>{step === 1 ? 'Gastos adicionales: no incluyas el precio del carro ni tu ganancia.' : step === 4 ? 'Precio de martillo, sin comisiones.' : step === 0 ? 'Usa una venta realista, no el anuncio más alto.' : 'Tu objetivo en dólares. No es una promesa de ganancia.'}</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.controlBar}><button type="button" className={styles.back} disabled={step === 0 && !editing} onClick={back}>← {editing || step === 4 ? 'Resultado' : 'Atrás'}</button><span>Marca el monto</span><button type="button" className={styles.clearKey} aria-label="Borrar monto actual" onClick={() => press('clear')}>C</button></div>
          <div className={styles.keypad} role="group" aria-label="Teclado numérico">{digits.slice(0,9).map(digit => <button type="button" key={digit} onClick={() => press(digit)}>{digit}</button>)}<button type="button" aria-label="Separador decimal" onClick={() => press('decimal')}>.</button><button type="button" onClick={() => press('0')}>0</button><button type="button" aria-label="Borrar último dígito" onClick={() => press('backspace')}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M9 5h11v14H9l-6-7 6-7Z"/><path d="m11 9 6 6m0-6-6 6"/></svg></button></div>
          {invalid && <p className={styles.error} id={`${id}-error`} role="alert">Usa un monto {step === 0 ? 'mayor que 0' : 'de 0 a 999999999'} y hasta 2 decimales. Sin separadores de miles.</p>}
          {keyMessage && <p className={styles.error} role="status">{keyMessage}</p>}
          {step === 1 && !detailed && <label className={styles.confirm}><input type="checkbox" checked={draft.costsReviewed} onChange={event => dispatch({ type: 'cost-reviewed', value: event.target.checked })} /><span>Mi total incluye todos los gastos que aplican.<small>Subasta/dealer · transporte · reparación · impuestos · documentos · reserva.</small></span></label>}
          {attempted && step === 1 && !detailed && !draft.costsReviewed && <p className={styles.error} role="alert">Confirma qué gastos incluye el total, o déjalo pendiente.</p>}
          <button className={styles.next} type="submit">{step === 4 ? 'Evaluar oferta' : editing && (!detailed || detail === 5) ? 'Ver resultado' : step === 2 ? 'Calcular mi límite' : 'Siguiente'}<ArrowIcon /></button>
          {step === 1 && (!currentValid || (!detailed && !draft.costsReviewed)) && <button type="button" className={styles.skip} onClick={skip}>Todavía no lo sé · dejar pendiente</button>}
          {step === 1 && <div className={styles.costMode}><button type="button" aria-pressed={draft.costsMode === 'total'} onClick={() => { dispatch({ type: 'cost-mode', value: 'total' }); move(1, editing); }}>Tengo el total</button><button type="button" aria-pressed={draft.costsMode === 'details'} onClick={() => { dispatch({ type: 'cost-mode', value: 'details' }); move(1, editing); }}>Sumar gasto por gasto</button></div>}
          <details key={`${step}-${detail}`} className={styles.help}><summary>¿De dónde saco este valor?</summary><p>{step === 4 ? 'Usa el precio de martillo que estás considerando. Al evaluar lo sumaremos a tus gastos confirmados.' : step === 1 && !detailed ? 'Suma tus cotizaciones de subasta y dealer, transporte, reparaciones, impuestos, documentos e imprevistos. No incluyas lo que pagarías por el carro ni tu ganancia. Confirma las comisiones para el rango de puja calculado.' : calculatorSources[fieldIndex]}</p><p>Sin separador de miles: 12000. Usa punto o coma para decimales: 12000,50. Un gasto que no conoces queda pendiente; escribe 0 solo si no aplica.</p></details>
        </div>
      </form> : <div className={styles.result} aria-label="Resultado de la calculadora">
        <div className={styles.screen}><div className={styles.screenMeta}><span>{result ? 'CÁLCULO COMPLETO' : 'AÚN FALTAN DATOS'}</span><span>USD</span></div><h3 ref={heading} tabIndex={-1} className={styles.resultTitle}>{result ? 'Tu límite de puja' : 'Completa lo pendiente'}</h3>{result ? <><p className={result.maximum > 0 ? styles.finalAmount : styles.noMargin}>{result.maximum > 0 ? money(result.maximum) : 'Sin margen para pujar'}</p><p className={styles.screenHint}>{result.maximum > 0 ? 'Precio del carro en subasta, antes de comisiones y demás gastos.' : 'Los gastos y tu objetivo consumen la venta estimada.'}</p></> : <p className={styles.pending}>Todavía no hay un precio final. Los importes desconocidos no se cuentan como cero.</p>}</div>
        <div className={styles.receipt}>
          <p className={styles.receiptTitle}>TUS NÚMEROS <span>TOCA PARA EDITAR</span></p>
          {['Venta estimada','Gastos adicionales','Ganancia objetivo'].map((label,index) => <button className={styles.editRow} type="button" key={label} onClick={() => move(index,true)}><span>{label}</span><strong>{stepValues[index]}</strong><ArrowIcon /><span className={styles.srOnly}>{guide.ready[index] ? 'Editar' : 'Completar'}</span></button>)}
          {!guide.costsComplete && draft.costsMode === 'details' && <p className={styles.note}>Pendientes: {guide.missingCosts.map(index => calculatorLabels[index]).join(', ')}.</p>}
          {result && <><div className={styles.investment}><span>Inversión al pujar el máximo, con reserva</span><strong>{result.maximum > 0 ? money(result.maximum + result.costs) : 'No disponible'}</strong></div>{result.maximum <= 0 && <p className={styles.error}>Gastos y objetivo consumen toda la venta{result.maximum < 0 ? ` y la superan en ${money(-result.maximum)}` : ''}.</p>}<details className={styles.help}><summary>Ver cómo se calcula</summary><p>Venta estimada − gastos adicionales − ganancia objetivo = límite de puja.</p><p className={styles.formula}>{money(result.sale)} − {money(result.costs)} − {money(result.profit)} = {money(result.maximum)}</p></details></>}
          {projected !== null && result && <div className={styles.offer}><span>CON TU OFERTA DE {money(bidCents!)}</span><p>Inversión con reserva <strong>{money(bidCents! + result.costs)}</strong></p><p>{projected < 0 ? 'Pérdida estimada' : 'Ganancia estimada'} <strong>{money(projected)}</strong></p><small>{projected < result.profit ? `${money(result.profit - projected)} por debajo de tu objetivo.` : 'Alcanzas tu objetivo con estos supuestos.'}</small></div>}
          {result && <button className={styles.evaluate} type="button" onClick={() => move(4)}>¿Y si pujo otra cantidad?<ArrowIcon /></button>}
          <p className={styles.note}>Estimación, no garantía de ganancia. Confirma las comisiones para la puja calculada, la condición del carro y su precio de venta.</p>
        </div>
      </div>}
      <div className={styles.deviceFoot}><span>DEALERPASS</span><span>CRITERIO ANTES DE PUJAR</span></div>
    </div>
    <div className={styles.tools}><button type="button" onClick={() => tool('example')}>Usar ejemplo</button><button type="button" disabled={!hasCalculatorInput(draft)} onClick={() => tool('clear')}>Borrar todo</button>{draft.undo && <button type="button" onClick={() => tool('undo')}>Deshacer</button>}</div>
    {draft.notice && <p className={styles.notice} role="status">{draft.notice === 'cleared' ? 'Se borraron los valores. Puedes deshacer.' : draft.notice === 'example' ? 'Ejemplo ilustrativo: no son tarifas ni precios recomendados.' : 'Restauramos tus valores anteriores.'}</p>}
    <p className={styles.unsaved}>Puedes volver y editar sin perder tus valores. No se guardan al salir o recargar.</p>
  </div>;
}
