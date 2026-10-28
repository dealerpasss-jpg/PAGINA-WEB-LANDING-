import ArrowIcon from "@/components/ArrowIcon";
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AccountShell from '@/components/AccountShell';
import VehicleForm, {type Vehicle} from '@/components/investments/VehicleForm';
import Submit from '@/components/investments/Submit';
import PhotoUpload from '@/components/investments/PhotoUpload';
import { investmentIdentity, allRows } from '@/lib/investments/server';
import { vehicleCatalogue } from '@/data/vehicle-catalogue';
import { checked, database } from '@/lib/academy/server';
import { usd, totals, statuses, categories } from '@/lib/investments/money';
import { saveInvestment } from '../actions';
export const dynamic='force-dynamic';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{message?:string}>}) {
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const {db,admin}=await investmentIdentity('/mi-cuenta/inversiones/'+id);
 const readDb=admin?database():db;
 const vehicle=checked(await readDb.from('investment_vehicles').select(admin?'*':'id,title,vin,status,asking_cents,catalogue_slug,purchased_on').eq('id',id).maybeSingle()).data as Vehicle|null;if(!vehicle)notFound();
 const [expenses,members,photos]=await Promise.all([
 admin?allRows<{id:string;category:string;description:string;amount_cents:number;incurred_on:string;voided_at:string|null}>((from,to)=>db.from('investment_expenses').select('*').eq('vehicle_id',id).order('incurred_on',{ascending:false}).order('id').range(from,to)):Promise.resolve([]),
 allRows<{id:string;name:string;email:string;user_id:string|null;revoked_at:string|null;contribution_cents:number;returned_cents:number}>((from,to)=>db.from('investment_members').select('*').eq('vehicle_id',id).order('created_at').order('id').range(from,to)),
 allRows<{id:string}>((from,to)=>db.from('investment_photos').select('id').eq('vehicle_id',id).order('created_at').order('id').range(from,to))
 ]);
 const catalogue=vehicleCatalogue.find(c=>c.slug===vehicle.catalogue_slug);
 const summary=totals(admin?vehicle.purchase_cents:null,expenses.filter(e=>!e.voided_at).map(e=>e.amount_cents),vehicle.asking_cents,vehicle.sale_cents);const {message}=await searchParams;
 const margin=vehicle.status==='sold'?summary.margin:summary.estimatedMargin;
 return <AccountShell team={admin} kicker="DEALERPASS / VEHÍCULOS E INVERSIONES" title={vehicle.title}>
 <div className="investment-actions"><Link href="/mi-cuenta/inversiones"><ArrowIcon direction="left" /> Todos mis vehículos</Link></div><p className="investment-status">{statuses[vehicle.status]} · {vehicle.purchased_on || 'Fecha de compra pendiente'}</p><p>{vehicle.vin&&'VIN: '+vehicle.vin} {vehicle.auction&&' · '+vehicle.auction}</p>
 {message&&<p className="account-notice" role="status">{message}</p>}
 {admin&&<><div className="investment-stats"><article><span>INVERSIÓN TOTAL</span><strong>{usd(summary.cost)}</strong></article><article><span>{vehicle.status==='sold'?'RESULTADO REGISTRADO':'GANANCIA ESTIMADA'}</span><strong>{usd(vehicle.status==='sold'?summary.realized:summary.estimated)}</strong></article><article><span>{vehicle.status==='sold'?'MARGEN SOBRE VENTA':'MARGEN ESTIMADO SOBRE VENTA'}</span><strong>{margin===null?'Sin definir':margin.toFixed(1)+'%'}</strong></article></div>
 <p className="investment-note">Compra {usd(vehicle.purchase_cents)} + gastos vigentes {usd(summary.expensesTotal)}. Precio publicado: {usd(vehicle.asking_cents)}. Cierre real: {usd(vehicle.sale_cents)}. Resultado antes de gastos no registrados; no equivale a dinero repartido.</p>
 {vehicle.purchase_cents===null&&<p className="investment-pending">Completa el precio de compra para calcular la inversión total y la ganancia. No se supone un costo de cero.</p>}{vehicle.notes&&<p>{vehicle.notes}</p>}</>}
 {admin&&<details className="account-card" id="editar-compra" open={vehicle.purchase_cents===null}><summary>Registrar o editar el costo de compra</summary><p>Datos privados de administración. El precio de venta aquí es una referencia interna; el catálogo público mantiene su publicación actual.</p><VehicleForm vehicle={vehicle}/></details>}
 <details className="account-card"><summary>Fotos del vehículo · {(catalogue?.photos.length||0)+photos.length}</summary>{!photos.length&&!catalogue&&<p>Aún no hay fotos.</p>}<div className="investment-photos">{catalogue?.photos.map(p=><a key={p.src} href={p.src} target="_blank" rel="noreferrer"><Image src={p.src} width={640} height={480} alt={vehicle.title+": "+p.caption}/></a>)}{photos.map(p=><a key={p.id} href={'/api/investments/photo?id='+p.id} target="_blank" rel="noreferrer"><Image unoptimized width={640} height={480} src={'/api/investments/photo?id='+p.id} alt={'Foto de '+vehicle.title} loading="lazy"/></a>)}</div>{admin&&<PhotoUpload vehicleId={id}/>}</details>
 <div className="investment-grid">{admin&&<section className="account-card"><h2>Gastos y reparaciones</h2><ul className="investment-list">{expenses.map(e=><li key={e.id}><strong>{e.description} · {usd(e.amount_cents)}</strong><small>{categories[e.category as keyof typeof categories]} · {e.incurred_on}{e.voided_at?' · Anulado (no suma)':''}</small>{admin&&!e.voided_at&&<form action={saveInvestment}><input type="hidden" name="action" value="void-expense"/><input type="hidden" name="vehicle_id" value={id}/><input type="hidden" name="expense_id" value={e.id}/><Submit>Anular gasto</Submit></form>}</li>)}</ul>{!expenses.length&&<p>Sin gastos adicionales registrados.</p>}
 {admin&&<details><summary>+ Añadir gasto o reparación</summary><form action={saveInvestment} className="investment-form"><input type="hidden" name="action" value="expense"/><input type="hidden" name="vehicle_id" value={id}/><label>Tipo<select name="category">{Object.entries(categories).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>Qué se hizo / concepto<input name="description" required maxLength={500} placeholder="Cambio de alternador: pieza y mano de obra"/></label><label>Fecha<input type="date" name="incurred_on" required/></label><label>Monto USD<input name="amount_cents" type="number" step="0.01" min="0" max="999999999" required/></label><Submit>Guardar gasto</Submit></form></details>}</section>}
 <section className="account-card"><h2>{admin?'Socios e inversionistas':'Mi participación'}</h2><p className="investment-note">Aportes y devoluciones registrados. El reparto de ganancias se acuerda por separado; no se calcula automáticamente.</p><ul className="investment-list">{members.map(m=><li key={m.id}><strong>{m.name}</strong>{admin&&<small>{m.email} · {m.revoked_at?'Acceso retirado':m.user_id?'Cuenta vinculada':'Pendiente de registro / ingreso'}</small>}<p>Aporte: {usd(m.contribution_cents)} · Devuelto: {usd(m.returned_cents)}</p><p>Diferencia aporte − devuelto: {usd(m.contribution_cents-m.returned_cents)}</p>{admin&&!m.revoked_at&&<form action={saveInvestment}><input type="hidden" name="action" value="revoke"/><input type="hidden" name="vehicle_id" value={id}/><input type="hidden" name="member_id" value={m.id}/><Submit>Retirar acceso a este carro</Submit></form>}</li>)}</ul>
 {admin&&<details><summary>Asignar o actualizar participante</summary><p>Usa su correo habitual. La persona debe crear una cuenta, confirmar ese correo y entrar a Vehículos e inversiones. Solo verá las fotos y el estado de los carros asignados, nunca el costo de compra ni las reparaciones. No se envía una invitación automática.</p><p>Para actualizar montos usa el mismo correo. Guardar también restablece un acceso retirado.</p><form action={saveInvestment} className="investment-form"><input type="hidden" name="action" value="member"/><input type="hidden" name="vehicle_id" value={id}/><label>Nombre<input name="name" maxLength={100} required/></label><label>Correo autorizado<input name="email" type="email" maxLength={254} required/></label><label>Aporte total registrado (USD)<input name="contribution_cents" type="number" min="0" max="999999999" step="0.01" required/></label><label>Total devuelto (USD)<input name="returned_cents" type="number" min="0" max="999999999" step="0.01" defaultValue="0" required/></label><Submit>Guardar participante y acceso</Submit></form></details>}</section></div>

 </AccountShell>;
}
