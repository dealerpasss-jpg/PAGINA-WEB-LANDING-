// Personal preferences only. Never use auth user_metadata to authorize roles or plans.
export const experiences = { beginner: "Nunca he comprado en subastas", learning: "Estoy aprendiendo", experienced: "Ya he comprado en subastas" };
export const goals = { personal: "Comprar para uso personal", resale: "Comprar para revender", business: "Desarrollar mi negocio" };
export function readProfile(form: FormData, onboarding = false) {
  const text = (key: string) => String(form.get(key) || "").trim();
  const data = { nickname: text("nickname"), first_name: text("first_name"), last_name: text("last_name"), country: text("country"), region: text("region"), phone: text("phone").replace(/[\s().-]/g, ""), marketing_email: form.get("marketing_email") === "yes", marketing_whatsapp: form.get("marketing_whatsapp") === "yes" };
  if ([data.first_name, data.last_name, data.country, data.region].some(x => !x || x.length > 100 || /[\u0000-\u001f<>]/.test(x))) return { error: "Completa nombre, apellido, país y estado o región (máximo 100 caracteres)." };
  if (data.nickname.length > 40 || /[\u0000-\u001f<>]/.test(data.nickname)) return { error: "El apodo debe tener máximo 40 caracteres y no contener símbolos < o >." };
  if (data.phone && !/^\+[1-9]\d{6,14}$/.test(data.phone)) return { error: "Escribe el teléfono con código de país, por ejemplo +18135551234." };
  if (data.marketing_whatsapp && !data.phone) return { error: "Añade un teléfono para recibir promociones por WhatsApp o desmarca esa opción." };
  const experience = text("experience"), goal = text("goal"), language = text("language");
  if (onboarding && (!Object.hasOwn(experiences, experience) || !Object.hasOwn(goals, goal) || !["es", "en"].includes(language))) return { error: "Selecciona tu experiencia, objetivo e idioma." };
  return { data: { ...data, ...(onboarding ? { experience, goal, language } : {}) } };
}

export function greetingName(values: Record<string, unknown> = {}) {
  for (const key of ["nickname", "first_name"]) {
    const name = values[key];
    if (typeof name === "string" && name.trim() && !/[\u0000-\u001f<>]/.test(name)) return name.trim().slice(0, key === "nickname" ? 40 : 100);
  }
  return "";
}
