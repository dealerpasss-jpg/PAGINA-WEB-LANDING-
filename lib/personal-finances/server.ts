import 'server-only';
import { auth } from '@/lib/academy/server';
import { redirect } from 'next/navigation';
import { type Entry } from './model';
import { type FundingSnapshot } from './funding';

export async function personalIdentity(next: '/mi-cuenta/finanzas' | '/mi-cuenta/finanzas/capital' = '/mi-cuenta/finanzas') {
  const db = await auth();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user || !user.email_confirmed_at || user.is_anonymous) redirect('/ingresar?next=' + encodeURIComponent(next));
  return { db, user };
}

export async function personalFunding() {
  const { db, user } = await personalIdentity('/mi-cuenta/finanzas/capital');
  const { data, error } = await db.rpc('personal_investment_snapshot');
  if (error || !data || !Array.isArray(data.funds) || !Array.isArray(data.repayments)) throw new Error('No se pudo cargar el capital recibido. Inténtalo de nuevo.');
  return { ...(data as FundingSnapshot), ownerId: user.id };
}

export async function personalEntries() {
  const { db, user } = await personalIdentity();
  // One SQL statement gives a coherent snapshot, even beyond the Data API row limit.
  // The invoker RPC derives ownership from auth.uid(), accepts no owner argument,
  // returns only display columns, and still enforces the table's RLS.
  const { data, error } = await db.rpc('personal_finance_entries');
  if (error || !Array.isArray(data)) throw new Error('No se pudieron cargar tus finanzas. Inténtalo nuevamente.');
  return { entries: data as Entry[], ownerId: user.id };
}
