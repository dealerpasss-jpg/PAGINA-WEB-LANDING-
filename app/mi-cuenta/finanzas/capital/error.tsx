'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="account-shell"><h1>No pudimos cargar tu capital.</h1><p role="alert">No se muestran saldos incompletos. Tus registros guardados no se modificaron. Inténtalo de nuevo.</p><button className="btn-primary" onClick={reset}>Volver a intentar</button></section>;
}
