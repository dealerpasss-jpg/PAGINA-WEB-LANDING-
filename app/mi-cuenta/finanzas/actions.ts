'use server';
import { revalidatePath } from 'next/cache';
import { personalIdentity } from '@/lib/personal-finances/server';
import { entryColumns, parseEntry, sameEntry, uuid, version, type Entry, type SaveResult } from '@/lib/personal-finances/model';

export async function savePersonalEntry(form: FormData): Promise<SaveResult> {
  const { db, user } = await personalIdentity();
  try {
    // A form left open during an account switch must not save into the new account.
    if (form.get('owner_id') !== user.id) throw new Error('La sesión cambió. Recarga la página antes de guardar.');
    const id = uuid(form.get('id'));
    const action = form.get('action');
    if (action === 'create') {
      const input = parseEntry(form);
      const { error } = await db.from('personal_finance_transactions').insert({ id, user_id: user.id, ...input });
      if (error) {
        if (error.code !== '23505') throw error;
        // The same form UUID is reused after an uncertain response: never duplicate a payment.
        const previous = await db.from('personal_finance_transactions').select(entryColumns).eq('user_id', user.id).eq('id', id).maybeSingle();
        if (previous.error || !previous.data || previous.data.archived_at || !sameEntry(input, previous.data as Entry)) throw new Error('El movimiento ya cambió. Actualiza la página antes de volver a guardarlo.');
      }
    } else if (action === 'update' || action === 'archive' || action === 'restore') {
      const expected = version(form.get('version'));
      const changes = action === 'update' ? parseEntry(form) : { archived_at: action === 'archive' ? new Date().toISOString() : null };
      let query = db.from('personal_finance_transactions').update(changes).eq('user_id', user.id).eq('id', id).eq('version', expected);
      query = action === 'restore' ? query.not('archived_at', 'is', null) : query.is('archived_at', null);
      const result = await query.select('id');
      if (result.error) throw result.error;
      if (result.data?.length !== 1) throw new Error('No se guardó: el movimiento cambió en otra ventana o ya no está disponible. Actualiza la página y revisa antes de intentarlo otra vez.');
    } else throw new Error('Acción no válida.');
  } catch (error) {
    return { ok: false, error: error instanceof Error && !('code' in error) ? error.message : 'No se pudo confirmar el guardado. Conservamos el formulario. Reintenta sin cerrarlo para evitar duplicados.' };
  }
  revalidatePath('/mi-cuenta/finanzas');
  return { ok: true, message: form.get('action') === 'archive' ? 'Movimiento archivado. Puedes restaurarlo desde Archivados.' : form.get('action') === 'restore' ? 'Movimiento restaurado.' : 'Movimiento guardado.' };
}
