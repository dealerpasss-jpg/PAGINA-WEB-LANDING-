import 'server-only';
import { vehicleCatalogue } from '@/data/vehicle-catalogue';
import { publicationManifest as legacyManifest } from './publication-manifest';
import type { Publication } from './publication';

// New publications link by the public slug, not a private record identifier.
// The existing unique catalogue_slug column makes this an exact lookup.
export const approvedInventorySlugs = [
 'jeep-wrangler-2017',
 'ford-escape-2014',
 'mercedes-benz-gla-250-2016',
] as const;
const slugEntries:Publication[]=approvedInventorySlugs.map(slug=>({
 slug,inventorySlug:slug,enabled:true,
 photoSources:vehicleCatalogue.find(v=>v.slug===slug)!.photos.map(p=>p.src),
}));
export const publicationManifest:readonly Publication[]=vehicleCatalogue.flatMap(vehicle=>
 [...legacyManifest,...slugEntries].filter(entry=>entry.slug===vehicle.slug)
);

export function publishedVehicleForInvestment(id:string,catalogueSlug?:string|null) {
 const entry=publicationManifest.find(p=>p.enabled&&(p.vehicleId?p.vehicleId===id:p.inventorySlug===catalogueSlug));
 if(!entry||catalogueSlug&&catalogueSlug!==entry.slug)return undefined;
 return vehicleCatalogue.find(v=>v.slug===entry.slug);
}
