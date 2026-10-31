'use client';
import { useState } from 'react';
import { statuses } from '@/lib/investments/money';
export default function SaleFields({status:initial='purchased',asking,sale,soldOn,today}:{status?:keyof typeof statuses;asking:string;sale:string;soldOn:string|null;today:string}) {
  const [status,setStatus]=useState(initial);
  const sold=status==='sold';
  const closingEnabled=sold||initial==='sold';
  const legacy=initial==='sold'&&!soldOn;
  return <fieldset className="investment-field-group"><legend>03 / Venta y cierre</legend>
    <label>Estado<select name="status" value={status} onChange={event=>setStatus(event.target.value as keyof typeof statuses)}>{Object.entries(statuses).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    <label>Precio de venta de referencia (USD, opcional)<input type="number" inputMode="decimal" name="asking_cents" min="0" max="999999999" step="0.01" defaultValue={asking}/></label>
    <label>Precio real de cierre (USD)<input type="number" inputMode="decimal" name="sale_cents" min="0" max="999999999" step="0.01" defaultValue={sale} disabled={!closingEnabled} required={sold}/></label>
    <label>Fecha real de venta<input type="date" name="sold_on" max={today} defaultValue={soldOn??''} disabled={!closingEnabled} required={sold&&!legacy}/><small>{legacy?'Este cierre no tiene fecha. Puedes completarla cuando la confirmes; mientras tanto no aparece en semanas o meses.':'Usa el día en que cerraste la venta, no la fecha de registro. Hora de referencia: Tampa.'}</small></label>
    <p className="investment-note">Precio y fecha registran el cierre, no el cobro. Para reabrir un carro vendido, cambia el estado y borra explícitamente el precio y la fecha de cierre antes de guardar. No registra un reembolso.</p>
  </fieldset>;
}
