import { testimonials } from "@/data/testimonials";
import { IconStar } from "./Icons";
import CountUp from "./CountUp";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TestimonialCard({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <div className="card w-[300px] flex-none">
      <div className="flex items-center gap-3">
        {t.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatarUrl} alt={t.name} className="h-11 w-11 flex-none rounded-full object-cover" />
        ) : (
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-neon/15 font-display text-sm font-extrabold text-neon">
            {initials(t.name)}
          </span>
        )}
        <div>
          <p className="font-display text-sm font-extrabold text-cream">{t.name}</p>
          <div className="mt-0.5 flex gap-0.5 text-neon">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar key={i} className="h-3.5 w-3.5" filled={i < t.stars} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-cream/80">&ldquo;{t.quote}&rdquo;</p>
    </div>
  );
}

export default function SocialProofMarquee() {
  return (
    <section className="border-b border-edge bg-texture-charcoal py-14 md:py-20">
      <div className="container-content">
        <span className="eyebrow">Comunidad DealerPass</span>
        <h2 className="mt-3 max-w-xl text-2xl text-cream md:text-3xl">
          Personas que ya están aprendiendo a comprar con criterio.
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Más de <span className="font-display font-extrabold text-neon"><CountUp end={1500} />+</span> personas
          están aprendiendo con nuestro método en el mundo de las subastas.
        </p>
      </div>

      <div className="ticker-wrap mt-8">
        <div className="ticker-track ticker-track-slow">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex gap-4 pr-4">
              {testimonials.map((t, i) => (
                <TestimonialCard key={`${rep}-${i}`} t={t} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
