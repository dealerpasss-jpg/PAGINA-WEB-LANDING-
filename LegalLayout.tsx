export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-texture-cream py-16 md:py-24">
      <div className="container-content">
        <div className="mx-auto max-w-2xl">
          <span className="eyebrow-light"><span className="dot" />Documento legal — borrador</span>
          <h1 className="mt-4 text-3xl md:text-4xl">{title}</h1>
          {updated && <p className="mt-2 text-sm text-black/60">Última actualización: {updated}</p>}

          <div className="mt-6 rounded-card border-2 border-neon bg-charcoal p-4 text-sm text-cream">
            Este documento es un borrador estructural generado como punto de partida. Debe ser revisado y aprobado por un
            abogado antes de publicarse como versión definitiva.
          </div>

          <div className="prose prose-neutral mt-10 max-w-none prose-headings:font-display prose-headings:font-extrabold prose-a:text-black prose-a:underline">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
