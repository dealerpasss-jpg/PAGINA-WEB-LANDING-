import 'server-only';
import { auth, database, checked, requireIdentity } from '@/lib/academy/server';
export async function investmentIdentity(next = '/mi-cuenta/inversiones') {
  const who = await requireIdentity(next);
  // Only the verified Auth email may claim a pending assignment; never form data or user_metadata.
  if (who.user.email && who.user.email_confirmed_at) {
    checked(await database().from('investment_members').update({user_id:who.user.id})
      .eq('email',who.user.email.toLowerCase()).is('user_id',null).is('revoked_at',null));
  }
  return { who, db:await auth(), admin:who.profile.role==='admin' };
}

// Fetch every page so totals never silently stop at the Data API row limit.
export async function allRows<T>(page:(from:number,to:number)=>PromiseLike<{data:T[]|null;error:unknown}>) {
 const rows:T[]=[];
 for(let from=0;;from+=500) {const result=checked(await page(from,from+499));const batch=result.data||[];rows.push(...batch);if(batch.length<500)return rows;}
}
