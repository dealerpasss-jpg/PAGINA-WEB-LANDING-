'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { investmentQuery } from '@/lib/investments/view';
import ArrowIcon from '@/components/ArrowIcon';
export default function InventoryReturnLink() {
 const query=investmentQuery(useSearchParams());
 return <Link prefetch={false} href={`/mi-cuenta/inversiones${query?`?${query}`:''}#inventario`}><ArrowIcon direction="left"/>{query?'Volver a mis resultados':'Todos mis vehículos'}</Link>;
}
