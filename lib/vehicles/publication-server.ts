import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import type { Metadata } from 'next';
import { database } from '@/lib/academy/server';
import { vehicleCatalogue } from '@/data/vehicle-catalogue';
import { publicationManifest } from './publication-registry';
import { projectCatalogue, availabilityCopy, publicPrice, type PublicInventoryRow } from './publication';

export function publicCatalogueFallback(){return projectCatalogue(vehicleCatalogue,publicationManifest,null);}
// Keep the read narrow even on the server. No costs, sold price, notes, members,
// private photos, VIN or credentials are part of the public response.
export async function loadPublicCatalogue(read=async(ids:string[],slugs:string[])=>{
 const groups:[string,string[]][]=[['id',ids],['catalogue_slug',slugs]];
 const rows:PublicInventoryRow[]=[];
 for(const [column,values] of groups){
  if(!values.length)continue;
  const result=await database().from('investment_vehicles').select('id,catalogue_slug,status,asking_cents').in(column,values).limit(values.length+1).abortSignal(AbortSignal.timeout(6000));
  if(result.error||!Array.isArray(result.data))throw new Error('Catalogue unavailable');
  rows.push(...result.data as PublicInventoryRow[]);
 }
 return rows;
}) {
 const enabled=publicationManifest.filter(p=>p.enabled);
 try {return projectCatalogue(vehicleCatalogue,publicationManifest,await read(enabled.flatMap(p=>p.vehicleId?[p.vehicleId]:[]),enabled.flatMap(p=>p.inventorySlug?[p.inventorySlug]:[])));}
 catch {return publicCatalogueFallback();}
}
// Request-only memoization, not a shared stale catalogue cache. connection() keeps
// live states/prices out of prerendered pages and build-time snapshots.
export const readPublicCatalogue=cache(async()=>{await connection();return loadPublicCatalogue();});
export async function publicVehicleMetadata(slug:string,description:string):Promise<Metadata> {
 const vehicle=(await readPublicCatalogue()).find(v=>v.slug===slug);
 if(!vehicle)return {title:'Vehículo no publicado | DealerPass',robots:{index:false,follow:true}};
 return {title:`${vehicle.title} · ${publicPrice(vehicle)} | DealerPass`,description:`${description} ${availabilityCopy[vehicle.availability??'unverified'].label}.`,openGraph:{images:vehicle.photos.slice(0,1).map(p=>'https://dealerpasss.com'+p.src)}};
}
