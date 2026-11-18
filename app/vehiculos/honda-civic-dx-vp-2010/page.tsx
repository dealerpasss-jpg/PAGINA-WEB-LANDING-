import VehicleDetail from '@/components/VehicleDetail';
import { publicVehicleMetadata } from '@/lib/vehicles/publication-server';
export async function generateMetadata(){return publicVehicleMetadata("honda-civic-dx-vp-2010","Honda Civic sedán DX-VP 2010, con 146.093 millas reportadas al momento de compra. Precio de venta, estado mecánico y documentación pendientes de confirmar. La fotografía muestra otro Civic LX: no representa esta unidad DX-VP, su condición, color exacto ni equipamiento. Fotos reales pendientes.");}
export default function Page(){return <VehicleDetail slug="honda-civic-dx-vp-2010"/>;}
