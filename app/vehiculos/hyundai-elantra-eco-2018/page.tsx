import type { Metadata } from 'next';
import VehicleDetail from '@/components/VehicleDetail';

export const metadata:Metadata = {
  title:'Hyundai Elantra ECO 2018 · US$8.200 | DealerPass',
  description:'Hyundai Elantra ECO 2018 blanco, 104.609 millas. En proceso de pintura. Imagen provisional de visualización de pintura; consulta condición y disponibilidad.',
  openGraph:{images:['https://dealerpasss.com/vehicles/hyundai-elantra-eco-2018/visualizacion-pintura.webp']},
};
export default function Page(){return <VehicleDetail slug="hyundai-elantra-eco-2018"/>;}
