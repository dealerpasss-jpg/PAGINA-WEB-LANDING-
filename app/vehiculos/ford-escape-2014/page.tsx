import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('ford-escape-2014','Ford Escape 2014, 160.383 millas. Portada de referencia y foto original de esta unidad; consulta los datos y el estado actual.');}
export default function Page(){return <VehicleDetail slug="ford-escape-2014"/>;}
