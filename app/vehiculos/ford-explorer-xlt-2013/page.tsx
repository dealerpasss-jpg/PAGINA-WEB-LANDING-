import ArrowIcon from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleGallery from "@/components/VehicleGallery";
import styles from "../vehicles.module.css";
export const metadata: Metadata = { title: "Ford Explorer XLT 2013 · US$3.650 | DealerPass", description: "Ford Explorer XLT 2013, 200.000 millas, automática, gasolina. Exterior negro e interior beige. Mira sus 11 fotografías en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/ford-explorer-xlt-2013/portada.webp"] } };
export default function ExplorerPage() {
 return <section className={`wrap ${styles.page}`}>
  <Link href="/vehiculos" className={styles.back}><ArrowIcon direction="left" /> Todos los vehículos</Link>
  <header className={styles.detailHeading}><span className="kicker">DEALERPASS / INVENTARIO</span><h1>Ford Explorer XLT <span>2013</span></h1><p>200.000 millas · SUV · Automática</p></header>
  <div className={styles.detailGrid}><VehicleGallery folder="ford-explorer-xlt-2013" vehicle="Ford Explorer XLT 2013" photos={[["portada", "Portada · fondo de presentación editado"], ["diagonal-1", "Vista delantera original"], ["frente", "Vista frontal"], ["diagonal-2", "Vista delantera opuesta"], ["lateral", "Vista lateral"], ["trasera", "Vista trasera en diagonal"], ["consola", "Consola e interior beige"], ["conductor", "Asientos delanteros"], ["tablero", "Tablero y volante"], ["asientos", "Segunda fila de asientos"], ["tercera-fila", "Tercera fila de asientos"]]} /><aside className={styles.summary}>
   <span className={styles.eyebrow}>PRECIO DE VENTA</span><p className={styles.price}>US$3.650</p><p className={styles.description}>Conoce las características de esta Explorer y revisa sus fotos en detalle.</p>
   <dl className={styles.specs}>{[["Año", "2013"], ["Millaje", "200.000 mi"], ["Transmisión", "Automática"], ["Combustible", "Gasolina"], ["Exterior", "Negro"], ["Interior", "Beige"], ["Título", "Limpio*"], ["Propietarios", "2*"], ["Ubicación", "Tampa, FL 33619"], ["Préstamo pendiente", "No*"]].map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
   <p className={styles.note}>*Según información proporcionada por el vendedor. Millaje y datos declarados por el vendedor.</p><Link href="/contacto" className={styles.primary}>Ver opciones de contacto <ArrowIcon direction="up-right" /></Link><p className={styles.note}>El canal de atención está en preparación. Esta ficha no recibe pagos ni reservas.</p>
  </aside></div>
 </section>;
}
