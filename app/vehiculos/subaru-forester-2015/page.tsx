import ArrowIcon from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import VehicleGallery from "@/components/VehicleGallery";
import styles from "../vehicles.module.css";
export const metadata: Metadata = {title:"Subaru Forester 2015 · US$6.000 | DealerPass",description:"Subaru Forester 2015, 127.000 millas, automática, gasolina. Exterior azul e interior gris oscuro de tela. Fotografías y detalles en DealerPass.",openGraph:{images:["https://dealerpasss.com/vehicles/subaru-forester-2015/portada.webp"]}};
export default function SubaruForesterPage(){
return <section className={`wrap ${styles.page}`}>
<Link href="/vehiculos" className={styles.back}><ArrowIcon direction="left"/> Todos los vehículos</Link>
<header className={styles.detailHeading}><span className="kicker">DEALERPASS / INVENTARIO</span><h1>Subaru Forester <span>2015</span></h1><p>127.000 millas · SUV · Automática</p></header>
<div className={styles.detailGrid}><VehicleGallery folder="subaru-forester-2015" vehicle="Subaru Forester 2015" photos={[["portada","Portada · fondo de presentación editado"],["diagonal-1","Vista delantera diagonal"],["frente","Vista frontal"],["diagonal-2","Vista delantera opuesta"],["lateral","Vista lateral"],["trasera-diagonal","Vista trasera diagonal"],["trasera","Vista trasera"],["interior","Interior y asientos delanteros"],["volante","Volante y consola"]]}/><aside className={styles.summary}>
<span className={styles.eyebrow}>PRECIO DE VENTA</span><p className={styles.price}>US$6.000</p><p className={styles.description}>Explora las fotografías originales y características de esta Subaru Forester.</p>
<dl className={styles.specs}>{[["Año","2015"],["Millaje","127.000 mi"],["Transmisión","Automática"],["Combustible","Gasolina"],["Exterior","Azul"],["Interior","Gris oscuro de tela"],["Título","Limpio*"],["Propietarios","2*"],["Ubicación","Tampa, FL 33602"],["Préstamo pendiente","No*"]].map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
<p className={styles.note}>*Según información proporcionada por el vendedor. Millaje y datos declarados por el vendedor.</p><Link href="/contacto" className={styles.primary}>Ver opciones de contacto <ArrowIcon direction="up-right"/></Link><p className={styles.note}>El canal de atención está en preparación. Esta ficha no recibe pagos ni reservas.</p>
</aside></div></section>;
}