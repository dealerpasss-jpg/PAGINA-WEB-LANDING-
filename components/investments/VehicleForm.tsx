import InvestmentForm from './InvestmentForm';
import Submit from './Submit';
import { statuses } from '@/lib/investments/money';
export type Vehicle = {id:string;title:string;vin:string;auction:string;purchased_on:string|null;purchase_cents:number|null;catalogue_slug?:string|null;asking_cents:number|null;sale_cents:number|null;status:keyof typeof statuses;notes:string;version:number};
export default function VehicleForm({vehicle}:{vehicle?:Vehicle}) {
 const amount=(n:number|null|undefined)=>n==null?'':(n/100).toFixed(2);
 return <InvestmentForm className="investment-form investment-vehicle-form"><input type="hidden" name="action" value={vehicle?'vehicle':'create'}/><input type="hidden" name="vehicle_id" value={vehicle?.id||''}/><input type="hidden" name="version" value={vehicle?.version||1}/>
 <fieldset className="investment-field-group"><legend>01 / Identifica el carro</legend>
 <label>Vehículo · año, marca y modelo<input name="title" maxLength={120} required defaultValue={vehicle?.title} placeholder="2018 Audi Q5 Premium Plus"/></label>
 <label>VIN (opcional)<input name="vin" maxLength={17} defaultValue={vehicle?.vin}/></label>
 </fieldset>
 <fieldset className="investment-field-group"><legend>02 / Registra la compra</legend>
 <label>Subasta o proveedor<input name="auction" maxLength={100} defaultValue={vehicle?.auction}/></label>
 <label>Fecha de compra (si la conoces)<input type="date" name="purchased_on" defaultValue={vehicle?.purchased_on || ""}/></label>
 <label>Precio de compra / martillo (USD)<input type="number" inputMode="decimal" name="purchase_cents" min="0" max="999999999" step="0.01" defaultValue={amount(vehicle?.purchase_cents)}/><small>Déjalo vacío si está pendiente; cero significa una compra de $0.</small></label>
 <p className="investment-note">Añade cargos de subasta, reparaciones y otros gastos por separado en la ficha, sin repetirlos en el martillo.</p>
 </fieldset>
 <fieldset className="investment-field-group"><legend>03 / Venta y cierre</legend>
 <label>Estado<select name="status" defaultValue={vehicle?.status||'purchased'}>{Object.entries(statuses).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
 <label>Precio publicado de venta (USD, opcional)<input type="number" inputMode="decimal" name="asking_cents" min="0" max="999999999" step="0.01" defaultValue={amount(vehicle?.asking_cents)}/></label>
 <label>Precio real de cierre (solo vendido, USD)<input type="number" inputMode="decimal" name="sale_cents" min="0" max="999999999" step="0.01" defaultValue={amount(vehicle?.sale_cents)}/></label>
 <p className="investment-note">Para registrar un cierre, selecciona Vendido e indica el precio real. Este importe registra la venta; no confirma cuánto te han pagado.</p>
 </fieldset>
 <div className="investment-form-footer"><label>Notas privadas de administración<textarea name="notes" maxLength={2000} defaultValue={vehicle?.notes}/></label><Submit>{vehicle?'Guardar ficha':'Crear vehículo'}</Submit></div></InvestmentForm>;
}
