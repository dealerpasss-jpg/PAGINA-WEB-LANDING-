import ProfileFields from "@/components/ProfileFields";
import AccountShell from "@/components/AccountShell";
import { configured } from "@/lib/academy/server";
import { safeNext } from "@/lib/academy/policy";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ message?: string; next?: string; mode?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const next = safeNext(searchParams.next);
  const signup = searchParams.mode === "registro";
  const reset = searchParams.mode === "recuperar";
  return (
    <AccountShell
      compact
      kicker="DEALERPASS / ACADEMIA"
      title={
        reset
          ? "Recupera tu acceso"
          : signup
            ? "Crea tu cuenta"
            : "Bienvenido de nuevo"
      }
    >
      <p>{reset ? "Te enviaremos un enlace para cambiar tu contraseña." : signup ? "Regístrate para elegir tu formación y seguir tu progreso." : "Ingresa para continuar con tu formación."}</p>
      {!configured() ? (
        <div className="account-notice">
          El acceso está en preparación. Todavía no se reciben registros ni
          pagos.
        </div>
      ) : (
        <>
          <form
            action="/api/account"
            method="post"
            className="account-card account-form"
          >
            <input
              type="hidden"
              name="action"
              value={reset ? "reset" : signup ? "signup" : "login"}
            />
            <input type="hidden" name="next" value={next} />
            {signup && <ProfileFields />}
            <label>
              Correo electrónico
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                maxLength={254}
                required
              />
            </label>
            {!reset && (
              <label>
                Contraseña
                <input
                  name="password"
                  type="password"
                  placeholder={signup ? "Mínimo 12 caracteres" : "Tu contraseña"}
                  autoComplete={signup ? "new-password" : "current-password"}
                  minLength={signup ? 12 : 1}
                  required
                />
                {signup && <small>Usa al menos 12 caracteres.</small>}
              </label>
            )}
            {signup && (
              <label className="account-check">
                <input type="checkbox" name="consent" value="yes" required />
                <span>Acepto los <a href="/legal/terminos">términos</a> y la{" "}
                <a href="/legal/privacidad">política de privacidad</a>.</span>
              </label>
            )}
            <button className="btn-primary">
              {reset ? "Enviar enlace" : signup ? "Crear mi cuenta" : "Entrar"}
            </button>
          </form>
          <div className="account-links">
            <a
              href={
                "/ingresar?mode=" +
                (signup ? "login" : "registro") +
                "&next=" +
                encodeURIComponent(next)
              }
            >
              {signup ? "Ya tengo una cuenta" : "Crear cuenta"}
            </a>
            <a
              href={"/ingresar?mode=recuperar&next=" + encodeURIComponent(next)}
            >
              Olvidé mi contraseña
            </a>
          </div>
        </>
      )}
      {searchParams.message && (
        <p role="status" className="account-notice">
          {searchParams.message}
        </p>
      )}
    </AccountShell>
  );
}
