"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ArrowIcon from "./ArrowIcon";
import WorkspaceIcon, { type WorkspaceIconName } from "./WorkspaceIcon";
const links: {href:string;label:string;mark:WorkspaceIconName}[] = [
  { href: "/mi-cuenta", label: "Resumen", mark: "home" },
  { href: "/aula", label: "Mi formación", mark: "learn" },
  { href: "/mi-cuenta/calculadora", label: "Calculadora", mark: "calculator" },
  { href: "/mi-cuenta/inversiones", label: "Inversiones", mark: "car" },
  { href: "/mi-cuenta/perfil", label: "Mi perfil", mark: "profile" },
];
export default function WorkspaceFrame({ children, team = false }: { children: React.ReactNode; team?: boolean }) {
  const path = usePathname();
  const privatePage = ["/mi-cuenta", "/aula", "/equipo"].some(p => path === p || path.startsWith(p + "/"));
  if (!privatePage) return <>{children}</>;
  return <div className="workspace-shell">
    <aside className="workspace-sidebar">
      <div className="workspace-label"><span className="workspace-dot" /> MI WORKSPACE</div>
      <nav aria-label="Navegación de mi espacio">{links.map(l => <Link key={l.href} href={l.href} aria-current={(l.href === "/mi-cuenta" ? path === l.href : path === l.href || path.startsWith(l.href + "/")) ? "page" : undefined}><span className="workspace-icon"><WorkspaceIcon name={l.mark} /></span>{l.label}<ArrowIcon direction="right" /></Link>)}</nav>
      {(team || path.startsWith("/equipo")) && <Link className="workspace-team" href="/equipo" aria-current={path.startsWith("/equipo") ? "page" : undefined}><WorkspaceIcon name="team" /> Panel del equipo <ArrowIcon /></Link>}
      <div className="workspace-support"><strong>A tu ritmo. Con dirección.</strong><p>Consulta tus herramientas y continúa desde donde quedaste.</p><Link href="/contacto">Ayuda y contacto <ArrowIcon /></Link></div>
      <form className="workspace-logout" action="/api/account" method="post"><input type="hidden" name="action" value="logout" /><button type="submit">Cerrar sesión <ArrowIcon /></button></form>
      <Link className="workspace-site" href="/">Volver al sitio <ArrowIcon /></Link>
    </aside>
    <div className="workspace-content">{children}<footer className="workspace-footer"><span>DealerPass · Tu espacio personal</span><Link href="/legal/privacidad">Privacidad</Link><Link href="/legal/terminos">Términos</Link></footer></div>
  </div>;
}
