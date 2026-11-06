import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('ford-explorer-xlt-2013','Ford Explorer XLT 2013, 200.000 millas, automática, gasolina. Exterior negro e interior beige. Mira sus 11 fotografías en DealerPass.');}
export default function Page(){return <VehicleDetail slug="ford-explorer-xlt-2013"/>;}
