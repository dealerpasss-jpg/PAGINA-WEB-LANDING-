"use client";
import Link from "next/link";
export default function ErrorPage({reset}:{reset:()=>void}) { return <section className="system-state wrap" role="alert"><span className="kicker">ALGO NO SALIÓ COMO ESPERÁBAMOS</span><h1>No pudimos cargar esta página.</h1><p>Vuelve a intentarlo. Si estabas guardando un cambio, comprueba su estado antes de repetirlo.</p><div className="plans-actions"><button className="btn-primary" onClick={reset}>Volver a intentar</button><Link className="btn-outline" href="/mi-cuenta">Ir a mi espacio</Link></div></section>; }
