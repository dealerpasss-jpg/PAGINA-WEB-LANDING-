import { notFound } from 'next/navigation';
import { readPublicCatalogue } from '@/lib/vehicles/publication-server';
import VehicleDetailView from './VehicleDetailView';
export default async function VehicleDetail({slug}:{slug:string}) {
 const vehicles=await readPublicCatalogue();
 if(!vehicles.some(v=>v.slug===slug))notFound();
 return <VehicleDetailView slug={slug} initial={vehicles}/>;
}
