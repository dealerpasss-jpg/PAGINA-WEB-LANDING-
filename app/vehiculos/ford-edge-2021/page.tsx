import ArrowIcon from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleGallery from "@/components/VehicleGallery";
import styles from "../vehicles.module.css";
export const metadata: Metadata = { title: "Ford Edge 2021 · US$10.800 | DealerPass", description: "Ford Edge 2021, 140.000 millas, automática, gasolina. Exterior blanco e interior beige. Mira sus 11 fotografías en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/ford-edge-2021/portada.webp"] } };
export default function EdgePage() {
 return <section className={`wrap ${styles.page}`}>
  <Link href="/vehiculos" className={styles.back}><ArrowIcon direction="left" /> Todos los vehículos</Link>
  <header className={styles.detailHeading}><span className="kicker">DEALERPASS / INVENTARIO</span><h1>Ford Edge <span>2021</span></h1><p>140.000 millas · SUV · Automática</p></header>
  <div className={styles.detailGrid}><VehicleGallery folder="ford-edge-2021" vehicle="Ford Edge 2021" photos={[["portada", "Portada · fondo de presentación editado"], ["diagonal-1", "Vista delantera original"], ["diagonal-2", "Vista delantera opuesta"], ["frente", "Vista frontal"], ["lateral", "Vista lateral"], ["trasera", "Vista trasera"], ["asientos", "Asientos traseros"], ["tablero", "Tablero y consola"], ["interior-1", "Interior beige"], ["interior-2", "Consola y pantalla"], ["conductor", "Asiento del conductor"]]} /><aside className={styles.summary}>
   <span className={styles.eyebrow}>PRECIO DE VENTA</span><p className={styles.price}>US$10.800</p><p className={styles.description}>Conoce las características de esta Edge y revisa sus fotos en detalle.</p>
   <dl className={styles.specs}>{[["Año", "2021"], ["Millaje", "140.000 mi"], ["Transmisión", "Automática"], ["Combustible", "Gasolina"], ["Exterior", "Blanco"], ["Interior", "Beige"], ["Título", "Limpio*"], ["Propietarios", "2*"], ["Ubicación", "Tampa, FL"], ["Préstamo pendiente", "No*"]].map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
   <p className={styles.note}>*Según información proporcionada por el vendedor. Millaje y datos declarados por el vendedor.</p><Link href="/contacto" className={styles.primary}>Ver opciones de contacto <ArrowIcon direction="up-right" /></Link><p className={styles.note}>El canal de atención está en preparación. Esta ficha no recibe pagos ni reservas.</p>
  </aside></div>
 </section>;
}
