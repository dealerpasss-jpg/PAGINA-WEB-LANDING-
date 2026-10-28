'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { investmentIdentity } from '@/lib/investments/server';
import { cents, statuses, categories } from '@/lib/investments/money';
import { investmentDate, investmentVersion, ownKey } from '@/lib/investments/validation';
import { checked } from '@/lib/academy/server';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function text(f:FormData,key:string,max=500,required=false) {const v=String(f.get(key)||'').trim();if(v.length>max||required&&!v)throw new Error('Revisa los campos obligatorios y su longitud.');return v;}
export async function saveInvestment(f:FormData) {
 const {db,admin}=await investmentIdentity(); if(!admin)throw new Error('Acceso de consulta. Solo el administrador puede editar.');
 const action=text(f,'action',30);const id=text(f,'vehicle_id',36);let next='/mi-cuenta/inversiones'+(uuid.test(id)?'/'+id:'');const message='Cambios guardados.';
 try {
 if(action!=='create'&&!uuid.test(id))throw new Error('Vehículo inválido.');
 if(action==='create'||action==='vehicle') {
 const status=text(f,'status',20)||'purchased';if(!ownKey(statuses,status))throw new Error('Estado inválido.');
 const sale=cents(f.get('sale_cents'),true);if(status==='sold'&&sale===null)throw new Error('Registra el precio real de venta.');if(status!=='sold'&&sale!==null)throw new Error('Marca el vehículo como vendido para registrar el precio final.');
 const date=investmentDate(text(f,'purchased_on',10));
 const data={title:text(f,'title',120,true),vin:text(f,'vin',17).toUpperCase(),auction:text(f,'auction',100),purchased_on:date||null,purchase_cents:cents(f.get('purchase_cents'),true),asking_cents:cents(f.get('asking_cents'),true),sale_cents:sale,status,notes:text(f,'notes',2000)};
 if(data.vin&&!/^[A-HJ-NPR-Z0-9]{17}$/.test(data.vin))throw new Error('El VIN debe tener 17 caracteres válidos.');
 if(action==='create'){const row=checked(await db.from('investment_vehicles').insert(data).select('id').single()).data;if(!row)throw new Error('No se pudo crear el vehículo.');next+='/'+row.id;}
 else {const version=investmentVersion(f.get('version'));const result=checked(await db.from('investment_vehicles').update({...data,version:version+1}).eq('id',id).eq('version',version).select('id'));if(!result.data?.length)throw new Error('La ficha cambió en otra ventana. Recárgala antes de guardar.');}
 } else if(action==='expense') {
 const category=text(f,'category',20);if(!ownKey(categories,category))throw new Error('Categoría inválida.');
 checked(await db.from('investment_expenses').insert({vehicle_id:id,category,description:text(f,'description',500,true),amount_cents:cents(f.get('amount_cents')),incurred_on:investmentDate(text(f,'incurred_on',10,true),true)}));
 } else if(action==='void-expense') { const expense=text(f,'expense_id',36);if(!uuid.test(expense))throw new Error('Gasto inválido.');checked(await db.from('investment_expenses').update({voided_at:new Date().toISOString()}).eq('id',expense).eq('vehicle_id',id));
 } else if(action==='member') {
 const email=text(f,'email',254,true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Correo inválido.');
 checked(await db.from('investment_members').upsert({vehicle_id:id,email,name:text(f,'name',100,true),contribution_cents:cents(f.get('contribution_cents')),returned_cents:cents(f.get('returned_cents')),revoked_at:null},{onConflict:'vehicle_id,email'}));
 } else if(action==='revoke') {const member=text(f,'member_id',36);if(!uuid.test(member))throw new Error('Participante inválido.');checked(await db.from('investment_members').update({revoked_at:new Date().toISOString()}).eq('id',member).eq('vehicle_id',id));
 } else throw new Error('Acción inválida.');
 } catch(e) {return {error:e instanceof Error && !('code' in e) ? e.message : 'No se pudo guardar. Tus datos siguen en el formulario. Revisa los datos e inténtalo de nuevo.'};}
 revalidatePath('/mi-cuenta/inversiones','layout');redirect(next+'?message='+encodeURIComponent(message));
}
