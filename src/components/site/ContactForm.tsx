"use client";

import { useState } from "react";
import type { SiteContent } from "@/content/types";

type Errors = Partial<Record<"name" | "channel" | "message" | "consent", string>>;

export function ContactForm({ c, preview = false }: { c: SiteContent; preview?: boolean }) {
  const f = c.contato.form;
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview) {
      setStatus("error");
      setMessage("Na pré-visualização o formulário não envia mensagens.");
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      channel: String(data.get("channel") || "").trim(),
      message: String(data.get("message") || "").trim(),
      consent: data.get("consent") === "on",
      website: String(data.get("website") || ""),
    };
    const local: Errors = {};
    if (payload.name.length < 2) local.name = "Informe seu nome.";
    if (payload.channel.length < 6) local.channel = "Informe um telefone, WhatsApp ou e-mail para o retorno.";
    if (payload.message.length > 1000) local.message = "A mensagem pode ter até 1000 caracteres.";
    if (!payload.consent) local.consent = "É preciso concordar com o aviso de privacidade.";
    setErrors(local);
    if (Object.keys(local).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(local)[0]}"]`);
      first?.focus();
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("sent");
        form.reset();
        return;
      }
      if (json.errors) setErrors(json.errors);
      setStatus("error");
      setMessage(json.error || "Revise os campos destacados.");
    } catch {
      setStatus("error");
      setMessage("Sem conexão no momento. Tente novamente ou use os outros canais.");
    }
  }

  if (status === "sent") {
    return (
      <div className="form form--done" role="status">
        <p className="form__done">{f.success}</p>
        <button type="button" className="link" onClick={() => setStatus("idle")}>
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-describedby="form-notice">
      <h3 className="form__title">{f.title}</h3>
      <p id="form-notice" className="form__notice">
        {f.notice}
      </p>
      <div className={`field${errors.name ? " has-error" : ""}`}>
        <label htmlFor="cf-name">Nome</label>
        <input
          id="cf-name"
          name="name"
          autoComplete="name"
          maxLength={80}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "cf-name-e" : undefined}
        />
        {errors.name && (
          <p id="cf-name-e" className="field__error">
            {errors.name}
          </p>
        )}
      </div>
      <div className={`field${errors.channel ? " has-error" : ""}`}>
        <label htmlFor="cf-channel">Como prefere receber o retorno?</label>
        <input
          id="cf-channel"
          name="channel"
          placeholder="WhatsApp, telefone ou e-mail"
          maxLength={120}
          aria-invalid={Boolean(errors.channel)}
          aria-describedby={errors.channel ? "cf-channel-e" : undefined}
        />
        {errors.channel && (
          <p id="cf-channel-e" className="field__error">
            {errors.channel}
          </p>
        )}
      </div>
      <div className={`field${errors.message ? " has-error" : ""}`}>
        <label htmlFor="cf-message">
          Mensagem <span className="field__opt">(opcional)</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={3}
          maxLength={1000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "cf-message-e" : undefined}
        />
        {errors.message && (
          <p id="cf-message-e" className="field__error">
            {errors.message}
          </p>
        )}
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="cf-website">Não preencha</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={`field field--check${errors.consent ? " has-error" : ""}`}>
        <input
          id="cf-consent"
          name="consent"
          type="checkbox"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? "cf-consent-e" : undefined}
        />
        <label htmlFor="cf-consent">
          Li e concordo com a <a href="/politica-de-privacidade">Política de Privacidade</a>.
        </label>
        {errors.consent && (
          <p id="cf-consent-e" className="field__error">
            {errors.consent}
          </p>
        )}
      </div>
      <button className="btn btn--primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : "Enviar mensagem"}
      </button>
      <p className="form__status" role="status" aria-live="polite">
        {status === "error" ? message : ""}
      </p>
    </form>
  );
}
