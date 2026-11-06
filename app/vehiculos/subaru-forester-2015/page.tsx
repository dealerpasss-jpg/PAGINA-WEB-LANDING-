import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('subaru-forester-2015','Subaru Forester 2015, 127.000 millas, automática, gasolina. Exterior azul e interior gris oscuro de tela. Fotografías y detalles en DealerPass.');}
export default function Page(){return <VehicleDetail slug="subaru-forester-2015"/>;}
