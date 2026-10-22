import LeadForm from "@/components/LeadForm";
import { getWhatsappUrl } from "@/lib/analytics";
export default function ContactoPage() {
  const wa = getWhatsappUrl();
  return (
    <section className="section wrap contact-grid">
      <div>
        <span className="kicker">
          <i />
          HABLEMOS
        </span>
        <h1>
          Tu próxima etapa
          <br />
          empieza aquí.
        </h1>
        <p>
          Cuéntanos qué quieres lograr y en qué punto te encuentras. El equipo
          de DealerPass te ayudará a entender las opciones.
        </p>
        {wa !== "/contacto" && (
          <a
            className="text-link"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
          >
            Escribir por WhatsApp ↗
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
      <LeadForm />
    </section>
  );
}
