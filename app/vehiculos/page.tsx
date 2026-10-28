import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ArrowIcon from "@/components/ArrowIcon";
import { vehicleCatalogue } from "@/data/vehicle-catalogue";
import styles from "./vehicles.module.css";

export const metadata: Metadata = {
  title: "Vehículos | DealerPass",
  description: "Explora el inventario de DealerPass. Fotos, precios y características de cada vehículo, en un solo lugar.",
};

const priceFormatter = new Intl.NumberFormat("es-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Vehicles() {
  return (
    <section className={`wrap ${styles.page}`}>
      <header className={styles.heading}>
        <span className="kicker"><i /> VEHÍCULOS DEALERPASS</span>
        <h1>Tu próximo carro,<br /><span>en cada detalle.</span></h1>
        <p>Fotos, características y precios claros. Explora el inventario y conoce cada vehículo antes de dar el siguiente paso.</p>
      </header>
      <div className={styles.inventoryLabel}>
        <h2>Explora el inventario</h2>
        <span className={styles.inventoryCount}>{vehicleCatalogue.length} vehículos publicados</span>
      </div>
      <div className={styles.inventoryGrid}>
        {vehicleCatalogue.map((vehicle, index) => {
          const spec = (name: string) => vehicle.specs.find(([key]) => key === name)?.[1];
          const href = `/vehiculos/${vehicle.slug}`;
          const cover = vehicle.photos[0];
          return (
            <article className={styles.card} key={vehicle.slug}>
              <Link href={href} className={styles.cover} aria-label={`Ver fotos y detalles de ${vehicle.title}`}>
                <Image
                  src={cover.src}
                  alt={`${vehicle.title}, fotografía de portada`}
                  width={1448}
                  height={1086}
                  sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  priority={index === 0}
                />
                <span className={styles.photoBadge}>{vehicle.photos.length} fotos <ArrowIcon direction="up-right" /></span>
              </Link>
              <div className={styles.cardBody}>
                <span className={styles.eyebrow}>{spec("Año")} · {spec("Combustible")}</span>
                <h2><Link href={href}>{vehicle.title}</Link></h2>
                <div className={styles.chips}>
                  <span>{spec("Millaje")}</span>
                  <span>{spec("Transmisión")}</span>
                  <span>{spec("Exterior")}</span>
                </div>
                <div className={styles.cardPrice}>
                  <p className={styles.price}>{priceFormatter.format(vehicle.price / 100)}</p>
                  <span className={styles.priceLabel}>Precio de venta · USD</span>
                </div>
                <Link href={href} className={styles.primary} aria-label={`Ver ${vehicle.title}`}>
                  Ver vehículo <ArrowIcon />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <p className={styles.catalogueNote}>Consulta las fotografías y los datos de cada ficha. La información del vehículo es proporcionada por el vendedor.</p>
    </section>
  );
}
