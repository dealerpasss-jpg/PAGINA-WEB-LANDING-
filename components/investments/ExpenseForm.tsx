'use client';
import { useId, useState } from 'react';
import { categories } from '@/lib/investments/money';
import { expensePresets, expenseDetailLimit, type ExpensePreset } from '@/lib/investments/expense-presets';
import InvestmentForm from './InvestmentForm';
import ExpenseIcon from './ExpenseIcon';
import Submit from './Submit';

export default function ExpenseForm({ vehicleId }: { vehicleId: string }) {
  const id = useId();
  const [preset, setPreset] = useState<ExpensePreset | ''>('');
  const [details, setDetails] = useState<Partial<Record<ExpensePreset, string>>>({});
  const [date, setDate] = useState('');
  const selected = preset ? expensePresets[preset] : null;
  return <InvestmentForm className="investment-form investment-expense-form">
    <input type="hidden" name="action" value="expense" />
    <input type="hidden" name="vehicle_id" value={vehicleId} />
    <fieldset className="expense-picker" aria-describedby={id + '-hint'}>
      <legend>01 / ¿En qué gastaste?</legend>
      <p id={id + '-hint'} className="expense-picker-hint">Selecciona una opción. Si no está, elige Otro.</p>
      <div className="expense-options">
        {(Object.entries(expensePresets) as [ExpensePreset, typeof expensePresets[ExpensePreset]][]).map(([key, option]) => <label key={key} className={'expense-option' + (key === 'other' ? ' expense-option-other' : '')}>
          <input type="radio" name="expense_preset" value={key} required checked={preset === key} onChange={() => setPreset(key)} />
          <span className="expense-option-surface"><ExpenseIcon name={key} /><span>{option.label}</span><span className="expense-option-check" aria-hidden="true"><svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 6 3 3 5-6" /></svg></span></span>
        </label>)}
      </div>
    </fieldset>
    {preset && selected && <div className="expense-concept">
      <p className="expense-group-note">Grupo del resumen: <strong>{categories[selected.category]}</strong>. El concepto conserva el tipo de gasto elegido.</p>
      <label>{preset === 'other' ? '¿Cuál fue el gasto?' : 'Detalle de ' + selected.label.toLowerCase() + ' (opcional)'}
        <input name="description" required={preset === 'other'} maxLength={expenseDetailLimit(preset)} value={details[preset] ?? ''} onChange={event => setDetails(previous => ({ ...previous, [preset]: event.target.value }))} placeholder={preset === 'other' ? 'Ej. parqueadero por dos días' : 'Pieza, servicio o proveedor, si quieres precisarlo'} />
      </label>
    </div>}
    <fieldset className="expense-entry">
      <legend>02 / Monto y fecha</legend>
      <div className="expense-entry-grid">
        <label>Monto del gasto · USD<input name="amount_cents" inputMode="decimal" type="number" step="0.01" min="0" max="999999999" required placeholder="0.00" aria-describedby={id + '-amount-hint'} /></label>
        <div className="expense-date"><label>Fecha del gasto<input type="date" name="incurred_on" required value={date} onChange={event => setDate(event.target.value)} /></label><button className="expense-today" type="button" onClick={() => { const now = new Date(); setDate([now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')); }}>Usar hoy</button></div>
      </div>
      <p id={id + '-amount-hint'} className="expense-picker-hint">Solo este gasto, sin repetir el precio de compra. Hasta dos decimales.</p>
    </fieldset>
    <div className="expense-save"><p>Privado para administración. Suma a la inversión al guardarlo.</p><Submit>Guardar gasto</Submit></div>
  </InvestmentForm>;
}
