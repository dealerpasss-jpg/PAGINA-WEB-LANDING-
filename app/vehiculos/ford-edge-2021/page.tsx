import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('ford-edge-2021','Ford Edge 2021, 140.000 millas, automática, gasolina. Exterior blanco e interior beige. Mira sus 11 fotografías en DealerPass.');}
export default function Page(){return <VehicleDetail slug="ford-edge-2021"/>;}
