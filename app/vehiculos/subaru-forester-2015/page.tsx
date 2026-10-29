import type { Metadata } from "next";
import VehicleDetail from "@/components/VehicleDetail";

export const metadata: Metadata = {title:"Subaru Forester 2015 · US$6.000 | DealerPass",description:"Subaru Forester 2015, 127.000 millas, automática, gasolina. Exterior azul e interior gris oscuro de tela. Fotografías y detalles en DealerPass.",openGraph:{images:["https://dealerpasss.com/vehicles/subaru-forester-2015/portada.webp"]}};

export default function Page() {
  return <VehicleDetail slug="subaru-forester-2015" />;
}
