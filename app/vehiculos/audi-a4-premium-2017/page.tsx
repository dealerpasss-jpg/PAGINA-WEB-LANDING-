import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('audi-a4-premium-2017','Audi A4 Premium 2017, 107.203 millas. Imagen de referencia del modelo; consulta los datos y el estado actual.');}
export default function Page(){return <VehicleDetail slug="audi-a4-premium-2017"/>;}
