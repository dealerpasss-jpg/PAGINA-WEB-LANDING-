import ArrowIcon from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleGallery from "@/components/VehicleGallery";
import styles from "../vehicles.module.css";
export const metadata: Metadata = { title: "Ford Escape SE 2016 · US$6.000 | DealerPass", description: "Ford Escape SE 2016, 72.440 millas, automática, gasolina. Exterior blanco e interior gris. Mira sus 9 fotografías en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/ford-escape-2016/portada.webp"] } };
export default function EscapePage() {
 return <section className={`wrap ${styles.page}`}>
  <Link href="/vehiculos" className={styles.back}><ArrowIcon direction="left" /> Todos los vehículos</Link>
  <header className={styles.detailHeading}><span className="kicker">DEALERPASS / INVENTARIO</span><h1>Ford Escape SE <span>2016</span></h1><p>72.440 millas · SUV · Automática</p></header>
  <div className={styles.detailGrid}><VehicleGallery /><aside className={styles.summary}>
   <span className={styles.eyebrow}>PRECIO DE VENTA</span><p className={styles.price}>US$6.000</p><p className={styles.description}>Conoce las características de esta Escape y revisa sus fotos en detalle.</p>
   <dl className={styles.specs}>{[["Año", "2016"], ["Versión", "SE"], ["Millaje", "72.440 mi"], ["Transmisión", "Automática"], ["Combustible", "Gasolina"], ["Exterior", "Blanco"], ["Interior", "Gris"], ["Título", "Limpio*"]].map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
   <p className={styles.note}>*Según información proporcionada por el vendedor. Millaje mostrado en la foto del tablero.</p><Link href="/contacto" className={styles.primary}>Ver opciones de contacto <ArrowIcon direction="up-right" /></Link><p className={styles.note}>El canal de atención está en preparación. Esta ficha no recibe pagos ni reservas.</p>
  </aside></div>
 </section>;
}
