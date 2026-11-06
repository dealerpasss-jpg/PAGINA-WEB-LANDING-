import 'server-only';
import Link from 'next/link';
import { vehicleCatalogue } from '@/data/vehicle-catalogue';
import { publicationManifest } from '@/lib/vehicles/publication-registry';
import { availabilityCopy, projectCatalogue, publicPrice } from '@/lib/vehicles/publication';

// Render only inside the administrator gate. Accept only the source fields that
// determine the public state; never serialize notes, expenses or private media.
export default function PublicationStatus({id,catalogueSlug,status,asking}:{id:string;catalogueSlug?:string|null;status:string;asking:number|null}) {
 const entry=publicationManifest.find(p=>p.enabled&&(p.vehicleId?p.vehicleId===id:p.inventorySlug===catalogueSlug));
 const vehicle=entry&&projectCatalogue(vehicleCatalogue,[entry],[{id,catalogue_slug:catalogueSlug??null,status,asking_cents:asking}])[0];
 return <section className="account-card investment-publication" aria-labelledby="publication-heading">
  <div><span className="kicker">CATÁLOGO PÚBLICO</span><h2 id="publication-heading">{vehicle?'Así aparece en la página':'Solo en tu inventario privado'}</h2></div>
  {vehicle?<><p className="investment-publication-state"><strong>{availabilityCopy[vehicle.availability??'unverified'].label}</strong><span>{publicPrice(vehicle)}</span></p><p>{entry?.previewPriceCents!==undefined?'Esta ficha tiene un precio público de adelanto aprobado por separado. No utiliza tu referencia privada ni se ofrece como disponible. Cambiar esa política requiere revisar la publicación.':'El estado y el precio de referencia se sincronizan al guardar la ficha. Con conexión, el catálogo visible vuelve a consultar cada minuto y al regresar a la pestaña.'}</p><Link className="account-action" href={`/vehiculos/${vehicle.slug}`}>Ver ficha pública ↗</Link></>:<p>Este carro no tiene una publicación vinculada. Guardar datos o subir fotos aquí no los hace públicos.</p>}
  <small>La compra, los gastos, las ganancias y las notas de administración permanecen privados. Solo se muestran las fotos y los datos ya aprobados para el catálogo.</small>
 </section>;
}
