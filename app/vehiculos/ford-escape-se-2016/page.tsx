import type { Metadata } from "next";
import VehicleDetail from "@/components/VehicleDetail";

export const metadata: Metadata = { title: "Ford Escape SE 2016 · US$6.000 | DealerPass", description: "Ford Escape SE 2016, 72.440 millas, automática, gasolina. Exterior blanco e interior gris. Mira sus 9 fotografías en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/ford-escape-2016/portada.webp"] } };

export default function Page() {
  return <VehicleDetail slug="ford-escape-se-2016" />;
}
