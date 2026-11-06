'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { savePersonalEntry } from '@/app/mi-cuenta/finanzas/actions';
import { categories, currencies, localDate, methods, money, summarize, type Currency, type Entry } from '@/lib/personal-finances/model';
import styles from './PersonalFinances.module.css';

type Draft = { id: string; entry?: Entry; date: string };
export default function PersonalFinances({ entries, ownerId }: { entries: Entry[]; ownerId: string }) {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>('USD');
  const [month, setMonth] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [archived, setArchived] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirm, setConfirm] = useState<Entry | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const summary = summarize(entries, currency, month);
  const visible = entries.filter(entry => entry.currency === currency && !!entry.archived_at === archived
    && (!month || entry.occurred_on.startsWith(month + '-'))
    && (filter === 'all' || filter === 'pending' ? filter !== 'pending' || entry.status === 'pending' : entry.kind === filter)
    && (!search || `${entry.description} ${entry.notes} ${categories[entry.category]}`.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es'))));
  useEffect(() => {
    if (draft) formRef.current?.querySelector<HTMLInputElement>('[name="description"]')?.focus();
    else if (returnFocus.current?.isConnected) returnFocus.current.focus();
  }, [draft]);
  function open(entry?: Entry) {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setNotice(''); setError(''); setConfirm(null);
    setDraft({ id: entry?.id ?? crypto.randomUUID(), entry, date: entry?.occurred_on ?? localDate() });
  }
  function submit(form: FormData) {
    if (inFlight.current) return;
    inFlight.current = true; setError(''); setNotice('');
    startTransition(async () => {
      try {
        const result = await savePersonalEntry(form);
        if (!result.ok) { setError(result.error); return; }
        setDraft(null); setConfirm(null); setNotice(result.message); router.refresh();
      } catch {
        setError('No se pudo confirmar el guardado. Si tu sesión venció, vuelve a ingresar. Mantén este formulario abierto y reintenta para evitar duplicados.');
      } finally { inFlight.current = false; }
    });
  }
  function archive(entry: Entry) {
    const form = new FormData();
    form.set('owner_id', ownerId); form.set('id', entry.id); form.set('version', String(entry.version));
    form.set('action', entry.archived_at ? 'restore' : 'archive'); submit(form);
  }
  return <div className={styles.panel}>
    <div className={styles.intro}><div><span className={styles.eyebrow}>TU DINERO, EN ORDEN</span><p>Registra lo que recibes, lo que pagas y lo que tienes pendiente. Estas cuentas personales están separadas de tus vehículos.</p></div><button type="button" className={styles.primary} onClick={() => open()} disabled={pending || !!draft}>＋ Nuevo movimiento</button></div>
    <div className={styles.period}><label>Moneda<select value={currency} onChange={event => setCurrency(event.target.value as Currency)}>{currencies.map(value => <option key={value}>{value}</option>)}</select></label><label>Período<input type="month" value={month} onChange={event => setMonth(event.target.value)} min="1900-01" max="2100-12" /></label>{month && <button type="button" onClick={() => setMonth('')}>Ver todo el historial</button>}<span>{month ? 'Resumen del mes seleccionado' : 'Resumen de todo el historial'} · Sin conversión de moneda</span></div>
    <section className={styles.stats} aria-label="Resumen de movimientos registrados">
      <article className={styles.balance}><span>Saldo registrado</span><strong>{money(summary.balance, currency)}</strong><small>Ingresos recibidos menos gastos pagados</small></article>
      <article><span>Ingresos recibidos</span><strong>{money(summary.income, currency)}</strong><small>Solo movimientos completados</small></article>
      <article><span>Gastos pagados</span><strong>{money(summary.expense, currency)}</strong><small>Solo movimientos completados</small></article>
    </section>
    <div className={styles.pending}><span>Por recibir <strong>{money(summary.pendingIncome, currency)}</strong></span><span>Por pagar <strong>{money(summary.pendingExpense, currency)}</strong></span><small>Los pendientes y archivados no cambian el saldo. Este registro no consulta tu banco ni ejecuta pagos.</small></div>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    {error && <div className={styles.error} role="alert"><p>{error}</p><button type="button" onClick={() => router.refresh()} disabled={pending}>Actualizar datos</button></div>}
    {draft && <section className={styles.editor} aria-labelledby="finance-editor-title">
      <div className={styles.sectionTitle}><h2 id="finance-editor-title">{draft.entry ? 'Editar movimiento' : 'Nuevo movimiento'}</h2><button type="button" disabled={pending} onClick={() => { setDraft(null); setError(''); }}>Cancelar</button></div>
      <form key={`${draft.id}-${draft.entry?.version ?? 'new'}`} ref={formRef} onSubmit={event => { event.preventDefault(); submit(new FormData(event.currentTarget)); }}>
        <input type="hidden" name="owner_id" value={ownerId} /><input type="hidden" name="id" value={draft.id} /><input type="hidden" name="version" value={draft.entry?.version ?? ''} /><input type="hidden" name="action" value={draft.entry ? 'update' : 'create'} />
        <fieldset disabled={pending}><legend className={styles.srOnly}>Datos del movimiento</legend><div className={styles.formGrid}>
          <label className={styles.wide}>Concepto<input name="description" required maxLength={160} placeholder="Por ejemplo: pago de seguro" defaultValue={draft.entry?.description ?? ''} autoComplete="off" /></label>
          <label>Tipo<select name="kind" defaultValue={draft.entry?.kind ?? 'expense'}><option value="expense">Gasto / pago</option><option value="income">Ingreso</option></select></label>
          <label>Estado<select name="status" defaultValue={draft.entry?.status ?? 'paid'}><option value="paid">Pagado / recibido</option><option value="pending">Pendiente</option></select></label>
          <label>Monto<input name="amount" inputMode="decimal" required maxLength={13} placeholder="0,00" aria-describedby="finance-amount-help" defaultValue={draft.entry ? (draft.entry.amount_cents / 100).toFixed(2) : ''} /></label>
          <label>Moneda<select name="currency" defaultValue={draft.entry?.currency ?? currency}>{currencies.map(value => <option key={value}>{value}</option>)}</select></label>
          <small className={styles.wide} id="finance-amount-help">Sin separadores de miles. Hasta dos decimales, con punto o coma.</small>
          <label>Fecha<input name="occurred_on" type="date" required min="1900-01-01" max="2100-12-31" defaultValue={draft.date} /></label>
          <label>Categoría<select name="category" defaultValue={draft.entry?.category ?? 'personal'}>{Object.entries(categories).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
          <label>Medio de pago<select name="payment_method" defaultValue={draft.entry?.payment_method ?? 'cash'}>{Object.entries(methods).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
          <label className={styles.wide}>Notas <span className={styles.optional}>(opcional)</span><textarea name="notes" rows={3} maxLength={2000} defaultValue={draft.entry?.notes ?? ''} placeholder="Detalles que quieras recordar. No escribas contraseñas ni números completos de tarjetas." /></label>
        </div><p className={styles.help}>Para un pendiente, usa la fecha prevista. Al completarlo, cambia el estado y registra la fecha real. Una venta de vehículo se anota aquí solo si decides registrarla; no se importa automáticamente.</p><div className={styles.formActions}><button type="submit" className={styles.primary}>{pending ? 'Guardando…' : 'Guardar movimiento'}</button><button type="button" onClick={() => { setDraft(null); setError(''); }}>Cancelar</button></div></fieldset>
      </form>
    </section>}
    <section className={styles.history} aria-labelledby="finance-history-title">
      <div className={styles.sectionTitle}><div><span className={styles.eyebrow}>TU HISTORIAL</span><h2 id="finance-history-title">{archived ? 'Movimientos archivados' : 'Tus movimientos'}</h2></div><button type="button" aria-pressed={archived} disabled={pending || !!draft} onClick={() => { setArchived(!archived); setConfirm(null); }}>{archived ? 'Ver activos' : 'Ver archivados'}</button></div>
      <div className={styles.filters}><label>Buscar<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Concepto o notas" /></label><label>Mostrar<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todos</option><option value="income">Ingresos</option><option value="expense">Gastos / pagos</option><option value="pending">Pendientes</option></select></label><span aria-live="polite">{visible.length} {visible.length === 1 ? 'movimiento' : 'movimientos'}</span></div>
      <p className={styles.help}>Buscar y Mostrar filtran la lista. El resumen siempre incluye los movimientos activos de la moneda y el período elegidos.</p>
      {!visible.length ? <div className={styles.empty}><span aria-hidden="true">↗</span><h3>{entries.length ? 'No hay movimientos con estos filtros.' : 'Tus cuentas empiezan aquí.'}</h3><p>{entries.length ? 'Prueba otra moneda, otro período o vuelve a mostrar todos.' : 'Anota tu primer ingreso o pago. El saldo se calcula únicamente con lo que registres.'}</p>{!entries.length && <button type="button" onClick={() => open()} disabled={pending || !!draft}>Registrar mi primer movimiento</button>}</div> : <ul className={styles.list}>{visible.map(entry => <li key={entry.id}>
        <div className={`${styles.direction} ${entry.kind === 'income' ? styles.income : ''}`} aria-hidden="true">{entry.kind === 'income' ? '↓' : '↑'}</div>
        <div className={styles.entryMain}><div className={styles.entryTop}><h3>{entry.description}</h3><strong className={entry.kind === 'income' ? styles.incomeText : ''}>{entry.kind === 'income' ? '+' : '−'}{money(entry.amount_cents, entry.currency)}</strong></div><div className={styles.meta}><time dateTime={entry.occurred_on}>{entry.occurred_on.split('-').reverse().join('/')}</time><span>{categories[entry.category]}</span><span>{methods[entry.payment_method]}</span><span className={entry.status === 'pending' ? styles.badgePending : styles.badge}>{entry.status === 'pending' ? 'Pendiente' : entry.kind === 'income' ? 'Recibido' : 'Pagado'}</span></div>{entry.notes && <details className={styles.notes}><summary>Ver notas</summary><p>{entry.notes}</p></details>}
          {confirm?.id === entry.id ? <div className={styles.confirm} role="alert"><p>¿Archivar este movimiento? Dejará de contar en el saldo y podrás restaurarlo.</p><button type="button" disabled={pending} onClick={() => archive(entry)}>Sí, archivar</button><button type="button" disabled={pending} onClick={() => setConfirm(null)}>Cancelar</button></div> : <div className={styles.entryActions}>{!entry.archived_at && <button type="button" disabled={pending || !!draft} onClick={() => open(entry)} aria-label={`Editar ${entry.description}`}>Editar</button>}<button type="button" disabled={pending || !!draft} onClick={() => entry.archived_at ? archive(entry) : setConfirm(entry)} aria-label={`${entry.archived_at ? 'Restaurar' : 'Archivar'} ${entry.description}`}>{entry.archived_at ? 'Restaurar' : 'Archivar'}</button></div>}
        </div>
      </li>)}</ul>}
    </section>
  </div>;
}
