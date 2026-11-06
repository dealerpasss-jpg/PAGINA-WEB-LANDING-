import type { Metadata } from 'next';
import Link from 'next/link';
import AccountShell from '@/components/AccountShell';
import PersonalFinances from '@/components/personal-finances/PersonalFinances';
import { personalEntries } from '@/lib/personal-finances/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Finanzas personales | DealerPass', robots: { index: false, follow: false } };
export default async function Page() {
  const data = await personalEntries();
  return <AccountShell title="Mis finanzas personales." kicker="DEALERPASS / MIS FINANZAS"><nav aria-label="Secciones de finanzas" style={{ marginBottom: 24 }}><Link href="/mi-cuenta/finanzas/capital" style={{ color: '#405539', textUnderlineOffset: 4, display: 'inline-block', paddingBlock: 12 }}>Dinero recibido para invertir →</Link></nav><PersonalFinances key={data.ownerId} {...data} /></AccountShell>;
}
