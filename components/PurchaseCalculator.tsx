"use client";
import { useState } from "react";
import { purchaseBudget } from "@/lib/academy/dashboard";
const fields = ["Precio estimado de reventa", "Comisiones de subasta y dealer", "Transporte", "Reparaciones", "Impuestos, título y otros gastos", "Reserva para imprevistos", "Ganancia objetivo"];
export default function PurchaseCalculator() {
  const [values,setValues]=useState<string[]>(Array(7).fill(""));
  const result=values.every(v=>v.trim()!=="") ? purchaseBudget(values.map(Number)) : null;
  const money=(n:number)=>new Intl.NumberFormat("es-US",{style:"currency",currency:"USD"}).format(n);
  return <div className="dashboard-columns"><div className="account-card account-form">{fields.map((f,i)=><label key={f}>{f} · USD<input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={values[i]} onChange={e=>setValues(old=>old.map((v,j)=>i===j?e.target.value:v))} /></label>)}<button type="button" onClick={()=>setValues(Array(7).fill(""))}>Limpiar cálculo</button></div><section className="dashboard-panel dashboard-dark" aria-live="polite"><span className="dashboard-eyebrow">LÍMITE ESTIMADO DE PUJA</span><h2>{result ? money(Math.max(0,result.maximum)) : "Completa los costos"}</h2>{result && <p>Costos adicionales estimados: {money(result.costs)}.</p>}{result && result.maximum<0 && <p>Con estos costos no hay presupuesto de puja para alcanzar tu ganancia objetivo. Revisa el escenario.</p>}<p>Reventa estimada − costos adicionales − ganancia objetivo.</p><p>Los importes los defines tú. Las comisiones e impuestos pueden variar con la puja: verifica las tarifas antes de ofertar. Este cálculo no garantiza rentabilidad.</p><small>El cálculo no se guarda ni se envía.</small></section></div>;
}
