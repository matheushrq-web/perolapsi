"use client";

import { useState } from "react";
import type { SiteContent } from "@/content/types";
import { SECTION_IDS } from "@/lib/site";

/** Faixa de palavras que desliza devagar; pausa ao passar o mouse e tem botão de pausa (WCAG 2.2.2) */
export function Ribbon({ c }: { c: SiteContent }) {
  const [paused, setPaused] = useState(false);
  const words = c.faixa.words
    .split(/\n+/)
    .map((w) => w.trim())
    .filter(Boolean);
  if (!words.length) return null;
  const row = (hidden: boolean) => (
    <ul className="ribbon__row" aria-hidden={hidden || undefined}>
      {words.map((w, i) => (
        <li key={i}>
          <span>{w}</span>
          <span className="pearl ribbon__pearl" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <section
      id={SECTION_IDS.faixa}
      className={`ribbon${paused ? " is-paused" : ""}`}
      aria-label="O que orienta o trabalho"
    >
      <div className="ribbon__track">
        {row(false)}
        {row(true)}
      </div>
      <button
        type="button"
        className="ribbon__toggle"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Retomar o movimento da faixa" : "Pausar o movimento da faixa"}
      >
        {paused ? (
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M4 2.5h2.6v11H4zM9.4 2.5H12v11H9.4z" fill="currentColor" />
          </svg>
        )}
      </button>
    </section>
  );
}
