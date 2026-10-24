export type DashboardLesson = { id: string; title: string; module_title: string; allowed_plans: string[] };
export function learningSummary(lessons: DashboardLesson[], completedIds: string[], plans: string[]) {
  const available = lessons.filter(l => l.allowed_plans.some(p => plans.includes(p)));
  const done = new Set(completedIds);
  const completed = available.filter(l => done.has(l.id)).length;
  return { available, completed, percent: available.length ? Math.round(completed / available.length * 100) : 0, next: available.find(l => !done.has(l.id)) || null };
}
export function purchaseBudget(values: number[]) {
  if (values.length !== 7 || values.some(n => !Number.isFinite(n) || n < 0)) return null;
  const [sale,fees,transport,repairs,taxes,reserve,profit] = values;
  const costs = fees + transport + repairs + taxes + reserve;
  return { costs, maximum: sale - costs - profit };
}
