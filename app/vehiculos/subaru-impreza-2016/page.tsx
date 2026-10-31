import type { Metadata } from "next";
import VehicleDetail from "@/components/VehicleDetail";

export const metadata: Metadata = { title: "Subaru Impreza 2016 · US$5.000 | DealerPass", description: "Subaru Impreza hatchback 2016 plateado, 120.000 millas, automático, gasolina. Galería de fotos y datos en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/subaru-impreza-2016/portada.webp"] } };

export default function Page() {
  return <VehicleDetail slug="subaru-impreza-2016" />;
}
