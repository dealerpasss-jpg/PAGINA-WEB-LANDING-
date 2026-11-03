'use client';
import { createContext, useContext, useEffect, useRef, useState, useTransition } from 'react';
import { unstable_rethrow } from 'next/navigation';
import { investmentQuery } from '@/lib/investments/view';
import { saveInvestment } from '@/app/mi-cuenta/inversiones/actions';
const PendingContext = createContext(false);
export function useInvestmentPending() { return useContext(PendingContext); }
export default function InvestmentForm({ children, className, confirmMessage }: { children: React.ReactNode; className?: string; confirmMessage?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const errorNotice = useRef<HTMLParagraphElement>(null);
  const [errorRevision, setErrorRevision] = useState(0);
  function showError(message:string) { setError(message); setErrorRevision(value => value + 1); }
  useEffect(() => { if (!errorRevision) return; errorNotice.current?.focus({preventScroll:true}); errorNotice.current?.scrollIntoView({block:'start',behavior:'instant'}); }, [errorRevision]);
  return <PendingContext.Provider value={pending}><form className={className} aria-busy={pending} onSubmit={event => {
    event.preventDefault();
    if (pending || inFlight.current) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    // Capture before disabling controls; a failed save keeps every entered value.
    const data = new FormData(event.currentTarget);
    // Read at submit time so Back/Forward and freshly changed filters are retained.
    // Carry only inventory context, never an arbitrary return URL or form values.
    data.set('inventory_query', investmentQuery(new URLSearchParams(window.location.search)));
    inFlight.current = true;
    setError('');
    startTransition(async () => {
      try {
        const result = await saveInvestment(data);
        if (result?.error) showError(result.error);
      } catch (error) {
        unstable_rethrow(error);
        showError('No pudimos confirmar el guardado. Tus datos siguen aquí. Revisa la ficha antes de volver a enviarlos para evitar duplicados.');
      } finally { inFlight.current = false; }
    });
  }}><fieldset disabled={pending} style={{border:0,padding:0,margin:0,minWidth:0,display:'contents'}}>{children}</fieldset>{error && <p ref={errorNotice} tabIndex={-1} style={{scrollMarginTop:110}} className="account-notice" role="alert">{error}</p>}</form></PendingContext.Provider>;
}
