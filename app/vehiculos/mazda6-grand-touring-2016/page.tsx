import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata('mazda6-grand-touring-2016','Mazda6 Grand Touring 2016 blanco, 161.000 millas, interior crema / marfil y sunroof. Revisa sus ocho fotografías originales y consulta condición y disponibilidad.');}
export default function Page(){return <VehicleDetail slug="mazda6-grand-touring-2016"/>;}
