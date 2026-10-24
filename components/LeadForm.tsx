"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

const objectives = ["Uso personal", "Reventa", "Exportación"];
const experience = ["Ninguna", "Una compra", "Varias compras"];
const capitalRanges = ["Menos de $3,000", "$3,000 – $8,000", "$8,000 – $20,000", "Más de $20,000"];
const timelines = ["Esta semana", "Este mes", "En los próximos 3 meses", "Todavía explorando"];

const inputClass =
  "mt-1 w-full rounded-md border border-edge bg-black px-3 py-2.5 text-sm text-cream outline-none focus:border-neon";

export default function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [started, setStarted] = useState(false);

  function handleFocusOnce() {
    if (!started) {
      track("start_lead_form");
      setStarted(true);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request_failed");
      track("submit_lead", { objective: payload.objective, experience: payload.experience });
      setStatus("success");
      (e.target as HTMLFormElement).reset();
      setStarted(false);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card border-neon text-center">
        <p className="font-display text-lg font-extrabold text-neon">Recibimos tu información.</p>
        <p className="mt-2 text-sm text-cream/70">
          Un asesor de DealerPass se pondrá en contacto contigo por WhatsApp o correo electrónico.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={handleFocusOnce} className="lead-form card grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-1">
        <span className="text-xs font-medium text-muted">Nombre</span>
        <input name="name" required className={inputClass} />
      </label>

      <label className="block sm:col-span-1">
        <span className="text-xs font-medium text-muted">WhatsApp</span>
        <input name="whatsapp" required type="tel" className={inputClass} />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-xs font-medium text-muted">Correo electrónico</span>
        <input name="email" required type="email" className={inputClass} />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-xs font-medium text-muted">Estado o país</span>
        <input name="location" required className={inputClass} />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted">Objetivo</span>
        <select name="objective" required className={inputClass}>
          <option value="">Selecciona...</option>
          {objectives.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted">Experiencia</span>
        <select name="experience" required className={inputClass}>
          <option value="">Selecciona...</option>
          {experience.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted">Capital aproximado</span>
        <select name="capital" required className={inputClass}>
          <option value="">Selecciona...</option>
          {capitalRanges.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted">Plazo para comenzar</span>
        <select name="timeline" required className={inputClass}>
          <option value="">Selecciona...</option>
          {timelines.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>

      <label className="flex items-start gap-2.5 sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span className="text-xs leading-relaxed text-cream/70">
          Acepto recibir comunicaciones de DealerPass y he leído la{" "}
          <Link href="/legal/privacidad" className="text-neon underline">
            Política de privacidad
          </Link>
          .
        </span>
      </label>

      {status === "error" && (
        <p className="text-sm text-red-400 sm:col-span-2">
          No pudimos enviar tu información. Inténtalo nuevamente o escríbenos por WhatsApp.
        </p>
      )}

      <button type="submit" disabled={status === "submitting"} className="btn-primary sm:col-span-2">
        {status === "submitting" ? "Enviando..." : "Quiero más información"}
      </button>
    </form>
  );
}
