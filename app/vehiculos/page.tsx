import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ArrowIcon from "@/components/ArrowIcon";
import styles from "./vehicles.module.css";
export const metadata: Metadata = { title: "Vehículos | DealerPass", description: "Ford Escape SE 2016, 72.440 millas, US$6.000. Fotos y características del vehículo." };
export default function Vehicles() {
 return <section className={`wrap ${styles.page}`}>
  <header className={styles.heading}><span className="kicker"><i /> VEHÍCULOS DEALERPASS</span><h1>Tu próximo carro,<br />en cada detalle.</h1><p>Explora las fotos, conoce sus características y encuentra tu próximo vehículo.</p></header>
  <div className={styles.inventoryLabel}><span>INVENTARIO</span><span>01 vehículo publicado</span></div>
  <article className={styles.card}>
   <Link href="/vehiculos/ford-escape-se-2016" className={styles.cover} aria-label="Ver fotos y detalles de la Ford Escape SE 2016"><Image src="/vehicles/ford-escape-2016/portada.webp" alt="Ford Escape SE 2016 blanca, vista frontal en diagonal" width={1448} height={1086} sizes="(max-width: 760px) 100vw, 60vw" priority /><span className={styles.photoBadge}>9 fotos · Ver galería ↗</span></Link>
   <div className={styles.cardBody}><span className={styles.eyebrow}>2016 / SUV</span><h2>Ford Escape <span>SE</span></h2><p className={styles.price}>US$6.000</p><p className={styles.priceLabel}>Precio de venta</p><div className={styles.chips}><span>72.440 millas</span><span>Automática</span><span>Gasolina</span></div><p className={styles.description}>Exterior blanco, interior gris y título limpio, según información del vendedor.</p><Link href="/vehiculos/ford-escape-se-2016" className={styles.primary}>Ver vehículo <ArrowIcon /></Link></div>
  </article>
 </section>;
}
