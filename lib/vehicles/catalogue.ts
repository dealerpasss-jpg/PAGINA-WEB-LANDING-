import type { CatalogueVehicle } from '../../data/vehicle-catalogue.ts';

export const catalogueSorts = ['featured', 'price-asc', 'price-desc', 'year-desc', 'mileage-asc'] as const;
export type CatalogueSort = typeof catalogueSorts[number];
export type CatalogueFilters = { query: string; make: string; sort: CatalogueSort };
export const defaultCatalogueFilters: CatalogueFilters = { query: '', make: '', sort: 'featured' };

export function vehicleSpec(vehicle: CatalogueVehicle, name: string) {
  return vehicle.specs.find(([key]) => key === name)?.[1] || '';
}
export function vehicleMake(vehicle: CatalogueVehicle) {
  return vehicle.title.split(' ')[0];
}
function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}
export function readCatalogueFilters(params: Pick<URLSearchParams, 'get'>): CatalogueFilters {
  const sort = params.get('orden') || 'featured';
  return {
    query: (params.get('buscar') || '').slice(0, 100),
    make: (params.get('marca') || '').slice(0, 30),
    sort: catalogueSorts.includes(sort as CatalogueSort) ? sort as CatalogueSort : 'featured',
  };
}
export function filterCatalogue(vehicles: CatalogueVehicle[], filters: CatalogueFilters) {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean);
  const result = vehicles.filter(vehicle => {
    const text = normalize([vehicle.title, ...vehicle.specs.map(([, value]) => value)].join(' '));
    return (!filters.make || normalize(vehicleMake(vehicle)) === normalize(filters.make)) && words.every(word => text.includes(word));
  });
  const number = (vehicle: CatalogueVehicle, name: string) => Number(vehicleSpec(vehicle, name).replace(/\D/g, ''));
  if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (filters.sort === 'year-desc') result.sort((a, b) => number(b, 'Año') - number(a, 'Año'));
  if (filters.sort === 'mileage-asc') result.sort((a, b) => number(a, 'Millaje') - number(b, 'Millaje'));
  return result;
}
