import ProfileFields, { ProfileConsents } from "./ProfileFields";
import { experiences, goals } from "@/lib/academy/profile";
import ArrowIcon from "./ArrowIcon";

/** Presentation only. Identity, validation and saving stay in their existing server paths. */
export default function ProfileEditor({ values, next }: { values: Record<string, unknown>; next: string }) {
  const value = (key: string) => typeof values[key] === "string" ? values[key] as string : "";
  return <form action="/api/profile" method="post" className="account-form workspace-profile-form">
    <input type="hidden" name="next" value={next} />
    <section className="workspace-profile-group" aria-labelledby="profile-personal-title">
      <header className="workspace-profile-group-heading"><span>01 / TU INFORMACIÓN</span><h2 id="profile-personal-title">Datos personales.</h2></header>
      <ProfileFields values={values} includeConsents={false} />
    </section>
    <section className="workspace-profile-group workspace-profile-preferences" aria-labelledby="profile-preferences-title">
      <header className="workspace-profile-group-heading"><span>02 / A TU MEDIDA</span><h2 id="profile-preferences-title">Objetivos y preferencias.</h2></header>
      <label>¿Qué experiencia tienes comprando en subastas?<select name="experience" defaultValue={value("experience")} required><option value="" disabled>Selecciona una opción</option>{Object.entries(experiences).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
      <label>¿Cuál es tu objetivo principal?<select name="goal" defaultValue={value("goal")} required><option value="" disabled>Selecciona una opción</option>{Object.entries(goals).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
      <label>¿En qué idioma prefieres la formación?<select name="language" defaultValue={value("language")} required><option value="" disabled>Selecciona una opción</option><option value="es">Español</option><option value="en">Inglés</option></select><small>Registramos tu preferencia. La disponibilidad de clases depende del programa.</small></label>
      <ProfileConsents values={values} />
    </section>
    <footer className="workspace-profile-save"><p>Las promociones son opcionales. Tú eliges cómo recibirlas.</p><button className="btn-primary" type="submit">Guardar y continuar <ArrowIcon direction="right" /></button></footer>
  </form>;
}
