'use server';
import { revalidatePath } from 'next/cache';
import { personalIdentity } from '@/lib/personal-finances/server';
import { uuid, version, type SaveResult } from '@/lib/personal-finances/model';
import { equalInput, fundColumns, parseFund, parseRepayment, repaymentColumns, type InvestmentFund, type InvestmentRepayment } from '@/lib/personal-finances/funding';

export async function saveInvestmentFunding(form: FormData): Promise<SaveResult> {
  const { db, user } = await personalIdentity('/mi-cuenta/finanzas/capital');
  const action = form.get('action');
  try {
    if (form.get('owner_id') !== user.id) throw new Error('La sesión cambió. Recarga la página antes de guardar.');
    const id = uuid(form.get('id'));
    if (action === 'fund-create') {
      const input = parseFund(form);
      const { error } = await db.from('personal_investment_funds').insert({ id, user_id: user.id, ...input });
      if (error) {
        const previous = await db.from('personal_investment_funds').select(fundColumns).eq('user_id', user.id).eq('id', id).maybeSingle();
        if (previous.error || !previous.data) throw error;
        if (!equalInput(input, previous.data as InvestmentFund)) throw new Error('Este registro ya existe con otros datos. Actualiza la página y revísalo.');
      }
    } else if (action === 'fund-update') {
      const input = parseFund(form);
      // Currency stays fixed, so previous repayments always retain their original unit.
      const existing = await db.from('personal_investment_funds').select('currency').eq('user_id', user.id).eq('id', id).maybeSingle();
      if (existing.error) throw existing.error;
      if (!existing.data || existing.data.currency !== input.currency) throw new Error('La moneda del capital recibido no se puede cambiar.');
      const { currency: _currency, ...changes } = input;
      void _currency;
      const result = await db.from('personal_investment_funds').update(changes).eq('user_id', user.id).eq('id', id).eq('version', version(form.get('version'))).select('id');
      if (result.error) throw result.error;
      if (result.data?.length !== 1) throw new Error('El registro cambió en otra ventana. Actualiza los datos antes de guardar.');
    } else if (action === 'repayment-create') {
      const fundId = uuid(form.get('fund_id'));
      const input = parseRepayment(form);
      const { error } = await db.from('personal_investment_repayments').insert({ id, user_id: user.id, fund_id: fundId, ...input });
      if (error) {
        // A duplicate may hit a balance trigger before its unique constraint.
        // Reconcile any uncertain insert against this owner's exact stable UUID.
        const previous = await db.from('personal_investment_repayments').select(repaymentColumns).eq('user_id', user.id).eq('fund_id', fundId).eq('id', id).maybeSingle();
        if (previous.error || !previous.data) throw error;
        if (previous.data.voided_at || !equalInput(input, previous.data as InvestmentRepayment)) throw new Error('Este abono ya existe o fue corregido. Actualiza la página y revisa el historial.');
      }
    } else if (action === 'repayment-void' || action === 'repayment-restore') {
      const fundId = uuid(form.get('fund_id'));
      let query = db.from('personal_investment_repayments').update({ voided_at: action === 'repayment-void' ? new Date().toISOString() : null }).eq('user_id', user.id).eq('fund_id', fundId).eq('id', id).eq('version', version(form.get('version')));
      query = action === 'repayment-void' ? query.is('voided_at', null) : query.not('voided_at', 'is', null);
      const result = await query.select('id');
      if (result.error) throw result.error;
      if (result.data?.length !== 1) throw new Error('El abono cambió en otra ventana. Actualiza el historial antes de continuar.');
    } else throw new Error('Acción no válida.');
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    if (code === '23514' || code === 'P0001') return { ok: false, error: 'Revisa el capital y los abonos: no puedes devolver más del capital recibido ni registrar un abono anterior a la fecha de recepción. Tampoco puedes reducir el capital por debajo de lo ya devuelto. Actualiza los datos si cambió otra ventana.' };
    return { ok: false, error: error instanceof Error && !code ? error.message : 'No se pudo confirmar el guardado. Conservamos el formulario; reintenta sin cerrarlo para evitar duplicados.' };
  }
  revalidatePath('/mi-cuenta/finanzas/capital');
  return { ok: true, message: action === 'repayment-void' ? 'Abono anulado. Su importe vuelve al capital por devolver y queda en el historial.' : action === 'repayment-restore' ? 'Abono restaurado.' : action === 'repayment-create' ? 'Abono registrado.' : 'Capital recibido guardado.' };
}
