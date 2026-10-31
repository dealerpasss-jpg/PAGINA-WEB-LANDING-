'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}) {return <section className="account-shell"><h1>No pudimos cargar las cuentas.</h1><p>No mostramos saldos incompletos. Inténtalo de nuevo antes de registrar otro movimiento.</p><div className="investment-actions"><button className="btn-primary" onClick={reset}>Volver a intentar</button><Link href="/mi-cuenta">Volver a mi espacio</Link></div></section>;}
