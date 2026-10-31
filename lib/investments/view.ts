export function filterInvestmentView<T extends { title: string; status: string }>(items: T[], query: string, status: string) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return items.filter(item => (!status || item.status === status) && words.every(word => normalize(item.title).includes(word)));
}
