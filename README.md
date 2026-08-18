# DealerPass — Sitio web

Sitio de conversión para DealerPass (Access. Learn. Trade.), construido con Next.js 14 (App Router), TypeScript y Tailwind CSS.

## Requisitos

- Node.js 18.18+ (recomendado 20 LTS)
- npm

## Instalación

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre http://localhost:3000

## Estructura

```
app/
  page.tsx              → Home
  planes/                → Página de planes
  academy/                → Página de DealerPass Academy
  metodo-margen/          → Página del Método MARGEN
  contacto/               → Formulario de contacto
  legal/                  → 5 páginas legales (borradores)
  api/lead/route.ts       → Recibe el formulario y reenvía al webhook configurado
components/               → 20 componentes reutilizables (ver lista abajo)
data/
  plans.ts                → Precios, beneficios y tabla comparativa — edítalo aquí
  margen.ts                → Las 6 variables del Método MARGEN
  faq.ts                    → Preguntas frecuentes
lib/analytics.ts            → Wrapper de tracking (GA4 / Meta Pixel / GTM) y helper de WhatsApp
```

## Editar precios y planes

Todo el contenido de precios vive en un solo archivo: `data/plans.ts`. No hay precios hardcodeados en los componentes.

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

- `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GTM_ID` — analítica (agrega los scripts correspondientes en `app/layout.tsx` cuando tengas los IDs reales; no se generan snippets con IDs falsos).
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — número en formato internacional sin signos (ej. 573001234567).
- `LEAD_FORM_WEBHOOK_URL` — endpoint de GoHighLevel, HubSpot o webhook genérico que recibirá cada lead del formulario de contacto.
- `NEXT_PUBLIC_STRIPE_LINK_*` — enlaces de pago de Stripe por plan. Mientras estén vacíos, los botones de planes llevan al formulario de contacto en lugar de a checkout.

## Eventos de analítica ya instrumentados

`view_pricing`, `click_whatsapp`, `start_lead_form`, `submit_lead`, `click_academy`, `click_plan_starter`, `click_plan_academy`, `click_plan_pro`, `click_plan_elite`, `use_calculator`.

## Build de producción

```bash
npm run build
npm run start
```

## Componentes reutilizables incluidos

Header, MobileMenu, Logo, Hero, TrustBar, BenefitCards, HowItWorks, MarginMethod, CalculatorPreview, AcademySection, PricingCards, ComparisonTable, FounderAuthority, CaseStudies, AudienceFit, Testimonials, FAQ, LeadForm, FinalCTA, Footer, LegalLayout.

## Notas de diseño

- Paleta: azul eléctrico #1463FF, negro carbón #111318, gris acero #A7ADB7, blanco frío #F7F9FC, verde de validación #24C875 (solo para estados aprobados/checkmarks).
- Tipografía: Space Grotesk (títulos) + Inter (cuerpo), vía `next/font/google` — se descargan en build time, por lo que `npm run build` requiere conexión a internet la primera vez.
- Elemento de firma visual: el selector interactivo del Método MARGEN (M-A-R-G-E-N), reutilizado en el hero, en la página dedicada y como ancla de la propuesta de valor.
- Ningún dato, testimonio, cifra de ahorro o nombre fue inventado. Todo lo que falta está marcado explícitamente como placeholder (ver PENDING_ASSETS.md).

Ver `PENDING_ASSETS.md` para la lista completa de información y activos reales que faltan por proporcionar.
