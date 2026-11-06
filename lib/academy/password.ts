export function passwordError(password: string, confirmation: string): string | null {
  if (password.length < 12) return "Usa una contraseña de al menos 12 caracteres.";
  if (password.length > 256) return "Usa una contraseña de máximo 256 caracteres.";
  if (password !== confirmation) return "Las contraseñas no coinciden. Revisa ambos campos.";
  return null;
}
