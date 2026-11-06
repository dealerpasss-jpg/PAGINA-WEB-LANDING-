import type { CatalogueVehicle } from '@/data/vehicle-catalogue';
import { vehicleMake } from '@/lib/vehicles/catalogue';
import VehicleCards from './VehicleCards';
import styles from '@/app/vehiculos/vehicles.module.css';

// The controls reserve the exact hydrated layout; no artificial waiting screen.
export default function VehicleExplorerFallback({ vehicles }: { vehicles: CatalogueVehicle[] }) {
  const makes = [...new Set(vehicles.map(vehicleMake))];
  return <section aria-labelledby="inventory-loading-title">
    <div className={styles.inventoryLabel}><h2 id="inventory-loading-title">Encuentra el que va contigo.</h2><span className={styles.inventoryCount}>{vehicles.length} vehículos publicados</span></div>
    <div className={styles.explorerControls} aria-hidden="true"><label className={styles.searchField}><span>Busca por modelo o característica</span><input type="search" disabled placeholder="Preparando búsqueda…" /></label><label className={styles.sortField}><span>Ordenar por</span><select disabled><option>Orden del catálogo</option></select></label></div>
    <div className={styles.explorerMeta}><div className={styles.makeFilters} aria-hidden="true"><button data-dp-button="chip" disabled aria-pressed="true">Todas las marcas</button>{makes.map(make => <button data-dp-button="chip" disabled key={make}>{make}<span>{vehicles.filter(vehicle => vehicleMake(vehicle) === make).length}</span></button>)}</div><p className={styles.resultCount} role="status">Preparando filtros…</p></div>
    <VehicleCards vehicles={vehicles} priority />
  </section>;
}
