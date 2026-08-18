import Link from "next/link";
import Logo from "./Logo";

const columns = [
  {
    title: "Plataforma",
    links: [
      { href: "/#como-funciona", label: "Cómo funciona" },
      { href: "/academy", label: "Academy" },
      { href: "/planes", label: "Planes" },
      { href: "/metodo-margen", label: "Método MARGEN" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "#", label: "WhatsApp" },
      { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#", label: "Instagram" },
      { href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#", label: "YouTube" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terminos", label: "Términos y condiciones" },
      { href: "/legal/privacidad", label: "Política de privacidad" },
      { href: "/legal/reembolsos", label: "Política de reembolsos" },
      { href: "/legal/disclaimer", label: "Disclaimer" },
      { href: "/legal/membresias", label: "Membresías y cancelación" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-texture-black">
      <div className="container-content py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="dark" />
            <p className="mt-3 text-sm text-muted">Access. Learn. Trade.</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="section-label mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-cream/80 hover:text-neon">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-muted">
          DealerPass facilita educación y, según el plan, acceso mediante dealers certificados. Los vehículos de subasta
          se venden AS-IS. DealerPass no garantiza adjudicación, condición, precio, ahorro, reventa ni rentabilidad.
        </p>

        <p className="mt-6 text-xs text-muted/70">© {new Date().getFullYear()} DealerPass. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
