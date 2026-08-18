import { IconCompass, IconChecklist, IconMagnifier, IconTarget } from "./Icons";

const steps = [
  {
    icon: IconCompass,
    title: "Elige tu ruta",
    body: "Define si quieres comprar para uso personal, aprender a revender o acceder de forma recurrente.",
  },
  {
    icon: IconChecklist,
    title: "Prepárate",
    body: "Completa tu información, conoce los términos y aprende los fundamentos antes de participar.",
  },
  {
    icon: IconMagnifier,
    title: "Analiza",
    body: "Utiliza el Método MARGEN y las herramientas de DealerPass para evaluar el vehículo.",
  },
  {
    icon: IconTarget,
    title: "Compra con criterio",
    body: "Define tu oferta máxima, conoce tus responsabilidades y participa según las condiciones de la plataforma y el plan.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="border-y border-edge bg-texture-charcoal py-16 md:py-24">
      <div className="container-content">
        <span className="eyebrow">Cómo funciona</span>
        <h2 className="mt-4 max-w-xl text-3xl text-cream md:text-4xl">
          Un proceso claro, en cuatro pasos.
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md border border-edge bg-black text-neon">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-2xl font-extrabold text-neon/40">0{i + 1}</span>
                {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-edge md:block" />}
              </div>
              <h3 className="mt-4 font-display text-lg font-extrabold text-cream">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
