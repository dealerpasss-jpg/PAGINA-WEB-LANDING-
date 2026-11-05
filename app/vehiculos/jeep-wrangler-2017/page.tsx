import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('jeep-wrangler-2017','Jeep Wrangler 2017, 155.965 millas. Fotografía original de esta unidad; consulta los datos y el estado actual.');}
export default function Page(){return <VehicleDetail slug="jeep-wrangler-2017"/>;}
