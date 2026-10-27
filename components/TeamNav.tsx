import Link from "next/link";
export default function TeamNav({admin=false}:{admin?:boolean}) {
 return <nav className="dashboard-nav" aria-label="Administración"><Link href="/equipo">Resumen</Link>{admin && <Link href="/mi-cuenta/inversiones">Vehículos e inversiones</Link>}{admin && <Link href="/equipo/estudiantes">Estudiantes</Link>}<Link href="/equipo/clases">Clases y contenido</Link>{admin && <><Link href="/equipo#admisiones">Admisiones Elite</Link><Link href="/equipo#permisos">Colaboradores</Link></>}<Link href="/mi-cuenta">Mi espacio</Link></nav>;
}
