'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { catalogueQuery } from '@/lib/vehicles/catalogue';
import ArrowIcon from './ArrowIcon';
import styles from '@/app/vehiculos/vehicles.module.css';

export default function CatalogueReturnLink() {
  const params = useSearchParams();
  const query = catalogueQuery(params);
  return <Link href={`/vehiculos${query ? `?${query}` : ''}`} className={styles.back}><ArrowIcon direction="left" />{query ? 'Volver a los resultados' : 'Todos los vehículos'}</Link>;
}
