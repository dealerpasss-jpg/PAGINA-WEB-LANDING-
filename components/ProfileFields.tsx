export function ProfileConsents({ values = {} }: { values?: Record<string, unknown> }) {
  return <fieldset className="profile-consents"><legend>Promociones · opcional</legend>
    <label className="account-check"><input type="checkbox" name="marketing_email" value="yes" defaultChecked={values.marketing_email === true} /><span>Quiero recibir novedades y promociones de DealerPass por correo.</span></label>
    <label className="account-check"><input type="checkbox" name="marketing_whatsapp" value="yes" defaultChecked={values.marketing_whatsapp === true} /><span>Quiero recibir novedades y promociones de DealerPass por WhatsApp.</span></label>
    <small>Puedes cambiar estas preferencias en tu perfil. Los avisos de tu cuenta y compras se envían por separado.</small>
  </fieldset>;
}

export default function ProfileFields({ values = {}, includeConsents = true }: { values?: Record<string, unknown>; includeConsents?: boolean }) {
  const value = (key: string) => typeof values[key] === "string" ? values[key] as string : "";
  return <>
    <label>¿Cómo quieres que te llamemos? · opcional<input name="nickname" autoComplete="nickname" maxLength={40} placeholder="Ej. Jota" defaultValue={value("nickname")} /><small>Usaremos este nombre o apodo para saludarte. Puedes cambiarlo cuando quieras.</small></label>
    <div className="profile-fields-grid">
      <label>Nombre<input name="first_name" autoComplete="given-name" maxLength={100} defaultValue={value("first_name")} required /></label>
      <label>Apellido<input name="last_name" autoComplete="family-name" maxLength={100} defaultValue={value("last_name")} required /></label>
      <label>País de residencia<input name="country" autoComplete="country-name" placeholder="Ej. Estados Unidos" maxLength={100} defaultValue={value("country")} required /></label>
      <label>Estado, provincia o región<input name="region" autoComplete="address-level1" placeholder="Ej. Florida" maxLength={100} defaultValue={value("region")} required /></label>
    </div>
    <label>Teléfono · opcional<input name="phone" type="tel" autoComplete="tel" placeholder="+1 813 555 1234" maxLength={30} defaultValue={value("phone")} /><small>Incluye el código de país. No es obligatorio para crear tu cuenta.</small></label>
    {includeConsents && <ProfileConsents values={values} />}
  </>;
}
