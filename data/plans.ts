// Archivo central de planes y precios.
// Edita aquí montos, beneficios y enlaces — todos los componentes leen de este archivo.

export type PlanId = "starter" | "academy" | "pro" | "elite";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  priceSuffix: string;
  badge?: string;
  features: string[];
  cta: string;
  checkoutEnvVar: string; // variable de entorno que contendrá el link de Stripe cuando exista
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: "DealerPass Starter",
    tagline: "Para comenzar o comprar tu primer vehículo.",
    price: "USD 199",
    priceSuffix: "/mes",
    features: [
      "Acceso a Copart e IAA, sujeto a disponibilidad",
      "Orientación inicial",
      "Reportes de historial limitados",
      "Soporte básico",
      "DealerPass Bid Calculator",
      "Explicación del proceso de puja, pago y título",
      "Tarifas por vehículo según su valor [INSERTAR TARIFA]",
    ],
    cta: "Comenzar con Starter",
    checkoutEnvVar: "NEXT_PUBLIC_STRIPE_LINK_STARTER",
  },
  {
    id: "academy",
    name: "DealerPass Academy",
    tagline: "Para aprender antes de comprar.",
    price: "USD 697",
    priceSuffix: "pago único",
    features: [
      "Curso completo",
      "Método MARGEN",
      "Calculadora",
      "Plantillas",
      "Comunidad durante el periodo definido",
      "Sesiones educativas",
      "Casos de análisis",
    ],
    cta: "Entrar a la academia",
    checkoutEnvVar: "NEXT_PUBLIC_STRIPE_LINK_ACADEMY",
  },
  {
    id: "pro",
    name: "DealerPass Pro",
    tagline: "Para compradores activos que quieren acompañamiento continuo.",
    price: "USD 499",
    priceSuffix: "/mes",
    badge: "Más popular",
    features: [
      "Plataformas disponibles según el plan",
      "DealerPass Academy incluida",
      "DealerPass Club",
      "Reportes bajo política de uso razonable",
      "Soporte prioritario",
      "Sesiones de análisis",
      "Revisión de oportunidades con alcance definido",
      "Tarifas reducidas por vehículo [INSERTAR TARIFA]",
      "Herramientas y actualizaciones",
    ],
    cta: "Elegir DealerPass Pro",
    checkoutEnvVar: "NEXT_PUBLIC_STRIPE_LINK_PRO",
  },
  {
    id: "elite",
    name: "DealerPass Elite",
    tagline: "Para compradores frecuentes y pequeños dealers.",
    price: "USD 2,999",
    priceSuffix: "/año",
    features: [
      "Acceso anual",
      "Plataformas disponibles",
      "Academy y Club incluidos",
      "Canal prioritario",
      "Sesiones especializadas",
      "Tarifas menores por transacción [INSERTAR TARIFA]",
      "Recursos operativos",
      "Acompañamiento en la primera oportunidad",
      "Actualizaciones durante 12 meses",
    ],
    cta: "Aplicar a Elite",
    checkoutEnvVar: "NEXT_PUBLIC_STRIPE_LINK_ELITE",
  },
];

export const comparisonRows = [
  { label: "Plataformas", starter: "Copart, IAA*", academy: "—", pro: "Según plan*", elite: "Según plan*" },
  { label: "DealerPass Academy", starter: "No incluida", academy: "Incluida", pro: "Incluida", elite: "Incluida" },
  { label: "DealerPass Club", starter: "No", academy: "Temporal", pro: "Sí", elite: "Sí" },
  { label: "Bid Calculator", starter: "Sí", academy: "Sí", pro: "Sí", elite: "Sí" },
  { label: "Reportes de historial", starter: "Limitados", academy: "—", pro: "Uso razonable", elite: "Uso razonable" },
  { label: "Soporte", starter: "Básico", academy: "Comunidad", pro: "Prioritario", elite: "Canal prioritario" },
  { label: "Sesiones de análisis", starter: "No", academy: "Incluidas", pro: "Incluidas", elite: "Especializadas" },
  { label: "Revisión de oportunidades", starter: "No", academy: "No", pro: "Alcance definido", elite: "Alcance definido" },
  { label: "Tarifa por vehículo", starter: "Estándar", academy: "N/A", pro: "Reducida", elite: "Menor" },
  { label: "Duración del acceso", starter: "Mensual", academy: "Curso + comunidad temporal", pro: "Mensual", elite: "12 meses" },
];

// * La disponibilidad de cada plataforma depende del plan, el estado y las condiciones de acceso de terceros.
