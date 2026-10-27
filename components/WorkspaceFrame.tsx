"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ArrowIcon from "./ArrowIcon";
const links = [
  { href: "/mi-cuenta", label: "Resumen", mark: "01" },
  { href: "/aula", label: "Mi formación", mark: "02" },
  { href: "/mi-cuenta/calculadora", label: "Calculadora", mark: "03" },
  { href: "/mi-cuenta/inversiones", label: "Vehículos e inversiones", mark: "04" },
  { href: "/mi-cuenta/perfil", label: "Mi perfil", mark: "05" },
];
export default function WorkspaceFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const privatePage = ["/mi-cuenta", "/aula", "/equipo"].some(p => path === p || path.startsWith(p + "/"));
  if (!privatePage) return <>{children}</>;
  return <div className="workspace-shell">
    <aside className="workspace-sidebar">
      <div className="workspace-label"><span className="workspace-dot" /> TU ESPACIO</div>
      <nav aria-label="Navegación de mi espacio">{links.map(l => <Link key={l.href} href={l.href} aria-current={(l.href === "/mi-cuenta" ? path === l.href : path === l.href || path.startsWith(l.href + "/")) ? "page" : undefined}><span aria-hidden="true">{l.mark}</span>{l.label}<ArrowIcon direction="right" /></Link>)}</nav>
      {path.startsWith("/equipo") && <Link className="workspace-team" href="/equipo" aria-current="page">Panel del equipo <ArrowIcon /></Link>}
      <div className="workspace-support"><strong>A tu ritmo. Con dirección.</strong><p>Consulta tus herramientas y continúa desde donde quedaste.</p><Link href="/contacto">Ayuda y contacto <ArrowIcon /></Link></div>
      <Link className="workspace-site" href="/">Volver al sitio <ArrowIcon /></Link>
    </aside>
    <div className="workspace-content">{children}<footer className="workspace-footer"><span>DealerPass · Tu espacio personal</span><Link href="/legal/privacidad">Privacidad</Link><Link href="/legal/terminos">Términos</Link></footer></div>
  </div>;
}
