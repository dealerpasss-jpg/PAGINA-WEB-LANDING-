import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import { getWhatsappUrl } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Contacto | DealerPass",
  description: "Habla con un asesor de DealerPass y recibe información sobre planes, acceso y educación en subastas.",
};

export default function ContactoPage() {
  return (
    <section className="bg-texture-cream py-16 md:py-24">
      <div className="container-content grid gap-12 md:grid-cols-2">
        <div>
          <span className="eyebrow-light"><span className="dot" />Contacto</span>
          <h1 className="mt-4 text-4xl md:text-5xl">Hablemos de tu próxima subasta.</h1>
          <p className="mt-4 max-w-md leading-relaxed text-black/70">
            Cuéntanos tu objetivo y tu experiencia. Un asesor de DealerPass te contactará por WhatsApp o correo
            electrónico.
          </p>
          <a href={getWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-outline-dark mt-6 inline-flex">
            Escribir por WhatsApp
          </a>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
