'use client';

import { useSearchParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import type { CatalogueVehicle } from '@/data/vehicle-catalogue';
import { filterCatalogue, readCatalogueFilters, vehicleMake, updateCatalogueParams, catalogueQuery, type CatalogueParam } from '@/lib/vehicles/catalogue';
import { catalogueHistorySnapshot, replaceCatalogueHistory, subscribeCatalogueHistory } from '@/lib/vehicles/catalogue-history';
import VehicleCards from './VehicleCards';
import ArrowIcon from './ArrowIcon';
import styles from '@/app/vehiculos/vehicles.module.css';

export default function VehicleExplorer({ vehicles }: { vehicles: CatalogueVehicle[] }) {
  // Keep Next's navigation subscription/SSR snapshot, but never control an input
  // with its delayed history reflection: rapid typing otherwise drops characters.
  const routerParams = useSearchParams();
  const query = useSyncExternalStore(subscribeCatalogueHistory, catalogueHistorySnapshot, () => routerParams.toString());
  const params = new URLSearchParams(query);
  const filters = readCatalogueFilters(params);
  const matches = filterCatalogue(vehicles, filters);
  const makes = [...new Set(vehicles.map(vehicleMake))];
  const filtered = !!filters.query || !!filters.make;

  function update(key: CatalogueParam, value: string) {
    const next = updateCatalogueParams(new URLSearchParams(catalogueHistorySnapshot()), key, value);
    replaceCatalogueHistory(next);
  }
  function reset() {
    const next = new URLSearchParams(catalogueHistorySnapshot());
    ['buscar', 'marca', 'orden'].forEach(key => next.delete(key));
    replaceCatalogueHistory(next);
  }
  return <section aria-labelledby="inventory-title">
    <div className={styles.inventoryLabel}><h2 id="inventory-title">Encuentra el que va contigo.</h2><span className={styles.inventoryCount}>{vehicles.length} vehículos publicados</span></div>
    <div className={styles.explorerControls}>
      <label className={styles.searchField}><span>Busca por modelo o característica</span><div><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg><input type="search" value={filters.query} maxLength={100} onChange={event => update('buscar', event.target.value)} placeholder="Ej. Ford, 2016, blanco…" autoComplete="off" /></div></label>
      <label className={styles.sortField}><span>Ordenar por</span><select value={filters.sort} onChange={event => update('orden', event.target.value)}><option value="featured">Orden del catálogo</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="year-desc">Año: más reciente</option><option value="mileage-asc">Menor millaje</option></select></label>
    </div>
    <div className={styles.explorerMeta}>
      <div className={styles.makeFilters} role="group" aria-label="Filtrar por marca"><button data-dp-button="chip" type="button" aria-pressed={!filters.make} onClick={() => update('marca', '')}>Todas las marcas</button>{makes.map(make => <button data-dp-button="chip" type="button" key={make} aria-pressed={filters.make.toLowerCase() === make.toLowerCase()} onClick={() => update('marca', make)}>{make}<span>{vehicles.filter(vehicle => vehicleMake(vehicle) === make).length}</span></button>)}</div>
      <p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true">{filtered ? `${matches.length} de ${vehicles.length} vehículos` : `${matches.length} vehículos`}{(filtered || filters.sort !== 'featured') && <button data-dp-button="quiet" type="button" onClick={reset}>Restablecer</button>}</p>
    </div>
    {matches.length ? <VehicleCards vehicles={matches} priority search={catalogueQuery(params)} /> : <div className={styles.emptyResults}><span className={styles.eyebrow}>SIN COINCIDENCIAS</span><h3>Probemos con otra búsqueda.</h3><p>No hay vehículos que coincidan con estos filtros. Prueba otra marca, un modelo o un año.</p><button data-dp-button="primary" type="button" onClick={reset}>Ver todo el inventario <ArrowIcon direction="right" /></button></div>}
    <p className={styles.catalogueNote}>Datos proporcionados por el vendedor. Las portadas tienen el fondo editado; en cada ficha encontrarás también las fotografías originales.</p>
  </section>;
}
