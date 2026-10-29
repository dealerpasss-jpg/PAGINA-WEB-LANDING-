import Image from 'next/image';
import Link from 'next/link';
import ArrowIcon from '@/components/ArrowIcon';
import type { CatalogueVehicle } from '@/data/vehicle-catalogue';
import { vehicleSpec } from '@/lib/vehicles/catalogue';
import styles from '@/app/vehiculos/vehicles.module.css';

const money = new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function VehicleCards({ vehicles, priority = false }: { vehicles: CatalogueVehicle[]; priority?: boolean }) {
  return <div className={styles.inventoryGrid}>
    {vehicles.map((vehicle, index) => {
      const href = `/vehiculos/${vehicle.slug}`;
      return <article className={styles.card} key={vehicle.slug}>
        <Link href={href} className={styles.cover} aria-label={`Ver fotos y detalles de ${vehicle.title}`}>
          <Image src={vehicle.photos[0].src} alt={`${vehicle.title}, fotografía de portada`} width={1448} height={1086} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" priority={priority && index === 0} />
          <span className={styles.photoBadge}>{vehicle.photos.length} fotos <ArrowIcon direction="up-right" /></span>
        </Link>
        <div className={styles.cardBody}>
          <span className={styles.eyebrow}>{vehicleSpec(vehicle, 'Año')} · {vehicleSpec(vehicle, 'Combustible')}</span>
          <h3><Link href={href}>{vehicle.title}</Link></h3>
          <div className={styles.chips}><span>{vehicleSpec(vehicle, 'Millaje')}</span><span>{vehicleSpec(vehicle, 'Transmisión')}</span><span>{vehicleSpec(vehicle, 'Exterior')}</span></div>
          <div className={styles.cardPrice}><p className={styles.price}>{money.format(vehicle.price / 100)}</p><span className={styles.priceLabel}>Precio de venta · USD</span></div>
          <Link href={href} className={styles.primary} aria-label={`Ver ${vehicle.title}`}>Ver vehículo <ArrowIcon direction="right" /></Link>
        </div>
      </article>;
    })}
  </div>;
}
