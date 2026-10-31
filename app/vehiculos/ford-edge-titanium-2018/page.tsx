import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('ford-edge-titanium-2018','Ford Edge Titanium 2018, 116.842 millas, automática, gasolina. Exterior plateado e interior negro. Mira sus 11 fotografías en DealerPass.');}
export default function Page(){return <VehicleDetail slug="ford-edge-titanium-2018"/>;}
