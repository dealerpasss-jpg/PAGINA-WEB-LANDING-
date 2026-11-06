export function readLead(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const body = input as Record<string, unknown>;
  const limits = { name: 120, whatsapp: 40, email: 254, location: 160, objective: 100, experience: 100, capital: 100, timeline: 100 };
  const result: Record<string, string> = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = body[key];
    if (typeof value !== "string" || !value.trim() || value.length > limit || /[\u0000-\u001f]/.test(value)) return null;
    result[key] = value.trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email) || !["on", "yes"].includes(String(body.consent))) return null;
  return { ...result, consent: true, source: "dealerpass-website" };
}
