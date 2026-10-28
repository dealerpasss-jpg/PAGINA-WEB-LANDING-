'use client';
import { useInvestmentPending } from './InvestmentForm';
export default function Submit({children}:{children:React.ReactNode}) { const pending=useInvestmentPending();return <button className="btn-primary" disabled={pending}>{pending?'Guardando…':children}</button>; }
