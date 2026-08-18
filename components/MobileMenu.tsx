"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { getWhatsappUrl, track } from "@/lib/analytics";

const links = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/academy", label: "Academia" },
  { href: "/planes", label: "Planes" },
  { href: "/metodo-margen", label: "Método MARGEN" },
  { href: "/#faq", label: "Preguntas frecuentes" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-edge"
      >
        <span className={`h-0.5 bg-cream transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} style={{ width: 18 }} />
        <span className={`h-0.5 bg-cream transition-opacity ${open ? "opacity-0" : "opacity-100"}`} style={{ width: 18 }} />
        <span className={`h-0.5 bg-cream transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} style={{ width: 18 }} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black"
          style={{ backgroundColor: "#101010" }}
        >
          <div className="container-content flex h-16 items-center justify-between">
            <Logo variant="dark" />
            <button aria-label="Cerrar menú" onClick={() => setOpen(false)} className="text-2xl leading-none text-cream">
              ×
            </button>
          </div>
          <nav className="container-content mt-6 flex flex-1 flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-edge py-4 text-lg font-medium text-cream"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="container-content mb-8 flex flex-col gap-3">
            <Link href="/planes" onClick={() => setOpen(false)} className="btn-primary w-full">
              Ver planes
            </Link>
            <a
              href={getWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click_whatsapp", { source: "mobile_menu" })}
              className="btn-outline w-full"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
