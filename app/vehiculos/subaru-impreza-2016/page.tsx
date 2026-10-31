import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('subaru-impreza-2016','Subaru Impreza hatchback 2016 plateado, 120.000 millas, automático, gasolina. Galería de fotos y datos en DealerPass.');}
export default function Page(){return <VehicleDetail slug="subaru-impreza-2016"/>;}
