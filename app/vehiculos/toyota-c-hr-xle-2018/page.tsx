import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata("toyota-c-hr-xle-2018","Toyota C-HR XLE 2018 con 130.763 millas reportadas al momento de compra. Portada con fondo industrial editado y fotografía original de esta unidad en la galería. Precio de venta, documentación y disponibilidad para entrega pendientes de confirmar.");}
export default function Page(){return <VehicleDetail slug="toyota-c-hr-xle-2018"/>;}
