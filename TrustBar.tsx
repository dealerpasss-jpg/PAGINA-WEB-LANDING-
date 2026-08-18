const items = [
  "Dealer certificado",
  "Acceso a múltiples subastas",
  "Formación 100% en español",
  "Acompañamiento paso a paso",
];

export default function TrustBar() {
  return (
    <section className="bg-texture-charcoal">
      <div className="container-content grid grid-cols-2 gap-x-6 gap-y-8 py-12 md:grid-cols-4 md:gap-8 md:py-16">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-sm bg-neon/15 text-neon">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 6.5L4.7 9L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-sm font-medium text-cream/85">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
