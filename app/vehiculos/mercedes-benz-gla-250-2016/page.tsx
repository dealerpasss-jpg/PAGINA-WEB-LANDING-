import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('mercedes-benz-gla-250-2016','Mercedes-Benz GLA 250 2016, 108.119 millas. Portada con fondo editado y foto original de esta unidad; consulta los datos y el estado actual.');}
export default function Page(){return <VehicleDetail slug="mercedes-benz-gla-250-2016"/>;}
