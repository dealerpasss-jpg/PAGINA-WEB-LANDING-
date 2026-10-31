import { Suspense } from 'react';
import type { Metadata } from 'next';
import VehicleExplorer from '@/components/VehicleExplorer';
import VehicleExplorerFallback from '@/components/VehicleExplorerFallback';
import { readPublicCatalogue } from '@/lib/vehicles/publication-server';
import styles from './vehicles.module.css';

export const metadata: Metadata = {
  title: 'Vehículos | DealerPass',
  description: 'Explora el inventario de DealerPass. Fotos, precios y características de cada vehículo, en un solo lugar.',
};

export default async function Vehicles() {
  const vehicleCatalogue=await readPublicCatalogue();
  return <section className={`wrap ${styles.page}`}>
    <header className={styles.heading}><span className="kicker"><i /> VEHÍCULOS DEALERPASS</span><h1>Tu próximo carro,<br /><span>en cada detalle.</span></h1><p>Fotos, características y precios claros. Explora el inventario y conoce cada vehículo antes de dar el siguiente paso.</p></header>
    <Suspense fallback={<VehicleExplorerFallback vehicles={vehicleCatalogue} />}><VehicleExplorer vehicles={vehicleCatalogue} /></Suspense>
  </section>;
}
