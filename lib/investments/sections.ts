export const investmentSectionIds=['resumen-vehiculo','editar-compra','compra-precio','venta-cierre','venta-referencia','venta-precio','venta-fecha','gastos-vehiculo','nuevo-gasto','fotos-vehiculo','participantes-vehiculo'] as const;
export function investmentSectionId(hash:string) {
  try {const id=decodeURIComponent(hash.replace(/^#/,''));return investmentSectionIds.find(candidate=>candidate===id)??null;} catch {return null;}
}
// Navigation only: reveal the real existing form, never change field values.
export function revealInvestmentSection(hash:string,root:Pick<Document,'getElementById'>) {
  const id=investmentSectionId(hash);if(!id)return false;
  const target=root.getElementById(id);if(!target)return false;
  let element:HTMLElement|null=target;
  while(element) {if(element.tagName==='DETAILS')(element as HTMLDetailsElement).open=true;element=element.parentElement;}
  target.focus({preventScroll:true});
  target.scrollIntoView({behavior:'instant',block:'start'});
  return true;
}
