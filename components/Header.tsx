"use client";
import ArrowIcon from "@/components/ArrowIcon";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
const links = [
  { href: "/academy", label: "Academia" },
  { href: "/vehiculos", label: "Vehículos" },
  { href: "/metodo-margen", label: "El método" },
  { href: "/planes", label: "Planes" },
];
export default function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const blended = path === "/" && !scrolled && !open;
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);
  return (
    <header
      className={`site-header ${path === "/" ? "header-home" : ""} ${blended ? "header-blended" : "header-solid"}`}
    >
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <div className="header-inner">
        <Link
          href="/"
          aria-label="DealerPass, inicio"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="header-login" href="/mi-cuenta">
            Mi espacio{" "}
            <span aria-hidden>
              <ArrowIcon />
            </span>
          </Link>
          <button
            ref={trigger}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Navegación móvil"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
              <span aria-hidden>
                <ArrowIcon />
              </span>
            </Link>
          ))}
          <Link href="/contacto" onClick={() => setOpen(false)}>
            Hablemos{" "}
            <span aria-hidden>
              <ArrowIcon />
            </span>
          </Link>
        </nav>
      )}
    </header>
  );
}
