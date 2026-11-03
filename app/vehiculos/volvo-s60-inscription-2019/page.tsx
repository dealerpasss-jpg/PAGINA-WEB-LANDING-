import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('volvo-s60-inscription-2019','Volvo S60 Inscription 2019, 134.820 millas. Imagen de referencia del modelo; consulta los datos y el estado actual.');}
export default function Page(){return <VehicleDetail slug="volvo-s60-inscription-2019"/>;}
