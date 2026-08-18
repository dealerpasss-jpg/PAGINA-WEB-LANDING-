"use client";

import { motion } from "framer-motion";
import { IconAccess, IconEducation, IconTools, IconSupport } from "./Icons";

const cards = [
  {
    icon: IconAccess,
    title: "Acceso profesional",
    body: "Accede a las plataformas disponibles mediante dealers certificados y conoce claramente las condiciones de cada operación.",
  },
  {
    icon: IconEducation,
    title: "Educación paso a paso",
    body: "Aprende el proceso en español, desde la búsqueda del vehículo hasta su compra y comercialización.",
  },
  {
    icon: IconTools,
    title: "Herramientas de análisis",
    body: "Calcula costos, reparación, contingencia, margen y oferta máxima antes de pujar.",
  },
  {
    icon: IconSupport,
    title: "Acompañamiento",
    body: "Recibe orientación, participa en sesiones de análisis y resuelve dudas dentro de una comunidad especializada.",
  },
];

export default function BenefitCards() {
  return (
    <section className="bg-texture-cream py-16 md:py-24">
      <div className="container-content">
        <div className="max-w-2xl">
          <span className="eyebrow-light"><span className="dot" />El acceso es solo el comienzo</span>
          <h2 className="mt-4 text-3xl md:text-4xl">
            Tener acceso te permite entrar. Saber analizar te permite comprar bien.
          </h2>
          <p className="mt-4 leading-relaxed text-black/70">
            Antes de pujar necesitas entender el título, los antecedentes, las reparaciones, los fees, el transporte, el
            mercado y la salida del vehículo. DealerPass reúne en un mismo lugar el acceso, la educación y las
            herramientas necesarias para tomar decisiones más informadas.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              className="card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neon/10 text-neon">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-extrabold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
