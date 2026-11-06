"use client";
import { useState, type FormEvent } from "react";
import { passwordError } from "@/lib/academy/password";
export default function PasswordForm({ message }: { message?: string }) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(message || "");
  const [pending, setPending] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    const problem = passwordError(String(form.get("password") || ""), String(form.get("confirm_password") || ""));
    if (problem) { event.preventDefault(); setError(problem); return; }
    setError(""); setPending(true);
  }
  return <form method="post" action="/api/account" className="account-card account-form" onSubmit={submit}>
    <input type="hidden" name="action" value="password" />
    <label>Nueva contraseña<input name="password" type={show ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={256} required aria-describedby="password-guidance" /></label>
    <small id="password-guidance">Mínimo 12 caracteres. Puedes usar una frase que recuerdes.</small>
    <label>Confirma tu nueva contraseña<input name="confirm_password" type={show ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={256} required /></label>
    <label className="account-check"><input type="checkbox" checked={show} onChange={event => setShow(event.target.checked)} /><span>Mostrar contraseñas</span></label>
    {error && <div role="alert" className="account-notice">{error}</div>}
    <button className="btn-primary" disabled={pending}>{pending ? "Guardando…" : "Guardar nueva contraseña"}</button>
  </form>;
}
