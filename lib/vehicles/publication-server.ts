import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import type { Metadata } from 'next';
import { database } from '@/lib/academy/server';
import { vehicleCatalogue } from '@/data/vehicle-catalogue';
import { publicationManifest } from './publication-manifest';
import { projectCatalogue, availabilityCopy, publicPrice, type PublicInventoryRow } from './publication';

export function publicCatalogueFallback(){return projectCatalogue(vehicleCatalogue,publicationManifest,null);}
// Keep the read narrow even on the server. No costs, sold price, notes, members,
// private photos, VIN or credentials are part of the public response.
export async function loadPublicCatalogue(read=async(ids:string[])=>{
 const result=await database().from('investment_vehicles').select('id,catalogue_slug,status,asking_cents').in('id',ids).limit(ids.length+1).abortSignal(AbortSignal.timeout(6000));
 if(result.error||!Array.isArray(result.data))throw new Error('Catalogue unavailable');
 return result.data as PublicInventoryRow[];
}) {
 try {return projectCatalogue(vehicleCatalogue,publicationManifest,await read(publicationManifest.filter(p=>p.enabled).map(p=>p.vehicleId)));}
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
