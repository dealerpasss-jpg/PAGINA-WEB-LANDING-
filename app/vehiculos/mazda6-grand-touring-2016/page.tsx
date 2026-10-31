import type { Metadata } from 'next';
import VehicleDetail from '@/components/VehicleDetail';

export const metadata: Metadata = {
  title: 'Mazda6 Grand Touring 2016 · US$8.500 | DealerPass',
  description: 'Mazda6 Grand Touring 2016 blanco, 161.000 millas, interior crema / marfil y sunroof. Revisa sus ocho fotografías originales y consulta condición y disponibilidad.',
  openGraph: { images: ['https://dealerpasss.com/vehicles/mazda6-grand-touring-2016/portada.webp'] },
};
export default function Page() { return <VehicleDetail slug="mazda6-grand-touring-2016" />; }
