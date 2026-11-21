import type { Availability } from './publication.ts';
import type { CatalogueVehicle } from '../../data/vehicle-catalogue.ts';

export const catalogueSorts = ['featured', 'price-asc', 'price-desc', 'year-desc', 'mileage-asc'] as const;
export type CatalogueSort = typeof catalogueSorts[number];
export const catalogueAvailability = ['available', 'coming-soon', 'sold', 'unverified'] as const;
export const catalogueBodyTypes = [
  { value: 'suv', label: 'SUV y crossovers' },
  { value: 'sedan', label: 'Sedán' },
  { value: 'hatchback', label: 'Hatchback' },
] as const;
export type CatalogueBodyType = typeof catalogueBodyTypes[number]['value'];
export type CatalogueFilters = { query: string; make: string; sort: CatalogueSort; availability: Availability | ''; bodyType: CatalogueBodyType | '' };
export const defaultCatalogueFilters: CatalogueFilters = { query: '', make: '', sort: 'featured', availability: '', bodyType: '' };

// Legacy listings without bodyStyle: classify their exact published variant.
// In particular, this Impreza is a hatchback, not a Crosstrek or SUV.
const legacyBodyTypes = new Map<string, CatalogueBodyType>([
  ['ford-escape-se-2016', 'suv'],
  ['ford-edge-2021', 'suv'],
  ['ford-edge-titanium-2018', 'suv'],
  ['ford-explorer-xlt-2013', 'suv'],
  ['subaru-forester-2015', 'suv'],
  ['subaru-impreza-2016', 'hatchback'],
]);

export function vehicleSpec(vehicle: CatalogueVehicle, name: string) {
  return vehicle.specs.find(([key]) => key === name)?.[1] || '';
}
export function vehicleMake(vehicle: CatalogueVehicle) {
  const first = vehicle.title.split(' ')[0];
  return first === 'Mazda6' ? 'Mazda' : first;
}
function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}
export function vehicleBodyType(vehicle: CatalogueVehicle): CatalogueBodyType | '' {
  const type = normalize(vehicle.bodyStyle ?? '');
  if (type === 'crossover') return 'suv';
  return catalogueBodyTypes.find(option => option.value === type)?.value
    ?? (type ? '' : legacyBodyTypes.get(vehicle.slug) ?? '');
}
export function readCatalogueFilters(params: Pick<URLSearchParams, 'get'>): CatalogueFilters {
  const sort = params.get('orden') || 'featured';
  const availability = params.get('disponibilidad') || '';
  const bodyType = normalize(params.get('tipo') || '');
  return {
    availability: catalogueAvailability.includes(availability as Availability) ? availability as Availability : '',
    bodyType: catalogueBodyTypes.find(option => option.value === bodyType)?.value ?? '',
    query: (params.get('buscar') || '').slice(0, 100),
    make: (params.get('marca') || '').slice(0, 30),
    sort: catalogueSorts.includes(sort as CatalogueSort) ? sort as CatalogueSort : 'featured',
  };
}
export function filterCatalogue(vehicles: CatalogueVehicle[], filters: CatalogueFilters) {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean);
  const result = vehicles.filter(vehicle => {
    const text = normalize([vehicle.title, ...vehicle.specs.map(([, value]) => value)].join(' '));
    return (!filters.availability || (vehicle.availability ?? 'unverified') === filters.availability)
      && (!filters.bodyType || vehicleBodyType(vehicle) === filters.bodyType)
      && (!filters.make || normalize(vehicleMake(vehicle)) === normalize(filters.make))
      && words.every(word => text.includes(word));
  });
  const number = (vehicle: CatalogueVehicle, name: string) => Number(vehicleSpec(vehicle, name).replace(/\D/g, ''));
  const priceOrder = (a:CatalogueVehicle,b:CatalogueVehicle,direction:number) => a.price===null?(b.price===null?0:1):b.price===null?-1:(a.price-b.price)*direction;
  if (filters.sort === 'price-asc') result.sort((a, b) => priceOrder(a,b,1));
  if (filters.sort === 'price-desc') result.sort((a, b) => priceOrder(a,b,-1));
  if (filters.sort === 'year-desc') result.sort((a, b) => number(b, 'Año') - number(a, 'Año'));
  if (filters.sort === 'mileage-asc') result.sort((a, b) => number(a, 'Millaje') - number(b, 'Millaje'));
  return result;
}

export const catalogueParams = ['buscar', 'marca', 'tipo', 'orden', 'disponibilidad'] as const;
export type CatalogueParam = typeof catalogueParams[number];
export function updateCatalogueParams(params: Pick<URLSearchParams, 'toString'>, key: CatalogueParam, value: string) {
  const next = new URLSearchParams(params.toString());
  if (value && !(key === 'orden' && value === 'featured')) next.set(key, value); else next.delete(key);
  return next;
}
export function catalogueQuery(params: Pick<URLSearchParams, 'get'>) {
  const filters = readCatalogueFilters(params);
  const query = new URLSearchParams();
  if (filters.query) query.set('buscar', filters.query);
  if (filters.make) query.set('marca', filters.make);
  if (filters.bodyType) query.set('tipo', filters.bodyType);
  if (filters.availability) query.set('disponibilidad', filters.availability);
  if (filters.sort !== 'featured') query.set('orden', filters.sort);
  return query.toString();
}

// Available listings should lead to purchasable alternatives, not only teasers.
export function relatedVehicles(vehicles: CatalogueVehicle[], current: CatalogueVehicle, limit = 3) {
  return vehicles.filter(item => item.slug !== current.slug).sort((a, b) => {
    const availability = Number(b.availability === 'available') - Number(a.availability === 'available');
    if (availability) return availability;
    return Number(vehicleMake(b) === vehicleMake(current)) - Number(vehicleMake(a) === vehicleMake(current));
  }).slice(0, limit);
}
