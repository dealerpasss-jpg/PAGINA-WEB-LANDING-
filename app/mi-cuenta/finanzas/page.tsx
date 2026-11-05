import type { Metadata } from 'next';
import AccountShell from '@/components/AccountShell';
import PersonalFinances from '@/components/personal-finances/PersonalFinances';
import { personalEntries } from '@/lib/personal-finances/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Finanzas personales | DealerPass', robots: { index: false, follow: false } };
export default async function Page() {
  const data = await personalEntries();
  return <AccountShell title="Mis finanzas personales." kicker="DEALERPASS / MIS FINANZAS"><PersonalFinances key={data.ownerId} {...data} /></AccountShell>;
}
