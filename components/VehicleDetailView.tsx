'use client';
import Link from 'next/link';
import { Suspense } from 'react';
import CatalogueReturnLink from './CatalogueReturnLink';

import ArrowIcon from './ArrowIcon';
import VehicleGallery from './VehicleGallery';
import VehicleCards from './VehicleCards';
import type { CatalogueVehicle } from '@/data/vehicle-catalogue';
import { useLiveCatalogue } from '@/lib/vehicles/use-live-catalogue';
import { availabilityCopy, publicPrice } from '@/lib/vehicles/publication';
import CatalogueAvailability from './CatalogueAvailability';
import { vehicleMake, vehicleSpec } from '@/lib/vehicles/catalogue';
import styles from '@/app/vehiculos/vehicles.module.css';



export default function VehicleDetailView({ slug,initial }: { slug:string;initial:CatalogueVehicle[] }) {
  const vehicleCatalogue=useLiveCatalogue(initial);
  const vehicle = vehicleCatalogue.find(item => item.slug === slug);
  if (!vehicle) return <section className={`wrap ${styles.page}`}><h1>Esta ficha ya no está publicada.</h1><Link href="/vehiculos">Explorar el inventario</Link></section>;
  const year = vehicleSpec(vehicle, 'Año');
  const model = vehicle.title.replace(new RegExp(` ${year}$`), '');
  const related = vehicleCatalogue.filter(item => item.slug !== slug).sort((a, b) => Number(vehicleMake(b) === vehicleMake(vehicle)) - Number(vehicleMake(a) === vehicleMake(vehicle))).slice(0, 3);
  return <section className={`wrap ${styles.page}`}>
    <Suspense fallback={<Link href="/vehiculos" className={styles.back}><ArrowIcon direction="left" /> Todos los vehículos</Link>}><CatalogueReturnLink /></Suspense>
    <header className={styles.detailHeading}><span className="kicker">DEALERPASS / INVENTARIO</span><h1>{model} <span>{year}</span></h1><p>{vehicleSpec(vehicle, 'Millaje').replace(' mi', ' millas')} · {vehicle.bodyStyle ?? (slug === 'subaru-impreza-2016' ? 'Hatchback' : 'SUV')}{vehicleSpec(vehicle, 'Transmisión') && ' · '+vehicleSpec(vehicle, 'Transmisión')}</p></header>
    <div className={styles.detailGrid}>
      <VehicleGallery photos={vehicle.photos} vehicle={vehicle.title} notice={vehicle.photoNotice} originalPhotos={vehicle.originalPhotos} />
      <aside className={styles.summary} aria-label="Precio y consulta del vehículo"><CatalogueAvailability status={vehicle.availability}/><p className={styles.availabilityMessage}>{availabilityCopy[vehicle.availability??'unverified'].detail}</p><span className={styles.eyebrow}>{vehicle.availability==='sold'?'VEHÍCULO VENDIDO':'PRECIO DE REFERENCIA · USD'}</span><p className={`${styles.price}${vehicle.price===null?' '+styles.pricePending:''}`}>{publicPrice(vehicle)}</p><p className={styles.description}>{vehicle.description}</p><div className={styles.summaryHighlights}><div><span>Año</span><strong>{year}</strong></div><div><span>Millaje</span><strong>{vehicleSpec(vehicle, 'Millaje')}</strong></div>{vehicleSpec(vehicle, 'Transmisión') ? <div><span>Transmisión</span><strong>{vehicleSpec(vehicle, 'Transmisión')}</strong></div> : <div><span>Carrocería</span><strong>{vehicle.bodyStyle}</strong></div>}</div><a href="#caracteristicas" className={styles.detailLink}>Ver todas las características <ArrowIcon direction="down" /></a>{vehicle.availability==='available'?<><Link href="/contacto" className={styles.primary} data-dp-button="primary">Ver opciones de contacto <ArrowIcon direction="up-right" /></Link><p className={styles.note}>El canal de atención está en preparación. Esta ficha no recibe pagos ni reservas.</p></>:<Link href="/vehiculos" className={styles.secondary} data-dp-button="secondary">Explorar otros vehículos <ArrowIcon direction="right"/></Link>}<div className={styles.consultationNote}><span aria-hidden="true">i</span><p>{vehicle.photoNotice ? 'Solicita fotografías actuales y confirma la condición con el vendedor antes de tomar una decisión.' : 'Revisa las fotografías originales y confirma los datos con el vendedor antes de tomar una decisión.'}</p></div></aside>
      <section className={styles.vehicleFacts} id="caracteristicas" aria-labelledby="facts-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>CONOCE EL VEHÍCULO</span><h2 id="facts-title">Los detalles importan.</h2></div><dl className={styles.specs}>{vehicle.specs.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl><p className={styles.note}>*Según información proporcionada por el vendedor. {slug === 'ford-escape-se-2016' ? 'Millaje mostrado en la foto del tablero.' : 'Millaje y datos declarados por el vendedor.'}</p></section>
    </div>
    <section className={styles.related} aria-labelledby="related-title"><div className={styles.relatedHeading}><div><span className={styles.eyebrow}>MÁS DEL INVENTARIO</span><h2 id="related-title">Sigue explorando.</h2></div><Link href="/vehiculos">Ver todos los vehículos <ArrowIcon direction="right" /></Link></div><VehicleCards vehicles={related} /></section>
  </section>;
}
