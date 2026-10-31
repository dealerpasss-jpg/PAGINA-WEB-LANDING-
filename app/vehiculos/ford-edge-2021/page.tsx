import type { Metadata } from "next";
import VehicleDetail from "@/components/VehicleDetail";

export const metadata: Metadata = { title: "Ford Edge 2021 · US$10.800 | DealerPass", description: "Ford Edge 2021, 140.000 millas, automática, gasolina. Exterior blanco e interior beige. Mira sus 11 fotografías en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/ford-edge-2021/portada.webp"] } };

export default function Page() {
  return <VehicleDetail slug="ford-edge-2021" />;
}
