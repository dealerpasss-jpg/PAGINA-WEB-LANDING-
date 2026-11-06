import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('ford-escape-se-2016','Ford Escape SE 2016, 72.440 millas, automática, gasolina. Exterior blanco e interior gris. Mira sus 9 fotografías en DealerPass.');}
export default function Page(){return <VehicleDetail slug="ford-escape-se-2016"/>;}
