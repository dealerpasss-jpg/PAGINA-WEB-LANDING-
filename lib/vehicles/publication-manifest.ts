import 'server-only';
import { vehicleCatalogue } from '@/data/vehicle-catalogue';
import type { Publication } from './publication';

// Exact identities verified read-only 2026-10-31. The two newer entries are
// explicitly linked here despite null catalogue_slug; no fuzzy match or DB write.
// The three Nov 2 purchases were explicitly approved for reference-image publication.
// Only these reviewed listings are enabled. This is not an auto-publish rule.
const links = [
 ['mazda6-grand-touring-2016','9ed4405e-0fb2-400d-b6bd-993f90adba93'],
 ['hyundai-elantra-eco-2018','4a3a2492-e2c7-4e12-8785-908cfc6b1b49'],
 ['nissan-versa-sr-2020','033b1a1b-14b0-4ed1-adb9-2b627c563b70'],
 ['audi-a4-premium-2017','1fa8de40-008e-487d-9c7f-6225a2669698'],
 ['volvo-s60-inscription-2019','51aa54bd-9a0f-427a-ae70-6081ef42ab9c'],
 ['ford-escape-se-2016','340dd962-9e50-4a2c-979e-9ac97ea85ded'],
 ['ford-edge-2021','f5105c5d-f07b-4e58-aa88-8ab9d37b193d'],
 ['ford-edge-titanium-2018','eea867cf-a519-4fc7-93e3-4722d971e782'],
 ['ford-explorer-xlt-2013','5d28a003-3168-4492-8d2d-8ee35bf99f04'],
 ['subaru-forester-2015','876d7e39-9be5-499e-8af4-85fbc600d79f'],
 ['subaru-impreza-2016','288babdd-920e-4da6-ad52-2c47c762cfa7'],
] as const;
// Owner-approved public preview only; private asking remains undefined.
export const publicationManifest:readonly Publication[]=links.map(([slug,vehicleId])=>({slug,vehicleId,enabled:true,...(slug==='volvo-s60-inscription-2019'?{previewPriceCents:1290000}:{}),
 // Source is the reviewed, versioned public catalogue, NEVER private photo storage.
 photoSources:vehicleCatalogue.find(v=>v.slug===slug)!.photos.map(p=>p.src),
}));

// The private inventory can reuse the same reviewed public image without copying
// private storage or modifying the financial record. Exact ID match only.
export function publishedVehicleForInvestment(id:string,catalogueSlug?:string|null) {
 const entry=publicationManifest.find(p=>p.enabled&&p.vehicleId===id);
 if(!entry||catalogueSlug&&catalogueSlug!==entry.slug)return undefined;
 return vehicleCatalogue.find(v=>v.slug===entry.slug);
}
