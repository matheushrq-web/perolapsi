"use client";

import { useId, useState } from "react";
import type { SiteContent } from "@/content/types";
import { formatPhone, instagramHref, whatsappHref } from "@/lib/site";
import { InstagramIcon, WhatsAppIcon } from "./Icons";

/**
 * Botões de contato. O visitante escolhe um assunto e a mensagem do WhatsApp já vai pronta.
 * Inclui "copiar número" para quem prefere ligar ou salvar o contato.
 */
export function ContactActions({ c }: { c: SiteContent }) {
  const s = c.contato;
  const topics = s.topics.filter((t) => t.visible && t.label.trim());
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const groupId = useId();

  const current = topics.find((t) => t.id === topicId);
  const message = s.showTopics && current?.message.trim() ? current.message : s.whatsappMessage;
  const wa = whatsappHref(c, message);
  const ig = instagramHref(c);

  const copy = async () => {
    const text = `+${s.whatsapp.replace(/\D/g, "")}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="contact-actions">
      {wa && s.showTopics && topics.length > 1 && (
        <fieldset className="topics">
          <legend id={groupId}>{s.topicsTitle}</legend>
          <div className="topics__list">
            {topics.map((t) => (
              <label key={t.id} className={`chip${t.id === topicId ? " is-active" : ""}`}>
                <input
                  type="radio"
                  name={`${groupId}-topic`}
                  value={t.id}
                  checked={t.id === topicId}
                  onChange={() => setTopicId(t.id)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="actions">
        {wa ? (
          <a className="btn btn--primary" href={wa} target="_blank" rel="noopener noreferrer" data-magnetic>
            <WhatsAppIcon size={18} />
            {s.whatsappLabel}
          </a>
        ) : ig ? (
          <a className="btn btn--primary" href={ig} target="_blank" rel="noopener noreferrer" data-magnetic>
            <InstagramIcon size={16} />
            Conversar pelo Instagram
          </a>
        ) : null}
        {s.whatsapp && (
          <button type="button" className="btn btn--ghost" onClick={copy}>
            {copied ? "Número copiado" : `Copiar ${formatPhone(s.whatsapp)}`}
          </button>
        )}
        {s.bookingUrl && (
          <a className="btn btn--ghost" href={s.bookingUrl} target="_blank" rel="noopener noreferrer">
            {s.bookingLabel}
          </a>
        )}
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {copied ? "Número copiado para a área de transferência." : ""}
      </p>
    </div>
  );
}
