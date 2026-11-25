"use client";

import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.error || "Não foi possível entrar.");
      window.location.href = "/admin";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="a-login__form" onSubmit={onSubmit}>
      <div className="f">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="f">
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && (
        <p className="f-note f-note--warn" role="alert">
          {error}
        </p>
      )}
      <button className="a-btn a-btn--primary a-btn--block" type="submit" disabled={busy}>
        {busy ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
