import type { Metadata } from "next";
import VehicleDetail from "@/components/VehicleDetail";

export const metadata: Metadata = { title: "Ford Edge Titanium 2018 · US$8.200 | DealerPass", description: "Ford Edge Titanium 2018, 116.842 millas, automática, gasolina. Exterior plateado e interior negro. Mira sus 11 fotografías en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/ford-edge-titanium-2018/portada.webp"] } };

export default function Page() {
  return <VehicleDetail slug="ford-edge-titanium-2018" />;
}
