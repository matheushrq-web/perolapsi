"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/content/types";

const INHALE = 4;
const EXHALE = 6;
const CYCLE = INHALE + EXHALE;
const CYCLES = 6; // 6 × 10 s = 1 minuto

/**
 * Pausa guiada de um minuto: um círculo que cresce ao inspirar e diminui ao soltar o ar.
 * Tudo deriva de um único contador de segundos. Com "menos movimento" no sistema,
 * o círculo fica parado e só o texto guia.
 */
export function Breathing({ c }: { c: SiteContent }) {
  const p = c.pausa;
  const [elapsed, setElapsed] = useState<number | null>(null);
  const running = elapsed !== null;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed((e) => (e === null || e + 1 >= CYCLE * CYCLES ? null : e + 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const t = elapsed ?? 0;
  const inCycle = t % CYCLE;
  const phase = inCycle < INHALE ? "inhale" : "exhale";
  const left = phase === "inhale" ? INHALE - inCycle : CYCLE - inCycle;
  const cycle = Math.floor(t / CYCLE) + 1;

  return (
    <div className={`breath${running ? " is-running" : ""}`}>
      <div className="breath__stage" aria-hidden="true">
        <span className="breath__ring" />
        <span className="breath__orb" />
      </div>
      <p className="breath__label" aria-live="polite">
        {running ? (
          <>
            {phase === "inhale" ? p.inhaleLabel : p.exhaleLabel}
            <span className="breath__count" aria-hidden="true">
              {left}
            </span>
          </>
        ) : (
          <span className="breath__idle">{p.breathingNote}</span>
        )}
      </p>
      <button
        type="button"
        className="btn btn--light"
        onClick={() => setElapsed(running ? null : 0)}
        aria-pressed={running}
      >
        {running ? "Encerrar a pausa" : p.breathingLabel}
      </button>
      {running && (
        <span className="visually-hidden">
          Ciclo {cycle} de {CYCLES}
        </span>
      )}
    </div>
  );
}
