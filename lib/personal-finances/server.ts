import 'server-only';
import { auth } from '@/lib/academy/server';
import { redirect } from 'next/navigation';
import { type Entry } from './model';

export async function personalIdentity() {
  const db = await auth();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user || !user.email_confirmed_at || user.is_anonymous) redirect('/ingresar?next=%2Fmi-cuenta%2Ffinanzas');
  return { db, user };
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
