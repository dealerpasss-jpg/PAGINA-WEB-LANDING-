import ArrowIcon from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleGallery from "@/components/VehicleGallery";
import styles from "../vehicles.module.css";
export const metadata: Metadata = { title: "Ford Edge Titanium 2018 · US$8.200 | DealerPass", description: "Ford Edge Titanium 2018, 116.842 millas, automática, gasolina. Exterior plateado e interior negro. Mira sus 11 fotografías en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/ford-edge-titanium-2018/portada.webp"] } };
export default function EdgePage() {
 return <section className={`wrap ${styles.page}`}>
  <Link href="/vehiculos" className={styles.back}><ArrowIcon direction="left" /> Todos los vehículos</Link>
  <header className={styles.detailHeading}><span className="kicker">DEALERPASS / INVENTARIO</span><h1>Ford Edge Titanium <span>2018</span></h1><p>116.842 millas · SUV · Automática</p></header>
  <div className={styles.detailGrid}><VehicleGallery folder="ford-edge-titanium-2018" vehicle="Ford Edge Titanium 2018" photos={[["portada", "Portada · fondo de presentación editado"], ["diagonal-1", "Vista delantera original"], ["frente", "Vista frontal"], ["diagonal-2", "Vista delantera opuesta"], ["lateral", "Vista lateral"], ["trasera", "Vista trasera"], ["diagonal-trasera", "Vista trasera en diagonal"], ["conductor", "Interior del conductor"], ["interior", "Asientos delanteros"], ["asientos", "Asientos traseros y techo panorámico"], ["tablero", "Tablero y consola"]]} /><aside className={styles.summary}>
   <span className={styles.eyebrow}>PRECIO DE VENTA</span><p className={styles.price}>US$8.200</p><p className={styles.description}>Conoce las características de esta Edge y revisa sus fotos en detalle.</p>
   <dl className={styles.specs}>{[["Año", "2018"], ["Millaje", "116.842 mi"], ["Transmisión", "Automática"], ["Combustible", "Gasolina"], ["Exterior", "Plateado"], ["Interior", "Negro"], ["Título", "Limpio*"], ["Propietarios", "2*"], ["Ubicación", "Tampa, FL"], ["Préstamo pendiente", "No*"]].map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
   <p className={styles.note}>*Según información proporcionada por el vendedor. Millaje y datos declarados por el vendedor.</p><Link href="/contacto" className={styles.primary}>Ver opciones de contacto <ArrowIcon direction="up-right" /></Link><p className={styles.note}>El canal de atención está en preparación. Esta ficha no recibe pagos ni reservas.</p>
  </aside></div>
 </section>;
}
