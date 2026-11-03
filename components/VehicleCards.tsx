import Image from 'next/image';
import Link from 'next/link';
import ArrowIcon from '@/components/ArrowIcon';
import type { CatalogueVehicle } from '@/data/vehicle-catalogue';
import { vehicleSpec } from '@/lib/vehicles/catalogue';
import CatalogueAvailability from './CatalogueAvailability';
import { availabilityCopy, publicPrice } from '@/lib/vehicles/publication';
import styles from '@/app/vehiculos/vehicles.module.css';



// One card implementation also powers the home teaser and related inventory.
export function VehicleCard({vehicle,priority=false,search=''}:{vehicle:CatalogueVehicle;priority?:boolean;search?:string}) {
  const href = `/vehiculos/${vehicle.slug}${search ? `?${search}` : ""}`;
  const comingSoon=vehicle.availability==='coming-soon';
  return <article className={styles.card} data-availability={vehicle.availability??'unverified'}>
        {comingSoon&&<div className={styles.launchHeader}>
          <div><span>ADELANTO DEALERPASS</span><strong>Próximamente.</strong></div>
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m8 9 7 7-7 7m9-14 7 7-7 7"/></svg>
        </div>}
        <Link href={href} prefetch={false} className={`${styles.cover}${vehicle.photoNotice ? ' '+styles.provisionalCover : ''}`} aria-label={`Ver fotos y detalles de ${vehicle.title}`}>
          <Image src={vehicle.photos[0].src} alt={`${vehicle.title}: ${vehicle.photos[0].caption}`} width={1448} height={1086} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" priority={priority} />
          {vehicle.referenceImage&&<span className={styles.referenceBadge}>Imagen de referencia</span>}
          <span className={styles.photoBadge}>{vehicle.photos.length} {vehicle.photos.length===1?'foto':'fotos'} <ArrowIcon direction="up-right" /></span>
        </Link>
        <div className={styles.cardBody}>{comingSoon?<p className={styles.launchAvailability}>No disponible para compra todavía.</p>:<CatalogueAvailability status={vehicle.availability}/>}
          <span className={styles.eyebrow}>{['Año', 'Combustible'].map(key => vehicleSpec(vehicle, key)).filter(Boolean).join(' · ')}</span>
          <h3><Link href={href}>{vehicle.title}</Link></h3>
          {comingSoon&&<p className={styles.launchIntro}>Un primer vistazo. Mira sus fotos y conoce los detalles de lo que viene.</p>}
          {vehicle.photoNotice&&<p className={styles.provisionalNote}>{vehicle.photoNotice}</p>}
          <div className={styles.chips}>{['Millaje','Transmisión','Exterior'].map(key=>vehicleSpec(vehicle,key)).filter(Boolean).map(value=><span key={value}>{value}</span>)}</div>
          <div className={styles.cardPrice}><p className={`${styles.price}${vehicle.price===null?' '+styles.pricePending:''}`}>{publicPrice(vehicle)}</p><span className={styles.priceLabel}>{vehicle.availability==='not-for-sale'?'Vehículo de uso del equipo':vehicle.availability==='sold'?'Ya no disponible':vehicle.price===null?'Consulta el estado actual':'Precio de referencia · USD'}</span></div>
          <Link href={href} prefetch={false} className={`${styles.primary}${comingSoon?' '+styles.launchAction:''}`} data-dp-button="primary" aria-label={`${availabilityCopy[vehicle.availability??'unverified'].action}: ${vehicle.title}`}>{availabilityCopy[vehicle.availability??'unverified'].action} <ArrowIcon direction="right" /></Link>
        </div>
      </article>;
}

export default function VehicleCards({ vehicles, priority = false, search = '' }: { vehicles: CatalogueVehicle[]; priority?: boolean; search?: string }) {
  return <div className={styles.inventoryGrid}>{vehicles.map((vehicle,index)=><VehicleCard key={vehicle.slug} vehicle={vehicle} priority={priority&&index===0} search={search}/>)}</div>;
}
