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
      title={
        reset
          ? "Recupera tu acceso."
          : signup
            ? "Tu próxima etapa empieza aquí."
            : "Bienvenido de nuevo."
      }
    >
      <p>Tu formación, tus recursos y tu progreso en un solo lugar.</p>
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
            <label>
              Correo electrónico
              <input
                name="email"
                type="email"
                autoComplete="email"
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
                Acepto los <a href="/legal/terminos">términos</a> y la{" "}
                <a href="/legal/privacidad">política de privacidad</a>.
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
