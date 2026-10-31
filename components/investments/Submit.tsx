'use client';
import { useInvestmentPending } from './InvestmentForm';
export default function Submit({children, destructive = false}:{children:React.ReactNode; destructive?:boolean}) { const pending=useInvestmentPending();return <button className="btn-primary" data-dp-button={destructive ? "destructive" : "primary"} aria-busy={pending} disabled={pending}>{pending?'Guardando…':children}</button>; }
