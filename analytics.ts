// Capa mínima de analítica. No inventa IDs: todo se lee de variables de entorno.
// Conecta aquí Meta Pixel, GA4 y GTM cuando existan los IDs reales.

type DealerPassEvent =
  | "view_pricing"
  | "click_whatsapp"
  | "start_lead_form"
  | "submit_lead"
  | "click_academy"
  | "click_plan_starter"
  | "click_plan_pro"
  | "click_plan_elite"
  | "click_plan_academy"
  | "use_calculator"
  | "begin_checkout";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: DealerPassEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // Google Analytics 4 (vía gtag.js)
  window.gtag?.("event", event, params);

  // Meta Pixel
  window.fbq?.("trackCustom", event, params);

  // Google Tag Manager dataLayer
  window.dataLayer?.push({ event, ...params });

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, params);
  }
}

export function getWhatsappUrl(customMessage?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const message = customMessage || process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Hola, quiero información sobre DealerPass";
  if (!number) return "#";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
