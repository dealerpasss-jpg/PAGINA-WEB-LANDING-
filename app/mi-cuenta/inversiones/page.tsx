import { missingInvestmentFields } from '@/lib/investments/pending';
import VehicleStatus from '@/components/investments/VehicleStatus';
import PortfolioOverview from '@/components/investments/PortfolioOverview';
import { portfolioSummary } from '@/lib/investments/portfolio';
import InventoryCollection from '@/components/investments/InventoryCollection';
import Link from 'next/link';
import ArrowIcon from '@/components/ArrowIcon';
import AccountShell from '@/components/AccountShell';
import VehicleForm, {type Vehicle} from '@/components/investments/VehicleForm';
import { investmentIdentity, allRows } from '@/lib/investments/server';
import { database } from '@/lib/academy/server';
import { totals, statuses } from '@/lib/investments/money';
import { publishedVehicleForInvestment } from '@/lib/vehicles/publication-manifest';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{message?:string}>}) {
 const {db,admin}=await investmentIdentity();const {message}=await searchParams;
 // Only the verified administrator path may use the privileged client for cost columns.
 const readDb=admin?database():db;
 const vehicleColumns:string=admin?'*':'id,title,status,asking_cents,catalogue_slug,created_at';
 const [vehicles,expenses,photos]=await Promise.all([
 allRows<Vehicle>((from,to)=>readDb.from('investment_vehicles').select(vehicleColumns).order('created_at',{ascending:false}).order('id').range(from,to).overrideTypes<Vehicle[], {merge:false}>()),
 admin?allRows<{vehicle_id:string;amount_cents:number}>((from,to)=>db.from('investment_expenses').select('vehicle_id,amount_cents').is('voided_at',null).order('id').range(from,to)):Promise.resolve([]),
 allRows<{id:string;vehicle_id:string}>((from,to)=>db.from('investment_photos').select('id,vehicle_id').order('created_at').order('id').range(from,to))
 ]);
 const rows=vehicles.map(v=>({...v,summary:admin?totals(v.purchase_cents,expenses.filter(e=>e.vehicle_id===v.id).map(e=>e.amount_cents),v.asking_cents,v.sale_cents):null}));
 const portfolio=admin?portfolioSummary(rows.map(v=>({...v,summary:v.summary!}))):null;
 return <AccountShell team={admin} kicker="DEALERPASS / VEHÍCULOS E INVERSIONES" title={admin?'Tus carros. Tus números.':'Mis vehículos e inversiones.'}>
 <p>{admin?'Registra tus compras, añade fotos y controla lo que inviertes en cada vehículo.':'Consulta las fotos y el estado de los vehículos asignados a tu cuenta. Los costos son privados de administración.'}</p>
 {message&&<p className="account-notice" role="status">{message}</p>}
 {admin&&<><div className="investment-admin-actions"><Link className="dashboard-cta" href="#nuevo-vehiculo">+ Añadir nueva compra</Link><Link className="dashboard-text-link" href="/mi-cuenta/calculadora">Abrir calculadora <ArrowIcon/></Link></div>
 {portfolio&&<PortfolioOverview summary={portfolio}/>}</>}
 <section className="dashboard-panel workspace-pipeline" aria-labelledby="pipeline-title"><div className="dashboard-section-title"><h2 id="pipeline-title">Estado del inventario</h2><span>{rows.length} vehículos</span></div><div className="workspace-pipeline-grid">{Object.entries(statuses).map(([key])=>{const count=rows.filter(v=>v.status===key).length;return <div key={key}><div><VehicleStatus status={key as keyof typeof statuses}/><strong>{count}</strong></div><progress aria-label={statuses[key as keyof typeof statuses]} value={count} max={Math.max(rows.length,1)}/></div>})}</div></section>
 {!rows.length&&<div className="investment-empty"><h2>{admin?'Registra tu primer carro.':'Todavía no tienes vehículos asignados.'}</h2><p>{admin?'Añade una compra y después carga sus fotos y reparaciones.':'El administrador puede asignar vehículos a tu correo confirmado.'}</p></div>}
 <InventoryCollection admin={admin} items={rows.map(v=>{const catalogue=publishedVehicleForInvestment(v.id,v.catalogue_slug);const photo=photos.find(p=>p.vehicle_id===v.id);const src=catalogue?.photos[0]?.src || (photo?'/api/investments/photo?id='+photo.id:null);return {id:v.id,title:v.title,status:v.status,photo:src?{src,unoptimized:!!photo&&!catalogue}:null,facts:(catalogue?.specs??[]).filter(([label])=>['Año','Versión','Millaje','Transmisión','Exterior'].includes(label)).map(([label,value])=>({label,value})),photoNotice:catalogue?.photoNotice,...(admin&&v.summary?{financial:{purchase:v.purchase_cents,expenses:v.summary.expensesTotal,cost:v.summary.cost,reference:v.status==='sold'?v.sale_cents:v.asking_cents,result:v.status==='sold'?v.summary.realized:v.summary.estimated,purchasedOn:v.purchased_on,missing:missingInvestmentFields(v)}}:{})};})} />
 {admin&&<section id="nuevo-vehiculo" className="account-card"><h2>Registrar nueva compra</h2><p>Crea la ficha administrativa. En el siguiente paso podrás añadir fotos y gastos. Esta ficha es privada; no publica el carro automáticamente en el catálogo de venta.</p><VehicleForm/></section>}
 </AccountShell>;
}
