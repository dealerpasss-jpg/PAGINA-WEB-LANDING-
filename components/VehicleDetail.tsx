import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArrowIcon from './ArrowIcon';
import VehicleGallery from './VehicleGallery';
import VehicleCards from './VehicleCards';
import { vehicleCatalogue } from '@/data/vehicle-catalogue';
import { vehicleMake, vehicleSpec } from '@/lib/vehicles/catalogue';
import styles from '@/app/vehiculos/vehicles.module.css';

const money = new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function VehicleDetail({ slug }: { slug: string }) {
  const vehicle = vehicleCatalogue.find(item => item.slug === slug);
  if (!vehicle) notFound();
  const year = vehicleSpec(vehicle, 'Año');
  const model = vehicle.title.replace(new RegExp(` ${year}$`), '');
  const related = vehicleCatalogue.filter(item => item.slug !== slug).sort((a, b) => Number(vehicleMake(b) === vehicleMake(vehicle)) - Number(vehicleMake(a) === vehicleMake(vehicle))).slice(0, 3);
  return <section className={`wrap ${styles.page}`}>
    <Link href="/vehiculos" className={styles.back}><ArrowIcon direction="left" /> Todos los vehículos</Link>
    <header className={styles.detailHeading}><span className="kicker">DEALERPASS / INVENTARIO</span><h1>{model} <span>{year}</span></h1><p>{vehicleSpec(vehicle, 'Millaje').replace(' mi', ' millas')} · {slug === 'subaru-impreza-2016' ? 'Hatchback' : 'SUV'} · {vehicleSpec(vehicle, 'Transmisión')}</p></header>
    <div className={styles.detailGrid}>
      <VehicleGallery photos={vehicle.photos} vehicle={vehicle.title} />
      <aside className={styles.summary} aria-label="Precio y consulta del vehículo"><span className={styles.eyebrow}>PRECIO DE VENTA · USD</span><p className={styles.price}>{money.format(vehicle.price / 100)}</p><p className={styles.description}>{vehicle.description}</p><div className={styles.summaryHighlights}><div><span>Año</span><strong>{year}</strong></div><div><span>Millaje</span><strong>{vehicleSpec(vehicle, 'Millaje')}</strong></div><div><span>Transmisión</span><strong>{vehicleSpec(vehicle, 'Transmisión')}</strong></div></div><a href="#caracteristicas" className={styles.detailLink}>Ver todas las características <ArrowIcon direction="down" /></a><Link href="/contacto" className={styles.primary}>Ver opciones de contacto <ArrowIcon direction="up-right" /></Link><p className={styles.note}>El canal de atención está en preparación. Esta ficha no recibe pagos ni reservas.</p><div className={styles.consultationNote}><span aria-hidden="true">i</span><p>Revisa las fotografías originales y confirma los datos con el vendedor antes de tomar una decisión.</p></div></aside>
      <section className={styles.vehicleFacts} id="caracteristicas" aria-labelledby="facts-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>CONOCE EL VEHÍCULO</span><h2 id="facts-title">Los detalles importan.</h2></div><dl className={styles.specs}>{vehicle.specs.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl><p className={styles.note}>*Según información proporcionada por el vendedor. {slug === 'ford-escape-se-2016' ? 'Millaje mostrado en la foto del tablero.' : 'Millaje y datos declarados por el vendedor.'}</p></section>
    </div>
    <section className={styles.related} aria-labelledby="related-title"><div className={styles.relatedHeading}><div><span className={styles.eyebrow}>MÁS DEL INVENTARIO</span><h2 id="related-title">Sigue explorando.</h2></div><Link href="/vehiculos">Ver todos los vehículos <ArrowIcon direction="right" /></Link></div><VehicleCards vehicles={related} /></section>
  </section>;
}
