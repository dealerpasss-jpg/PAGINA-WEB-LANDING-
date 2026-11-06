import type { Metadata } from 'next';
import AccountShell from '@/components/AccountShell';
import InvestmentFunding from '@/components/personal-finances/InvestmentFunding';
import { personalFunding } from '@/lib/personal-finances/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dinero recibido para invertir | DealerPass', robots: { index: false, follow: false } };
export default async function Page() {
  const data = await personalFunding();
  return <AccountShell title="Dinero recibido para invertir." kicker="DEALERPASS / MIS FINANZAS"><InvestmentFunding key={data.ownerId} {...data} /></AccountShell>;
}
