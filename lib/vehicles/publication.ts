import type { CatalogueVehicle } from '../../data/vehicle-catalogue.ts';

export type Availability = 'available'|'coming-soon'|'sold'|'unverified';
export type Publication = {slug:string;vehicleId:string;enabled:boolean;photoSources:readonly string[]};
export type PublicInventoryRow = {id:string;catalogue_slug:string|null;status:string;asking_cents:number|null};
export const availabilityCopy = {
 'available': {label:'Disponible',detail:'Disponible para consultar. Confirma su condición antes de comprar.',action:'Ver vehículo'},
 'coming-soon': {label:'Próximamente · No disponible',detail:'Un primer vistazo a lo que viene. Todavía no está disponible para comprar; puedes explorar sus fotos y detalles.',action:'Ver adelanto'},
 'sold': {label:'Vendido',detail:'Este vehículo ya se vendió. Conservamos su ficha para que puedas conocerlo; explora los vehículos que siguen disponibles.',action:'Ver ficha del vendido'},
 'unverified': {label:'Disponibilidad por confirmar',detail:'No pudimos confirmar el estado y el precio actuales. Vuelve a consultar antes de tomar una decisión.',action:'Ver detalles'},
} as const;
export function validPublicPrice(value:unknown):value is number {return typeof value==='number'&&Number.isSafeInteger(value)&&value>0&&value<=99_999_999_999;}
export function availabilityFor(status:unknown,price:unknown):Availability {
 if(status==='sold')return 'sold';
 if(status==='purchased'||status==='repairing')return 'coming-soon';
 return status==='listed'&&validPublicPrice(price)?'available':'unverified';
}
export function publicPrice(vehicle:Pick<CatalogueVehicle,'price'|'availability'>) {
 if(vehicle.availability==='sold')return 'Vendido';
 return validPublicPrice(vehicle.price)?new Intl.NumberFormat('es-US',{style:'currency',currency:'USD',maximumFractionDigits:vehicle.price%100?2:0}).format(vehicle.price/100):'Precio por confirmar';
}
// A fresh DTO, never a spread of a private row. Photos can only be selected from
// the already approved public asset set; private uploads/paths never enter it.
export function projectCatalogue(approved:readonly CatalogueVehicle[],manifest:readonly Publication[],rows:readonly PublicInventoryRow[]|null):CatalogueVehicle[] {
 const slugs=new Set<string>();const ids=new Set<string>();
 return manifest.flatMap(entry=>{
  if(!entry.enabled||slugs.has(entry.slug)||ids.has(entry.vehicleId)||manifest.filter(p=>p.enabled&&p.slug===entry.slug).length!==1||manifest.filter(p=>p.enabled&&p.vehicleId===entry.vehicleId).length!==1)return [];
  slugs.add(entry.slug);ids.add(entry.vehicleId);
  const source=approved.find(v=>v.slug===entry.slug);if(!source)return [];
  const selected=entry.photoSources.map(src=>source.photos.find(p=>p.src===src));
  if(!selected.length||selected.some(p=>!p)||new Set(entry.photoSources).size!==entry.photoSources.length)return [];
  const matches=rows?.filter(row=>row.id===entry.vehicleId)??[];
  const row=matches.length===1&&(!matches[0].catalogue_slug||matches[0].catalogue_slug===entry.slug)?matches[0]:null;
  const availability=row?availabilityFor(row.status,row.asking_cents):'unverified';
  const price=row&&availability!=='sold'&&availability!=='unverified'&&validPublicPrice(row.asking_cents)?row.asking_cents:null;
  return [{slug:source.slug,title:source.title,price,availability,description:source.description,
   specs:source.specs.filter(([key])=>key!=='Estado actual').map(([key,value])=>[key,value]),
   ...(source.bodyStyle?{bodyStyle:source.bodyStyle}:{}),...(source.photoNotice?{photoNotice:source.photoNotice}:{}),
   ...(source.originalPhotos?{originalPhotos:true}:{}),photos:selected.map(p=>({src:p!.src,caption:p!.caption}))}];
 });
}
export function unverifiedCatalogue(vehicles:readonly CatalogueVehicle[]):CatalogueVehicle[] {return vehicles.map(v=>({...v,price:null,availability:'unverified'}));}
// API data is public, but still validate its shape before replacing a rendered snapshot.
export function validCatalogueResponse(value:unknown):value is CatalogueVehicle[] {
 if(!Array.isArray(value)||value.length>100)return false;
 const slugs=new Set<string>();
 return value.every(v=>{if(!v||typeof v!=='object'||typeof v.slug!=='string'||slugs.has(v.slug)||!Object.hasOwn(availabilityCopy,v.availability))return false;slugs.add(v.slug);
  if((v.availability==='available'&&!validPublicPrice(v.price))||((v.availability==='sold'||v.availability==='unverified')&&v.price!==null))return false;
  return typeof v.title==='string'&&typeof v.description==='string'&&(v.price===null||validPublicPrice(v.price))&&Array.isArray(v.specs)&&v.specs.every((s:unknown)=>Array.isArray(s)&&s.length===2&&s.every(x=>typeof x==='string'))&&Array.isArray(v.photos)&&v.photos.length>0&&v.photos.every((p:{src?:unknown;caption?:unknown})=>typeof p.src==='string'&&p.src.startsWith('/vehicles/')&&!p.src.includes('..')&&typeof p.caption==='string');});
}
