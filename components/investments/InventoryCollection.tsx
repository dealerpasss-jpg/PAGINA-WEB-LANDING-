'use client';

import { useId, useRef, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { statuses, usd } from '@/lib/investments/money';
import { missingFields, type MissingField } from '@/lib/investments/pending';
import { readInvestmentFilters, selectInvestmentView, investmentQuery, updateInvestmentParams, type InvestmentParam } from '@/lib/investments/view';
import { investmentHistorySnapshot, replaceInvestmentHistory, subscribeInvestmentHistory } from '@/lib/investments/history';
import VehicleStatus from './VehicleStatus';
import ArrowIcon from '@/components/ArrowIcon';

export type InventoryItem={id:string;title:string;status:keyof typeof statuses;photo:{src:string;unoptimized:boolean}|null;facts?:{label:string;value:string}[];photoNotice?:string;financial?:{purchase:number|null;expenses:number;cost:number|null;reference:number|null;result:number|null;purchasedOn:string|null;missing:MissingField[]}};
export default function InventoryCollection({ items, admin=false }: { items:InventoryItem[];admin?:boolean }) {
  const id=useId();
  const searchRef=useRef<HTMLInputElement>(null);
  const routerParams=useSearchParams();
  const query=useSyncExternalStore(subscribeInvestmentHistory,investmentHistorySnapshot,()=>routerParams.toString());
  const params=new URLSearchParams(query);
  const filters=readInvestmentFilters(params);
  // Non-admins never receive private financial props and do not expose finance filters.
  const effective=admin?filters:{...filters,pending:'' as const,sort:filters.sort==='title'?'title' as const:'recent' as const};
  const shown=selectInvestmentView(items,effective);
  const context=investmentQuery(params);
  const href=(item:InventoryItem)=>`/mi-cuenta/inversiones/${item.id}${context?`?${context}`:''}`;
  function update(key:InvestmentParam,value:string) {replaceInvestmentHistory(updateInvestmentParams(new URLSearchParams(investmentHistorySnapshot()),key,value));}
  function reset() {const next=new URLSearchParams(investmentHistorySnapshot());['buscar','estado','pendientes','orden'].forEach(key=>next.delete(key));replaceInvestmentHistory(next);searchRef.current?.focus();}
  const filtered=!!effective.query||!!effective.status||!!effective.pending||effective.sort!=='recent';
  if(!items.length)return null;
  return <section className="workspace-collection inventory-browser" id="inventario" aria-labelledby={`${id}-title`}>
    <div className="workspace-collection-heading"><div><span className="dashboard-eyebrow">TUS VEHÍCULOS</span><h2 id={`${id}-title`}>Cada carro, en su lugar.</h2></div><p role="status" aria-live="polite" aria-atomic="true">{shown.length} de {items.length} vehículos</p></div>
    <div className="inventory-display-choice" role="group" aria-label="Vista del inventario">
      <button type="button" aria-pressed={filters.view==='cards'} onClick={()=>update('vista','cards')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>Tarjetas con fotos</button>
      <button type="button" aria-pressed={filters.view==='table'} onClick={()=>update('vista','table')}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M10 4v16"/></svg>Tabla</button>
    </div>
    <div className="inventory-toolbar">
      <label htmlFor={`${id}-search`}><span>Buscar un vehículo</span><input ref={searchRef} id={`${id}-search`} type="search" value={filters.query} maxLength={100} autoComplete="off" placeholder="Marca, modelo o año" onChange={event=>update('buscar',event.target.value)}/></label>
      <label><span>Ordenar por</span><select value={effective.sort} onChange={event=>update('orden',event.target.value)}><option value="recent">Últimos registrados</option><option value="title">Nombre · A a Z</option>{admin&&<><option value="cost-desc">Mayor inversión</option><option value="result-desc">Mayor resultado</option><option value="purchase-oldest">Compra más antigua</option></>}</select></label>
      {admin&&<label><span>Datos por completar</span><select value={filters.pending} onChange={event=>update('pendientes',event.target.value)}><option value="">Todos los registros</option><option value="all">Con datos pendientes</option>{Object.entries(missingFields).map(([key,field])=><option key={key} value={key}>{field.label}</option>)}</select></label>}
    </div>
    <div className="workspace-status-filters" role="group" aria-label="Filtrar por estado"><button type="button" aria-pressed={!filters.status} onClick={()=>update('estado','')}>Todos <span>{items.length}</span></button>{Object.entries(statuses).map(([key,label])=><button type="button" key={key} aria-pressed={filters.status===key} onClick={()=>update('estado',key)}>{label}<span>{items.filter(item=>item.status===key).length}</span></button>)}</div>
    <div className="inventory-view-note"><p>{admin?'Importes en USD · los filtros no cambian los totales generales. Los datos pendientes se ordenan al final.':'Los filtros solo cambian esta lista de vehículos.'}</p>{filtered&&<button data-dp-button="quiet" type="button" onClick={reset}>Restablecer filtros</button>}</div>
    {!shown.length?<div className="workspace-filter-empty"><h3>No hay vehículos con estos filtros.</h3><p>Prueba otro nombre o cambia el estado para seguir explorando tu inventario.</p><button type="button" onClick={reset}>Ver todo el inventario</button></div>:<>
      {filters.view==='table'?<><p className="inventory-table-hint" id={`${id}-scroll`}>En pantallas pequeñas, desliza la tabla para ver todas las columnas.</p><div className="inventory-table-wrap" aria-describedby={`${id}-scroll`} role="region" aria-label="Tabla de inventario" tabIndex={0}><table className="inventory-table"><caption className="sr-only">{admin?'Vehículos e importes registrados. Ganancia estimada en activos; resultado realizado en vendidos. No son cobros.':'Vehículos asignados, ficha técnica y estado. Sin datos de costos.'}</caption><thead><tr><th scope="col">Vehículo</th><th scope="col">Estado</th><th scope="col">Ficha técnica</th>{admin&&<><th scope="col">Inversión</th><th scope="col">Venta¹</th><th scope="col">Resultado¹</th></>}<th scope="col"><span className="sr-only">Acción</span></th></tr></thead><tbody>{shown.map(item=><tr key={item.id}>
        <th scope="row"><Link prefetch={false} href={href(item)}>{item.title}</Link>{admin&&!!item.financial?.missing.length&&<span className="inventory-missing">{item.financial.missing.length} datos pendientes</span>}</th>
        <td><VehicleStatus status={item.status}/></td><td>{item.facts?.length?item.facts.map(f=><small key={f.label}>{f.label}: {f.value}</small>):<small>Por completar</small>}</td>{admin&&<><td>{usd(item.financial?.cost??null)}<small>Gastos: {usd(item.financial?.expenses??null)}</small></td><td>{usd(item.financial?.reference??null)}<small>{item.status==='sold'?'Cierre registrado':'Referencia'}</small></td><td data-negative={item.financial?.result!=null&&item.financial.result<0}>{usd(item.financial?.result??null)}<small>{item.status==='sold'?'Realizado':'Estimado'}</small></td></>}
        <td><Link prefetch={false} className="inventory-open" href={href(item)} aria-label={`Abrir ficha de ${item.title}`}><ArrowIcon direction="right"/></Link></td>
      </tr>)}</tbody></table></div></>:
      <div className="investment-grid inventory-cards">{shown.map(item=><article className="account-card" key={item.id}>
        <Link prefetch={false} className="investment-cover" href={href(item)}>{item.photo?<Image unoptimized={item.photo.unoptimized} src={item.photo.src} alt={item.title} width={800} height={600}/>:<span className="investment-cover-empty">{admin?'Añadir fotos':'Sin fotos disponibles'}</span>}</Link><VehicleStatus status={item.status}/><h2>{item.title}</h2>
        {item.photoNotice&&<p className="inventory-photo-note">{item.photoNotice}</p>}
        {item.facts?.length?<dl className="inventory-technical">{item.facts.map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>:<p className="inventory-photo-note">Ficha técnica por completar. Consulta las fotos y los detalles disponibles.</p>}
        {admin&&item.financial&&<><dl className="investment-finance"><div><dt>Compra</dt><dd>{usd(item.financial.purchase)}</dd></div><div><dt>Arreglos y otros gastos</dt><dd>{usd(item.financial.expenses)}</dd></div><div><dt>Inversión registrada</dt><dd>{usd(item.financial.cost)}</dd></div><div><dt>{item.status==='sold'?'Resultado realizado¹':'Ganancia estimada¹'}</dt><dd>{usd(item.financial.result)}</dd></div></dl>{!!item.financial.missing.length&&<p className="inventory-missing">Por completar: {item.financial.missing.map(key=>missingFields[key].label.toLowerCase()).join(' · ')}.</p>}</>}
        <div className="investment-actions"><Link prefetch={false} href={href(item)}>{admin?'Abrir ficha':'Ver fotos y estado'} <ArrowIcon direction="right"/></Link></div>
      </article>)}</div>}
      {admin&&<p className="investment-note">¹ La referencia de venta no es una venta realizada. Resultado según compra y gastos registrados: estimado en activos, realizado en vendidos. No confirma cobros. Los importes desconocidos siguen pendientes.</p>}
    </>}
  </section>;
}
