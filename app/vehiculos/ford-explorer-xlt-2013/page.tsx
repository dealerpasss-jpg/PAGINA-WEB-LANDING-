import type { Metadata } from "next";
import VehicleDetail from "@/components/VehicleDetail";

export const metadata: Metadata = { title: "Ford Explorer XLT 2013 · US$3.650 | DealerPass", description: "Ford Explorer XLT 2013, 200.000 millas, automática, gasolina. Exterior negro e interior beige. Mira sus 11 fotografías en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/ford-explorer-xlt-2013/portada.webp"] } };

export default function Page() {
  return <VehicleDetail slug="ford-explorer-xlt-2013" />;
}
