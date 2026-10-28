import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ArrowIcon from "@/components/ArrowIcon";
import styles from "./vehicles.module.css";
export const metadata: Metadata = { title: "Vehículos | DealerPass", description: "Vehículos disponibles en DealerPass: Ford Escape, Ford Edge y Ford Explorer. Fotos, precios y características." };
export default function Vehicles() {
 return <section className={`wrap ${styles.page}`}>
  <header className={styles.heading}><span className="kicker"><i /> VEHÍCULOS DEALERPASS</span><h1>Tu próximo carro,<br />en cada detalle.</h1><p>Explora las fotos, conoce sus características y encuentra tu próximo vehículo.</p></header>
  <div className={styles.inventoryLabel}><span>INVENTARIO</span><span>04 vehículos publicados</span></div>
  <article className={styles.card}>
   <Link href="/vehiculos/ford-escape-se-2016" className={styles.cover} aria-label="Ver fotos y detalles de la Ford Escape SE 2016"><Image src="/vehicles/ford-escape-2016/portada.webp" alt="Ford Escape SE 2016 blanca, vista frontal en diagonal" width={1448} height={1086} sizes="(max-width: 760px) 100vw, 60vw" priority /><span className={styles.photoBadge}>9 fotos · Ver galería <ArrowIcon direction="up-right" /></span></Link>
   <div className={styles.cardBody}><span className={styles.eyebrow}>2016 / SUV</span><h2>Ford Escape <span>SE</span></h2><p className={styles.price}>US$6.000</p><p className={styles.priceLabel}>Precio de venta</p><div className={styles.chips}><span>72.440 millas</span><span>Automática</span><span>Gasolina</span></div><p className={styles.description}>Exterior blanco, interior gris y título limpio, según información del vendedor.</p><Link href="/vehiculos/ford-escape-se-2016" className={styles.primary}>Ver vehículo <ArrowIcon /></Link></div>
  </article>
  <article className={styles.card}>
   <Link href="/vehiculos/ford-edge-2021" className={styles.cover} aria-label="Ver fotos y detalles de la Ford Edge 2021"><Image src="/vehicles/ford-edge-2021/portada.webp" alt="Ford Edge 2021 blanca, vista frontal en diagonal" width={1448} height={1086} sizes="(max-width: 760px) 100vw, 60vw" /><span className={styles.photoBadge}>11 fotos · Ver galería <ArrowIcon direction="up-right" /></span></Link>
   <div className={styles.cardBody}><span className={styles.eyebrow}>2021 / SUV</span><h2>Ford Edge <span>2021</span></h2><p className={styles.price}>US$10.800</p><p className={styles.priceLabel}>Precio de venta</p><div className={styles.chips}><span>140.000 millas</span><span>Automática</span><span>Gasolina</span></div><p className={styles.description}>Exterior blanco, interior beige y título limpio, según información del vendedor.</p><Link href="/vehiculos/ford-edge-2021" className={styles.primary}>Ver vehículo <ArrowIcon /></Link></div>
  </article>
  <article className={styles.card}>
   <Link href="/vehiculos/ford-edge-titanium-2018" className={styles.cover} aria-label="Ver fotos y detalles de la Ford Edge Titanium 2018"><Image src="/vehicles/ford-edge-titanium-2018/portada.webp" alt="Ford Edge Titanium 2018 plateada, vista frontal en diagonal" width={1448} height={1086} sizes="(max-width: 760px) 100vw, 60vw" /><span className={styles.photoBadge}>11 fotos · Ver galería <ArrowIcon direction="up-right" /></span></Link>
   <div className={styles.cardBody}><span className={styles.eyebrow}>2018 / SUV</span><h2>Ford Edge <span>Titanium 2018</span></h2><p className={styles.price}>US$8.200</p><p className={styles.priceLabel}>Precio de venta</p><div className={styles.chips}><span>116.842 millas</span><span>Automática</span><span>Gasolina</span></div><p className={styles.description}>Exterior plateado, interior negro y título limpio, según información del vendedor.</p><Link href="/vehiculos/ford-edge-titanium-2018" className={styles.primary}>Ver vehículo <ArrowIcon /></Link></div>
  </article>
  <article className={styles.card}>
   <Link href="/vehiculos/ford-explorer-xlt-2013" className={styles.cover} aria-label="Ver fotos y detalles de la Ford Explorer XLT 2013"><Image src="/vehicles/ford-explorer-xlt-2013/portada.webp" alt="Ford Explorer XLT 2013 negra, vista frontal en diagonal" width={1448} height={1086} sizes="(max-width: 760px) 100vw, 60vw" /><span className={styles.photoBadge}>11 fotos · Ver galería <ArrowIcon direction="up-right" /></span></Link>
   <div className={styles.cardBody}><span className={styles.eyebrow}>2013 / SUV</span><h2>Ford Explorer <span>XLT 2013</span></h2><p className={styles.price}>US$3.650</p><p className={styles.priceLabel}>Precio de venta</p><div className={styles.chips}><span>200.000 millas</span><span>Automática</span><span>Gasolina</span></div><p className={styles.description}>Exterior negro, interior beige y título limpio, según información del vendedor.</p><Link href="/vehiculos/ford-explorer-xlt-2013" className={styles.primary}>Ver vehículo <ArrowIcon /></Link></div>
  </article>
 </section>;
}
