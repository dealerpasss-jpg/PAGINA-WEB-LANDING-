import { statuses } from './money.ts';
import { missingFields, type MissingField } from './pending.ts';

export function filterInvestmentView<T extends { title: string; status: string }>(items: T[], query: string, status: string) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return items.filter(item => (!status || item.status === status) && words.every(word => normalize(item.title).includes(word)));
}

export const investmentSorts=['recent','title','cost-desc','result-desc','purchase-oldest'] as const;
export type InvestmentSort=typeof investmentSorts[number];
export type InvestmentFilters={query:string;status:string;pending:''|'all'|MissingField;sort:InvestmentSort;view:'cards'|'table'};
export type InvestmentParam='buscar'|'estado'|'pendientes'|'orden'|'vista';
export function readInvestmentFilters(params:Pick<URLSearchParams,'get'>):InvestmentFilters {
 const status=params.get('estado')??'';
 const pending=params.get('pendientes')??'';
 const sort=params.get('orden')??'recent';
 return {query:(params.get('buscar')??'').slice(0,100),status:Object.hasOwn(statuses,status)?status:'',pending:pending==='all'||Object.hasOwn(missingFields,pending)?pending as InvestmentFilters['pending']:'',sort:investmentSorts.includes(sort as InvestmentSort)?sort as InvestmentSort:'recent',view:params.get('vista')==='table'?'table':'cards'};
}
export function investmentQuery(params:Pick<URLSearchParams,'get'>) {
 const f=readInvestmentFilters(params);const query=new URLSearchParams();
 if(f.query)query.set('buscar',f.query);if(f.status)query.set('estado',f.status);if(f.pending)query.set('pendientes',f.pending);if(f.sort!=='recent')query.set('orden',f.sort);if(f.view==='table')query.set('vista','table');
 return query.toString();
}
export function updateInvestmentParams(params:Pick<URLSearchParams,'toString'>,key:InvestmentParam,value:string) {
 const next=new URLSearchParams(params.toString());
 if(value&&!((key==='orden'&&value==='recent')||(key==='vista'&&value==='cards')))next.set(key,value);else next.delete(key);
 return next;
}
export type InvestmentViewItem={title:string;status:string;financial?:{cost:number|null;result:number|null;purchasedOn:string|null;missing:MissingField[]}};
export function selectInvestmentView<T extends InvestmentViewItem>(items:T[],filters:InvestmentFilters) {
 const shown=filterInvestmentView(items,filters.query,filters.status).filter(item=>!filters.pending||(filters.pending==='all'?!!item.financial?.missing.length:item.financial?.missing.includes(filters.pending)));
 // Unknown amounts/dates always sort last; do not turn them into zeros.
 const compare=(a:number|string|null|undefined,b:number|string|null|undefined,descending=false)=>a==null?(b==null?0:1):b==null?-1:(a<b?-1:a>b?1:0)*(descending?-1:1);
 if(filters.sort==='title')shown.sort((a,b)=>a.title.localeCompare(b.title,'es'));
 if(filters.sort==='cost-desc')shown.sort((a,b)=>compare(a.financial?.cost,b.financial?.cost,true));
 if(filters.sort==='result-desc')shown.sort((a,b)=>compare(a.financial?.result,b.financial?.result,true));
 if(filters.sort==='purchase-oldest')shown.sort((a,b)=>compare(a.financial?.purchasedOn,b.financial?.purchasedOn));
 return shown;
}
