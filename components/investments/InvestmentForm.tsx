'use client';
import { createContext, useContext, useState, useTransition } from 'react';
import { unstable_rethrow } from 'next/navigation';
import { saveInvestment } from '@/app/mi-cuenta/inversiones/actions';
const PendingContext = createContext(false);
export function useInvestmentPending() { return useContext(PendingContext); }
export default function InvestmentForm({ children, className }: { children: React.ReactNode; className?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  return <PendingContext.Provider value={pending}><form className={className} aria-busy={pending} onSubmit={event => {
    event.preventDefault();
    if (pending) return;
    // Capture before disabling controls; a failed save keeps every entered value.
    const data = new FormData(event.currentTarget);
    setError('');
    startTransition(async () => {
      try {
        const result = await saveInvestment(data);
        if (result?.error) setError(result.error);
      } catch (error) {
        unstable_rethrow(error);
        setError('No pudimos confirmar el guardado. Tus datos siguen aquí. Revisa la ficha antes de volver a enviarlos para evitar duplicados.');
      }
    });
  }}><fieldset disabled={pending} style={{border:0,padding:0,margin:0,minWidth:0,display:'contents'}}>{children}</fieldset>{error && <p className="account-notice" role="alert">{error}</p>}</form></PendingContext.Provider>;
}
