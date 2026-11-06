import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('hyundai-elantra-eco-2018','Hyundai Elantra ECO 2018 blanco, 104.609 millas. Imagen provisional de visualización de pintura; consulta condición y disponibilidad.');}
export default function Page(){return <VehicleDetail slug="hyundai-elantra-eco-2018"/>;}
