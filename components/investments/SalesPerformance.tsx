import Link from 'next/link';
import { periodSales, type RecordedSale } from '@/lib/investments/sales';
import { usd } from '@/lib/investments/money';
import styles from './SalesPerformance.module.css';

function label(date:string, short=false) { return new Intl.DateTimeFormat('es',{timeZone:'UTC',day:'numeric',month:short?'short':'long',...(!short?{year:'numeric'}:{})}).format(new Date(date+'T12:00:00Z')); }
const url=(period:string,date:string)=>`/mi-cuenta?ventas=${period}&fecha=${date}#ventas-periodo`;
export default function SalesPerformance({sales,today,period,anchor}:{sales:RecordedSale[];today:string;period?:string;anchor?:string}) {
  const s=periodSales(sales,period,anchor,today);
  const values=s.days.filter(day=>!day.future).flatMap(day=>[day.revenue,day.profit]);
  const min=Math.min(0,...values), max=Math.max(100,...values), range=max-min;
  const y=(value:number)=>22+(max-value)/range*156;
  const x=(index:number)=>20+index/(s.days.length-1)*600;
  function lines(key:'revenue'|'profit') {
    const paths:string[][]=[[]];
    s.days.forEach((day,index)=>{
      if(day.future||(key==='profit'?day.missingCost:day.missingSale)>0) { if(paths.at(-1)!.length)paths.push([]); }
      else paths.at(-1)!.push(`${x(index)},${y(day[key])}`);
    });
    return paths.filter(path=>path.length).map((path,index)=><polyline key={index} points={path.join(' ')} className={key==='revenue'?styles.revenueLine:styles.profitLine}/>);
  }
  return <section className={styles.panel} id="ventas-periodo" aria-labelledby="sales-title">
    <header className={styles.heading}><div><span>VENTAS Y RESULTADOS · USD</span><h3 id="sales-title">Así van tus cierres.</h3></div><nav className={styles.periods} aria-label="Período de ventas">{[['week','Semana'],['month','Mes']].map(([key,text])=><Link key={key} href={url(key,s.anchor)} aria-current={s.period===key?'page':undefined}>{text}</Link>)}</nav></header>
    <div className={styles.range}>{s.previous?<Link href={url(s.period,s.previous)} aria-label="Período anterior">←</Link>:<span aria-disabled="true">←</span>}<p>{label(s.start,true)} — {label(s.end,true)}<small>{s.start.slice(0,4)===s.end.slice(0,4)?s.start.slice(0,4):`${s.start.slice(0,4)}–${s.end.slice(0,4)}`} · {s.period==='week'?'lunes a domingo':'mes calendario'} · Tampa</small></p>{s.next?<Link href={url(s.period,s.next)} aria-label="Período siguiente">→</Link>:<span aria-label="Estás en el período actual" aria-disabled="true">→</span>}</div>
    <dl className={styles.metrics}><div><dt>{s.missingSale?'Ventas · subtotal conocido':'Ventas registradas'}</dt><dd>{s.count&&s.missingSale===s.count?'Pendiente':usd(s.revenue)}</dd><small>Precio de cierre, no cobros</small></div><div data-negative={s.profit<0}><dt>{s.missingCost?'Resultado parcial':'Ganancia realizada¹'}</dt><dd>{s.count&&s.missingCost===s.count?'Pendiente':usd(s.profit)}</dd><small>{s.missingCost?`${s.missingCost} cierres con costos o venta pendientes`:'Venta − compra − gastos registrados'}</small></div><div><dt>Carros vendidos</dt><dd>{s.count}</dd><small>Con fecha dentro del período</small></div></dl>
    {(s.undated>0||s.future>0)&&<p className={styles.warning}>{s.undated>0&&`${s.undated} ventas sin fecha válida, fuera de los períodos. `}{s.future>0&&`${s.future} fechas futuras excluidas. `}Completa o corrige la fecha real desde la ficha; no se deduce de la fecha de registro.</p>}
    {(s.missingCost>0||s.missingSale>0)&&<p className={styles.warning}>Resultado incompleto: solo suma cierres con precio de venta y compra conocidos. Los puntos incompletos no se dibujan como cero.</p>}
    <figure className={styles.chart}><figcaption><strong>Actividad diaria</strong><span><i className={styles.revenueKey}/>Ventas <i className={styles.profitKey}/>Resultado</span></figcaption>
      {s.count===0?<div className={styles.empty}><strong>Sin ventas registradas en este período.</strong><p>La gráfica aparecerá con tus cierres reales. No incluye carros en venta ni ganancias estimadas.</p></div>:<><div className={styles.axis}><span>{usd(max)}</span></div><svg viewBox="0 0 640 204" role="img" aria-label="Ventas y resultado diario en USD. Misma escala vertical; valores exactos en el detalle por día."><line className={styles.grid} x1="20" x2="620" y1="22" y2="22"/><line className={styles.zero} x1="20" x2="620" y1={y(0)} y2={y(0)}/>{lines('revenue')}{lines('profit')}{s.days.map((day,index)=>!day.future&&day.count>0?<g key={day.date}>{!day.missingSale&&<circle className={styles.revenuePoint} cx={x(index)} cy={y(day.revenue)} r="3.5"/>}{!day.missingCost&&<circle className={styles.profitPoint} cx={x(index)} cy={y(day.profit)} r="3.5"/>}</g>:null)}</svg><div className={styles.axis}><span>{usd(min)}</span></div><div className={styles.axis}><span>{label(s.start,true)}</span><span>{label(s.end,true)}</span></div></>}
    </figure>
    <div className={styles.tools}><Link href={url(s.period,today)}>Volver al período actual</Link><details><summary>Elegir fecha</summary><form action="/mi-cuenta#ventas-periodo" method="get"><input type="hidden" name="ventas" value={s.period}/><label>Una fecha del período<input name="fecha" type="date" max={today} defaultValue={s.anchor} required/></label><button type="submit">Ver período</button></form></details></div>
    {s.count>0&&<details className={styles.daily}><summary>Ver cifras por día</summary><div><table><caption>USD · solo fechas transcurridas; los días sin cierre muestran cero.</caption><thead><tr><th scope="col">Día</th><th scope="col">Carros</th><th scope="col">Ventas</th><th scope="col">Resultado¹</th></tr></thead><tbody>{s.days.filter(day=>!day.future).map(day=><tr key={day.date}><th scope="row">{label(day.date,true)}</th><td>{day.count}</td><td>{day.missingSale?'Pendiente':usd(day.revenue)}</td><td>{day.missingCost?'Pendiente':usd(day.profit)}</td></tr>)}</tbody></table></div></details>}
    <p className={styles.note}>¹ Resultado de carros vendidos según todos sus costos vigentes, aunque se registren en otra fecha. Nuevos gastos o correcciones pueden cambiar meses anteriores. No confirma cobros, saldo de caja ni reparto a socios.</p>
  </section>;
}
