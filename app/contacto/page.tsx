import Link from "next/link";
import { readPublicCatalogue } from "@/lib/vehicles/publication-server";
import { availabilityCopy } from "@/lib/vehicles/publication";
import ArrowIcon from "@/components/ArrowIcon";
import LeadForm from "@/components/LeadForm";
import { getWhatsappUrl } from "@/lib/analytics";
export const dynamic = "force-dynamic";
export const metadata = { title: "Contacto | DealerPass", description: "Consulta los vehículos y las opciones de atención de DealerPass." };
export default async function ContactoPage({searchParams}:{searchParams:Promise<{vehiculo?:string|string[]}>}) {
  const requested=(await searchParams).vehiculo;
  const vehicle=typeof requested==='string'&&requested.length<=100 ? (await readPublicCatalogue()).find(v=>v.slug===requested) : undefined;
  const vehicleIntent = requested !== undefined;
  const available = vehicle?.availability === 'available';
  const wa = vehicleIntent && !available ? '/contacto' : getWhatsappUrl(vehicle?`Hola, quiero consultar el ${vehicle.title}: https://dealerpasss.com/vehiculos/${vehicle.slug}`:undefined);
  return (
    <section className="section wrap contact-grid">
      <div>
        <span className="kicker">
          <i />
          HABLEMOS
        </span>
        <h1>
          {vehicleIntent ? 'Consulta de inventario.' : <>Encuentra tu<br />próximo vehículo.</>}
        </h1>
        <p>
          {vehicle ? `${vehicle.title}. ${availabilityCopy[vehicle.availability ?? 'unverified'].detail}` : vehicleIntent ? 'Esta consulta no corresponde a una ficha publicada. Puedes volver al inventario para elegir otro vehículo.' : 'Explora el inventario y revisa la disponibilidad, las fotografías y los detalles de cada carro.'}
        </p>
        {wa !== "/contacto" && (
          <a
            className="text-link"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
          >
            Escribir por WhatsApp <ArrowIcon />
          </a>
        )}
        <div className="contact-signature">
          Acceso.
          <br />
          Criterio.
          <br />
          Control.
          <span />
        </div>
      </div>
      {vehicleIntent ? <div className="contact-unavailable">
        <span className="kicker">CONSULTA DE INVENTARIO</span>
        <h2>{vehicle?.title ?? 'Ficha no disponible'}</h2>
        {vehicle && <p><strong>{availabilityCopy[vehicle.availability ?? 'unverified'].label}</strong></p>}
        <p>{!vehicle ? 'No hemos enviado ninguna consulta. Elige una ficha del catálogo para consultar sus detalles.' : !available ? 'Este vehículo no está disponible para consultar una compra. Puedes revisar su ficha o explorar los vehículos disponibles.' : wa === '/contacto' ? 'El canal comercial todavía está en preparación. Desde esta página no se envían consultas, pagos ni reservas.' : 'Abre WhatsApp para consultar este carro con su ficha incluida en el mensaje. No se realiza ningún pago ni reserva desde esta página.'}</p>
        <div className="contact-vehicle-actions">
          {wa !== '/contacto' && <a className="button" href={wa} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>}
          {vehicle && <Link className="text-link" href={`/vehiculos/${vehicle.slug}`}>Volver a la ficha del carro</Link>}
          <Link className="text-link" href="/vehiculos?disponibilidad=available">Ver vehículos disponibles</Link>
        </div>
      </div> : <LeadForm available={!!process.env.LEAD_FORM_WEBHOOK_URL} />}
    </section>
  );
}
