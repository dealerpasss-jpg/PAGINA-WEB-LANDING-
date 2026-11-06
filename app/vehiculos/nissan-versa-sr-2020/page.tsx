import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('nissan-versa-sr-2020','Nissan Versa SR 2020, 128.541 millas. Imagen de referencia del modelo; consulta los datos y el estado actual.');}
export default function Page(){return <VehicleDetail slug="nissan-versa-sr-2020"/>;}
