import AccountShell from "@/components/AccountShell";
import PasswordForm from "@/components/PasswordForm";
import { auth, configured } from "@/lib/academy/server";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const metadata = { title: "Nueva contraseña | DealerPass", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const user = configured() ? (await (await auth()).auth.getUser()).data.user : null;
  return <AccountShell compact kicker="DEALERPASS / RECUPERAR ACCESO" title={user ? "Crea tu nueva contraseña" : "Necesitas un enlace válido"}>
    {user ? <>
      <p>Elige tu nueva contraseña y escríbela de nuevo para confirmarla. No necesitas recordar la anterior.</p>
      <PasswordForm message={message} />
      <p className="password-help">Al guardarla, podrás iniciar sesión con tu nueva contraseña.</p>
    </> : <div className="account-card">
      <p>{message || "Abre el enlace del correo de recuperación. Si caducó o ya lo utilizaste, solicita uno nuevo."}</p>
      <Link className="btn-primary" href="/ingresar?mode=recuperar">Solicitar nuevo enlace</Link>
      <p className="password-help">Usa el correo más reciente y ábrelo en el mismo navegador donde lo solicitaste.</p>
    </div>}
  </AccountShell>;
}
