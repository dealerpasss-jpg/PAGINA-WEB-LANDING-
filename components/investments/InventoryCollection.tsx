'use client';

import { Fragment, useId, useState, type ReactNode } from 'react';
import { statuses } from '@/lib/investments/money';
import { filterInvestmentView } from '@/lib/investments/view';

export default function InventoryCollection({ items }: { items: { id: string; title: string; status: string; card: ReactNode }[] }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const shown = filterInvestmentView(items, query, status);
  if (!items.length) return null;
  return <section className="workspace-collection" aria-labelledby={`${id}-title`}>
    <div className="workspace-collection-heading"><div><span className="dashboard-eyebrow">TUS VEHÍCULOS</span><h2 id={`${id}-title`}>Cada carro, en su lugar.</h2></div><p role="status" aria-live="polite" aria-atomic="true">{shown.length} de {items.length} vehículos</p></div>
    <div className="workspace-collection-tools"><label htmlFor={`${id}-search`}><span>Buscar un vehículo</span><div><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input id={`${id}-search`} type="search" value={query} maxLength={100} autoComplete="off" placeholder="Marca, modelo o año" onChange={event => setQuery(event.target.value)} /></div></label><div className="workspace-status-filters" role="group" aria-label="Filtrar por estado"><button type="button" aria-pressed={!status} onClick={() => setStatus('')}>Todos <span>{items.length}</span></button>{Object.entries(statuses).map(([key, label]) => <button type="button" key={key} aria-pressed={status === key} onClick={() => setStatus(key)}>{label}<span>{items.filter(item => item.status === key).length}</span></button>)}</div></div>
    {shown.length ? <div className="investment-grid">{shown.map(item => <Fragment key={item.id}>{item.card}</Fragment>)}</div> : <div className="workspace-filter-empty"><h3>No hay vehículos con estos filtros.</h3><p>Prueba otro nombre o cambia el estado para seguir explorando tu inventario.</p><button type="button" onClick={() => { setQuery(''); setStatus(''); }}>Restablecer filtros</button></div>}
    {shown.length > 0 && (query || status) && <button className="workspace-reset-filters" type="button" onClick={() => { setQuery(''); setStatus(''); }}>Ver todo el inventario</button>}
  </section>;
}
