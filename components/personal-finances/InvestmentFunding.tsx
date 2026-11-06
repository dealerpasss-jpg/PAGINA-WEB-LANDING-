'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { saveInvestmentFunding } from '@/app/mi-cuenta/finanzas/capital/actions';
import { fundBalance, fundingTotals, type InvestmentFund, type InvestmentRepayment, type FundingSnapshot } from '@/lib/personal-finances/funding';
import { currencies, methods, money, localDate, type Currency } from '@/lib/personal-finances/model';
import s from './InvestmentFunding.module.css';

type Draft = { action: 'fund-create' | 'fund-update' | 'repayment-create' | 'repayment-void' | 'repayment-restore'; id: string; fundId: string; version: number; person: string; description: string; principal: string; currency: Currency; date: string; notes: string; method: keyof typeof methods; amount: string };
const decimal = (cents: number) => (cents / 100).toFixed(2);
const readableDate = (date: string) => new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));

export default function InvestmentFunding({ funds, repayments, ownerId }: FundingSnapshot & { ownerId: string }) {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>('USD');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, startTransition] = useTransition();
  const lock = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const editor = useRef<HTMLElement | null>(null);
  const feedback = useRef<HTMLDivElement | null>(null);
  const title = useRef<HTMLHeadingElement | null>(null);
  const totals = fundingTotals({ funds, repayments }, currency);
  const visible = funds.filter(fund => {
    const remaining = fundBalance(fund, repayments).remaining;
    return fund.currency === currency && `${fund.person_name} ${fund.description}`.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')) && (status === 'all' || (status === 'pending' ? remaining > BigInt(0) : remaining === BigInt(0)));
  });
  const editingFund = draft?.action === 'fund-create' || draft?.action === 'fund-update';
  const confirmation = draft?.action === 'repayment-void' || draft?.action === 'repayment-restore';
  const draftFund = funds.find(fund => fund.id === draft?.fundId);
  const stale = draft?.action === 'fund-update' && draftFund?.version !== draft.version;

  useEffect(() => { editor.current?.querySelector<HTMLElement>('input:not([type=hidden]), button')?.focus(); }, [draft?.id, draft?.action]); // Draft values intentionally survive refreshed server props.
  useEffect(() => { if (error) feedback.current?.focus(); }, [error]);
  useEffect(() => { if (notice) feedback.current?.focus(); }, [notice]);

  function open(action: Draft['action'], trigger: HTMLElement, fund?: InvestmentFund, repayment?: InvestmentRepayment) {
    if (draft || pending || lock.current) return;
    opener.current = trigger;
    setError(''); setNotice('');
    setDraft({ action, id: repayment?.id ?? (action === 'fund-update' ? fund!.id : crypto.randomUUID()), fundId: fund?.id ?? '', version: repayment?.version ?? fund?.version ?? 1, person: fund?.person_name ?? '', description: fund?.description ?? '', principal: fund ? decimal(fund.principal_cents) : '', currency: fund?.currency ?? currency, date: repayment?.paid_on ?? (action === 'fund-update' ? fund!.received_on : localDate()), notes: repayment?.notes ?? (action === 'fund-update' ? fund!.notes : ''), method: repayment?.payment_method ?? 'transfer', amount: repayment ? decimal(repayment.amount_cents) : '' });
  }
  function close() {
    if (pending || lock.current) return;
    setDraft(null); setError('');
    requestAnimationFrame(() => { if (opener.current?.isConnected) opener.current.focus(); else title.current?.focus(); });
  }
  function change(key: keyof Draft, value: string) { setDraft(current => current ? { ...current, [key]: value } : current); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || lock.current || pending || stale) return;
    const form = new FormData();
    Object.entries({ action: draft.action, owner_id: ownerId, id: draft.id, fund_id: draft.fundId, version: String(draft.version), person_name: draft.person, description: draft.description, principal: draft.principal, currency: draft.currency, received_on: draft.date, paid_on: draft.date, notes: draft.notes, payment_method: draft.method, amount: draft.amount }).forEach(([key, value]) => form.set(key, value));
    lock.current = true; setError(''); setNotice('');
    startTransition(async () => {
      try {
        const result = await saveInvestmentFunding(form);
        if (result.ok) { setDraft(null); setNotice(result.message); router.refresh(); }
        else setError(result.error);
      } catch { setError('No se pudo confirmar el guardado. Conservamos los datos; reintenta sin cerrar este formulario para evitar duplicados.'); }
      finally { lock.current = false; }
    });
  }

  return <div className={s.panel}>
    <nav className={s.nav} aria-label="Secciones de finanzas"><Link href="/mi-cuenta/finanzas">← Mis ingresos y gastos</Link><span>Capital para invertir</span></nav>
    <header className={s.intro}><div><span className={s.eyebrow}>TU CAPITAL, CON CLARIDAD</span><h2 ref={title} tabIndex={-1}>Cada aporte y cada abono, en un lugar.</h2><p>Registra quién te entregó dinero para invertir y cuánto le has devuelto. Este registro es independiente de tus ingresos y gastos: no crea movimientos bancarios ni se vincula automáticamente a vehículos.</p></div><button className={s.primary} disabled={!!draft || pending} onClick={event => open('fund-create', event.currentTarget)}>+ Registrar dinero recibido</button></header>
    <div className={s.currency}><label>Moneda del resumen<select value={currency} onChange={event => setCurrency(event.target.value as Currency)}>{currencies.map(value => <option key={value}>{value}</option>)}</select></label><p>Las monedas se muestran por separado. No calculamos intereses ni rendimientos.</p></div>
    <section className={s.stats} aria-label={`Resumen total en ${currency}`}>
      <article className={s.remaining}><span>Capital por devolver</span><strong>{money(totals.remaining, currency)}</strong><small>Capital recibido menos abonos vigentes</small></article>
      <article><span>Capital recibido</span><strong>{money(totals.received, currency)}</strong><small>Total original registrado en {currency}</small></article>
      <article><span>Capital devuelto</span><strong>{money(totals.returned, currency)}</strong><small>Los abonos anulados no se suman</small></article>
    </section>
    <p className={s.help}>Resumen de todos los registros en {currency}, sin aplicar la búsqueda ni el filtro de estado.</p>
    {(error || notice) && <div ref={feedback} tabIndex={-1} role={error ? 'alert' : 'status'} className={error ? s.error : s.notice}>{error || notice}{error && <p><button type="button" disabled={pending} onClick={() => router.refresh()}>Actualizar datos guardados</button> Tu formulario se conserva.</p>}</div>}
    {draft && <section ref={editor} className={s.editor} aria-labelledby="funding-editor-title" aria-busy={pending}>
      <div className={s.sectionTitle}><h2 id="funding-editor-title">{draft.action === 'fund-create' ? 'Registrar dinero recibido' : draft.action === 'fund-update' ? 'Editar capital recibido' : draft.action === 'repayment-create' ? `Registrar abono a ${draft.person}` : draft.action === 'repayment-void' ? '¿Anular este abono?' : '¿Restaurar este abono?'}</h2></div>
      <form onSubmit={submit}><fieldset disabled={pending}>
        {confirmation ? <div className={s.confirm}><p><strong>{money(Math.round(Number(draft.amount) * 100), draft.currency)}</strong> · {readableDate(draft.date)} · {draft.person}</p><p>{draft.action === 'repayment-void' ? 'El importe volverá al capital por devolver. El abono seguirá visible en el historial como anulado.' : 'El importe se descontará nuevamente del capital por devolver. Solo se puede restaurar si no supera el capital disponible.'}</p></div> : <div className={s.formGrid}>
          {editingFund ? <><label>Persona que entregó el dinero<input required maxLength={120} value={draft.person} onChange={event => change('person', event.target.value)} autoComplete="off" /></label><label>Descripción del aporte<input required maxLength={160} value={draft.description} onChange={event => change('description', event.target.value)} /></label><label>Capital recibido<input required inputMode="decimal" maxLength={20} value={draft.principal} onChange={event => change('principal', event.target.value)} aria-describedby="funding-amount-help" /></label><label>Moneda<select disabled={draft.action === 'fund-update'} value={draft.currency} onChange={event => change('currency', event.target.value)}>{currencies.map(value => <option key={value}>{value}</option>)}</select>{draft.action === 'fund-update' && <small>La moneda original no se puede cambiar.</small>}</label></> : <><p className={s.wide}>Capital por devolver: <strong>{draftFund ? money(fundBalance(draftFund, repayments).remaining, draft.currency) : 'Actualiza los datos'}</strong>. Registrar este abono no realiza una transferencia.</p><label>Importe del abono ({draft.currency})<input required inputMode="decimal" maxLength={20} value={draft.amount} onChange={event => change('amount', event.target.value)} aria-describedby="funding-amount-help" /></label><label>Medio de pago<select value={draft.method} onChange={event => change('method', event.target.value)}>{Object.entries(methods).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label></>}
          <p className={`${s.help} ${s.wide}`} id="funding-amount-help">Sin separadores de miles. Usa coma o punto para hasta dos decimales, por ejemplo: 1500,50.</p>
          <label>{editingFund ? 'Fecha de recepción' : 'Fecha del abono'}<input type="date" required min={editingFund ? '1900-01-01' : draftFund?.received_on ?? '1900-01-01'} max="2100-12-31" value={draft.date} onChange={event => change('date', event.target.value)} /></label>
          <label className={s.wide}>Notas (opcional)<textarea rows={3} maxLength={2000} value={draft.notes} onChange={event => change('notes', event.target.value)} /></label>
        </div>}
        {stale && <p role="alert" className={s.error}>Este registro cambió mientras lo editabas. Conservamos tu borrador. Copia los cambios que necesites, cancela y vuelve a abrir el registro actualizado antes de guardar.</p>}
        <div className={s.actions}><button className={s.primary} type="submit" disabled={pending || stale}>{pending ? 'Guardando…' : draft.action === 'repayment-void' ? 'Sí, anular abono' : draft.action === 'repayment-restore' ? 'Sí, restaurar abono' : 'Guardar registro'}</button><button type="button" onClick={close} disabled={pending}>Cancelar</button></div>
      </fieldset></form>
    </section>}
    <section className={s.history} aria-labelledby="funding-history-title"><div className={s.sectionTitle}><h2 id="funding-history-title">Dinero recibido</h2><span>{visible.length} {visible.length === 1 ? 'registro' : 'registros'}</span></div>
      <div className={s.filters}><label>Buscar persona o descripción<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre o descripción" /></label><label>Estado<select value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos</option><option value="pending">Por devolver</option><option value="completed">Capital devuelto</option></select></label></div>
      {!visible.length ? <div className={s.empty}><span aria-hidden="true">↗</span><h3>{funds.length ? 'No hay registros con estos filtros' : 'Empieza con el dinero que recibiste'}</h3><p>{funds.length ? `Prueba otra búsqueda, estado o moneda. Estás viendo ${currency}.` : 'Añade la persona, el capital y la fecha de recepción. Después podrás anotar cada abono y consultar lo que falta por devolver.'}</p>{!funds.length && <button disabled={!!draft || pending} onClick={event => open('fund-create', event.currentTarget)}>Registrar el primer aporte</button>}</div> : <ul className={s.list}>{visible.map(fund => {
        const balance = fundBalance(fund, repayments);
        const history = repayments.filter(row => row.fund_id === fund.id).sort((a, b) => b.paid_on.localeCompare(a.paid_on) || a.id.localeCompare(b.id));
        return <li key={fund.id}><article className={s.fund}><div className={s.fundHeading}><div><h3>{fund.person_name}</h3><p>{fund.description}</p></div><span className={balance.remaining === BigInt(0) ? s.badgeDone : s.badge}>{balance.remaining === BigInt(0) ? 'Capital devuelto' : 'Por devolver'}</span></div><p className={s.meta}>Recibido el {readableDate(fund.received_on)} · {fund.currency}</p>
          <dl className={s.balances}><div><dt>Capital recibido</dt><dd>{money(balance.received, fund.currency)}</dd></div><div><dt>Devuelto</dt><dd>{money(balance.returned, fund.currency)}</dd></div><div><dt>Por devolver</dt><dd>{money(balance.remaining, fund.currency)}</dd></div></dl>
          {fund.notes && <details className={s.notes}><summary>Notas del aporte</summary><p>{fund.notes}</p></details>}
          <div className={s.actions}><button disabled={!!draft || pending || balance.remaining <= BigInt(0)} onClick={event => open('repayment-create', event.currentTarget, fund)}>Registrar abono</button><button disabled={!!draft || pending} onClick={event => open('fund-update', event.currentTarget, fund)}>Editar aporte</button></div>
          <details className={s.repayments}><summary>Historial de abonos ({history.length})</summary><p className={s.help}>Para corregir un importe o una fecha, anula el abono y registra uno nuevo. Los anulados permanecen en el historial.</p>{!history.length ? <p className={s.help}>Aún no has registrado abonos para este aporte.</p> : <ul>{history.map(row => <li key={row.id} className={row.voided_at ? s.voided : undefined}><div className={s.repaymentHeading}><strong>{money(row.amount_cents, fund.currency)}</strong><span className={row.voided_at ? s.badge : s.badgeDone}>{row.voided_at ? 'Anulado · no suma' : 'Vigente'}</span></div><p className={s.meta}>{readableDate(row.paid_on)} · {methods[row.payment_method]}</p>{row.notes && <p className={s.repaymentNote}>{row.notes}</p>}<button disabled={!!draft || pending} onClick={event => open(row.voided_at ? 'repayment-restore' : 'repayment-void', event.currentTarget, fund, row)}>{row.voided_at ? 'Restaurar abono' : 'Anular abono'}</button></li>)}</ul>}</details>
        </article></li>;
      })}</ul>}
    </section>
  </div>;
}
