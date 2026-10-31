const changedEvent = 'dealerpass:catalogue-history';

// Next's router reflection is asynchronous. Controlled inputs need the actual
// browser URL synchronously, both while editing and when traversing history.
export function catalogueHistorySnapshot() {
  return new URLSearchParams(window.location.search).toString();
}

export function subscribeCatalogueHistory(changed: () => void) {
  window.addEventListener('popstate', changed);
  window.addEventListener(changedEvent, changed);
  return () => {
    window.removeEventListener('popstate', changed);
    window.removeEventListener(changedEvent, changed);
  };
}

export function replaceCatalogueHistory(params: URLSearchParams) {
  const query = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  window.dispatchEvent(new Event(changedEvent));
}
