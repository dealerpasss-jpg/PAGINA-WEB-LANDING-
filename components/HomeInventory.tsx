
'use client';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from './Reveal';
import ArrowIcon from './ArrowIcon';
import CatalogueAvailability from './CatalogueAvailability';
import { VehicleCard } from './VehicleCards';
import { publicPrice } from '@/lib/vehicles/publication';
import { useLiveCatalogue } from '@/lib/vehicles/use-live-catalogue';
import type { CatalogueVehicle } from '@/data/vehicle-catalogue';
export default function HomeInventory({initial}:{initial:CatalogueVehicle[]}) {
 const vehicleCatalogue=useLiveCatalogue(initial);
 return (      <section className="he-section he-inventory" aria-labelledby="inventory-home-title">
        <Reveal className="he-intro"><div><span className="he-eyebrow">04 / VEHÍCULOS DEALERPASS</span><h2 id="inventory-home-title">Cada carro,<br /><span>con su propia historia.</span></h2></div><div><p>Explora fotografías, características y precios. Revisa cada detalle antes de dar el siguiente paso.</p><Link href="/vehiculos" className="he-inline-link">Ver los {vehicleCatalogue.length} vehículos <ArrowIcon /></Link></div></Reveal>
        <div className="he-inventory-grid">{vehicleCatalogue.slice(0,3).map(vehicle => vehicle.availability==='coming-soon'?<VehicleCard key={vehicle.slug} vehicle={vehicle}/>:<Link className="he-vehicle" prefetch={false} href={`/vehiculos/${vehicle.slug}`} key={vehicle.slug}>
          <div className="he-vehicle-image"><Image src={vehicle.photos[0].src} alt={vehicle.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"/><span>{vehicle.photos.length} {vehicle.photos.length===1?'foto':'fotos'} <ArrowIcon direction="up-right" /></span></div>
          <div className="he-vehicle-meta"><div><CatalogueAvailability status={vehicle.availability}/></div><span>{['Millaje','Transmisión'].map(key=>vehicle.specs.find(([label])=>label===key)?.[1]).filter(Boolean).join(' · ')}</span><h3>{vehicle.title}</h3><div className="he-vehicle-price-row"><strong>{publicPrice(vehicle)}</strong><span className="he-vehicle-arrow">Ver carro <ArrowIcon /></span></div></div>
        </Link>)}</div><p className="he-disclosure">Datos proporcionados por el vendedor. Consulta condiciones y fotografías en cada ficha.</p>
      </section>
);
}
