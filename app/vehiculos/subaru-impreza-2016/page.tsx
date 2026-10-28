import ArrowIcon from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleGallery from "@/components/VehicleGallery";
import styles from "../vehicles.module.css";
export const metadata: Metadata = { title: "Subaru Impreza 2016 · US$5.000 | DealerPass", description: "Subaru Impreza hatchback 2016 plateado, 120.000 millas, automático, gasolina. Galería de fotos y datos en DealerPass.", openGraph: { images: ["https://dealerpasss.com/vehicles/subaru-impreza-2016/portada.webp"] } };
export default function ImprezaPage() {
 return <section className={`wrap ${styles.page}`}>
  <Link href="/vehiculos" className={styles.back}><ArrowIcon direction="left" /> Todos los vehículos</Link>
  <header className={styles.detailHeading}><span className="kicker">DEALERPASS / INVENTARIO</span><h1>Subaru Impreza <span>2016</span></h1><p>120.000 millas · Hatchback · Automática</p></header>
  <div className={styles.detailGrid}><VehicleGallery folder="subaru-impreza-2016" vehicle="Subaru Impreza 2016" photos={[["portada", "Portada · fondo de presentación editado"], ["diagonal-1", "Vista delantera diagonal original"], ["frente", "Vista frontal"], ["diagonal-2", "Vista delantera opuesta"], ["lateral", "Vista lateral"], ["trasera", "Vista trasera"], ["interior", "Asientos delanteros"], ["volante", "Volante y transmisión"], ["asientos", "Asientos traseros"], ["tablero", "Tablero y consola"], ["puerta", "Panel de la puerta"]]} /><aside className={styles.summary}>
    <span className={styles.eyebrow}>PRECIO DE VENTA</span><p className={styles.price}>US$5.000</p><p className={styles.description}>Conoce este Subaru Impreza y revisa sus fotografías originales.</p>
    <dl className={styles.specs}>{[["Año", "2016"], ["Millaje", "120.000 mi"], ["Transmisión", "Automática"], ["Combustible", "Gasolina"], ["Exterior", "Plateado"], ["Interior", "Negro"], ["Título", "Limpio*"], ["Propietarios", "2*"], ["Ubicación", "Tampa, FL 33602"], ["Préstamo pendiente", "No confirmado"]].map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
    <p className={styles.note}>*Según información proporcionada por el vendedor. Millaje y datos declarados por el vendedor.</p><Link href="/contacto" className={styles.primary}>Ver opciones de contacto <ArrowIcon direction="up-right" /></Link><p className={styles.note}>El canal de atención está en preparación. Esta ficha no recibe pagos ni reservas.</p>
  </aside></div>
 </section>;
}
