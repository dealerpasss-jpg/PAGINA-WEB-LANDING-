const changedEvent='dealerpass:investment-history';
export function investmentHistorySnapshot() {
  return new URLSearchParams(window.location.search).toString();
}
export function subscribeInvestmentHistory(changed:()=>void) {
  window.addEventListener('popstate',changed);
  window.addEventListener(changedEvent,changed);
  return ()=>{window.removeEventListener('popstate',changed);window.removeEventListener(changedEvent,changed);};
}
export function replaceInvestmentHistory(params:URLSearchParams) {
  const query=params.toString();
  window.history.replaceState(null,'',`${window.location.pathname}${query?`?${query}`:''}${window.location.hash}`);
  window.dispatchEvent(new Event(changedEvent));
}
