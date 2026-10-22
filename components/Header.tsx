"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { getWhatsappUrl, track } from "@/lib/analytics";

const links = [
  { href: "/mi-cuenta", label: "Mi cuenta" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/academy", label: "Academia" },
  { href: "/planes", label: "Planes" },
  { href: "/metodo-margen", label: "Método MARGEN" },
  { href: "/#faq", label: "FAQ" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-black/95 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "border-edge shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]" : "border-transparent"
      }`}
    >
      <div className="container-content flex h-16 items-center justify-between md:h-20">
        <Link href="/" aria-label="DealerPass, inicio">
          <Logo variant="dark" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-cream/85 transition-colors hover:text-neon">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={getWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("click_whatsapp", { source: "header" })}
            className="text-sm font-semibold text-cream/85 hover:text-neon"
          >
            Hablar por WhatsApp
          </a>
          <Link href="/planes" className="btn-primary" onClick={() => track("view_pricing", { source: "header" })}>
            Ver planes
          </Link>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
