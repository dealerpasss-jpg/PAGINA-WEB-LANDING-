"use client";
import ArrowIcon from "@/components/ArrowIcon";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Logo from "./Logo";
import { safeNext } from "@/lib/academy/policy";
import styles from './Header.module.css';

function AuthLinks({ mobile = false, close }: { mobile?: boolean; close?: () => void }) {
  const params = useSearchParams();
  const path = usePathname();
  const next = path === "/ingresar" ? "&next=" + encodeURIComponent(safeNext(params.get("next"))) : "";
  return <>
    <Link className={mobile ? styles.signIn : "header-auth-link"} href={"/ingresar?mode=login" + next} onClick={close}>{mobile ? "Iniciar sesión" : "Ingresar"}{mobile && <ArrowIcon direction="right" />}</Link>
    <Link className={mobile ? styles.signUp : "header-signup"} href={"/ingresar?mode=registro" + next} onClick={close}>Crear cuenta{mobile && <ArrowIcon direction="right" />}</Link>
  </>;
}
const links = [
  { href: "/academy", label: "Academia" },
  { href: "/vehiculos", label: "Vehículos" },
  { href: "/metodo-margen", label: "Calculadora" },
  { href: "/planes", label: "Planes" },
];
export default function Header() {
  const path = usePathname();
  const [menu, setMenu] = useState({ path, open: false });
  // Reset route-owned disclosure state during render so returning to a route cannot reopen it.
  if (menu.path !== path) setMenu({ path, open: false });
  const open = menu.path === path && menu.open;
  function setOpen(next: boolean) { setMenu({ path, open: next }); }
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
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const sheet = dialog.current;
    if (!sheet || !open) return;
    // Native modal behavior contains focus, makes the page inert, supports
    // Escape, and restores the invoking menu button when the sheet closes.
    sheet.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      if (sheet.open) sheet.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 801px)');
    const close = () => setMenu(current => ({ ...current, open: false }));
    const resize = () => { if (desktop.matches) close(); };
    window.addEventListener('popstate', close);
    desktop.addEventListener('change', resize);
    return () => { window.removeEventListener('popstate', close); desktop.removeEventListener('change', resize); };
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
              aria-current={path === l.href || path.startsWith(l.href + "/") ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {!workspace && <Suspense fallback={<><Link className="header-auth-link" href="/ingresar">Ingresar</Link><Link className="header-signup" href="/ingresar?mode=registro">Crear cuenta</Link></>}><AuthLinks /></Suspense>}
          <Link className={`header-login ${styles.desktopAccount}`} href="/mi-cuenta" onClick={() => setOpen(false)}>
            Mi espacio{" "}
            <span aria-hidden>
              <ArrowIcon />
            </span>
          </Link>
          <button
            ref={trigger}
            className={styles.menuToggle}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen(!open)}
          >
            <span>{open ? 'Cerrar' : 'Menú'}</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={open ? 'm6 6 12 12M6 18 18 6' : 'M4 8h16M4 16h16'} /></svg>
          </button>
        </div>
      </div>
      <dialog ref={dialog} id="mobile-navigation" className={styles.mobileMenu} data-workspace={workspace} aria-label="Menú de DealerPass"
        onClose={() => setMenu(current => ({ ...current, open: false }))}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false);
        }}>
        <div className={styles.sheetHeader}>
          <Logo variant={workspace ? 'dark' : 'light'} />
          <button type="button" className={styles.sheetClose} autoFocus onClick={() => setOpen(false)} aria-label="Cerrar menú"><span>Cerrar</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
        </div>
        <div className={styles.sheetBody}>
          <nav className={styles.navigation} aria-label="Navegación móvil">
            <span className={styles.groupLabel}>{workspace ? 'TU ESPACIO DE TRABAJO' : 'EXPLORAR DEALERPASS'}</span>
            {(workspace ? [{href:"/mi-cuenta",label:"Mi espacio"},{href:"/contacto",label:"Ayuda"},{href:"/",label:"Volver al sitio"}] : links).map(l => (
              <Link key={l.href} href={l.href} aria-current={path === l.href || path.startsWith(l.href + "/") ? "page" : undefined} onClick={() => setOpen(false)}>
                {l.label}<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
              </Link>
            ))}
          </nav>
          {!workspace && <section className={styles.account} aria-label="Acceso a tu cuenta">
            <div className={styles.accountHeading}><span className={styles.groupLabel}>TU ESPACIO</span><Link href="/mi-cuenta" onClick={() => setOpen(false)}>Mi espacio <ArrowIcon direction="right" /></Link></div>
            <p>Tu formación y herramientas, en un solo lugar.</p>
            <div className={styles.accountActions}><Suspense fallback={<><Link className={styles.signIn} href="/ingresar?mode=login" onClick={() => setOpen(false)}>Iniciar sesión <ArrowIcon direction="right" /></Link><Link className={styles.signUp} href="/ingresar?mode=registro" onClick={() => setOpen(false)}>Crear cuenta <ArrowIcon direction="right" /></Link></>}><AuthLinks mobile close={() => setOpen(false)} /></Suspense></div>
          </section>}
          {!workspace && <div className={styles.contact}><span>¿Te ayudamos?</span><Link href="/contacto" onClick={() => setOpen(false)}>Hablemos <ArrowIcon direction="right" /></Link></div>}
        </div>
      </dialog>
    </header>
  );
}
