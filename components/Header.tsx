"use client";
import ArrowIcon from "@/components/ArrowIcon";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Logo from "./Logo";
import { safeNext } from "@/lib/academy/policy";

function AuthLinks({ mobile = false, close }: { mobile?: boolean; close?: () => void }) {
  const params = useSearchParams();
  const path = usePathname();
  const next = path === "/ingresar" ? "&next=" + encodeURIComponent(safeNext(params.get("next"))) : "";
  return <>
    <Link className={mobile ? undefined : "header-auth-link"} href={"/ingresar?mode=login" + next} onClick={close}>{mobile ? "Iniciar sesión" : "Ingresar"}{mobile && <ArrowIcon />}</Link>
    <Link className={mobile ? undefined : "header-signup"} href={"/ingresar?mode=registro" + next} onClick={close}>Crear cuenta{mobile && <ArrowIcon />}</Link>
  </>;
}
const links = [
  { href: "/academy", label: "Academia" },
  { href: "/vehiculos", label: "Vehículos" },
  { href: "/metodo-margen", label: "Calculadora" },
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
  const workspace = ["/mi-cuenta", "/aula", "/equipo"].some(p => path === p || path.startsWith(p + "/"));
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
          href={path === "/" ? "#main-content" : "/"}
          aria-label="DealerPass, inicio"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {(workspace ? [{href:"/mi-cuenta",label:"Mi espacio"},{href:"/contacto",label:"Ayuda"},{href:"/",label:"Volver al sitio"}] : links).map((l) => (
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
          {!workspace && <Suspense fallback={<><Link className="header-auth-link" href="/ingresar">Ingresar</Link><Link className="header-signup" href="/ingresar?mode=registro">Crear cuenta</Link></>}><AuthLinks /></Suspense>}
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
          {(workspace ? [{href:"/mi-cuenta",label:"Mi espacio"},{href:"/contacto",label:"Ayuda"},{href:"/",label:"Volver al sitio"}] : links).map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} onClick={() => setOpen(false)}>
              {l.label}
              <span aria-hidden>
                <ArrowIcon />
              </span>
            </Link>
          ))}
          {!workspace && <Link href="/mi-cuenta" onClick={() => setOpen(false)}>Mi espacio <ArrowIcon /></Link>}
          {!workspace && <Suspense fallback={null}><AuthLinks mobile close={() => setOpen(false)} /></Suspense>}
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
