"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { SiteContent } from "@/content/types";
import { THEME_COLORS, THEME_KEY } from "./Theme";

type Mode = "light" | "dark";

function resolve(c: SiteContent): Mode {
  let saved: string | null = null;
  if (c.theme.allowDark) {
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {}
  }
  if (saved === "light" || saved === "dark") return saved;
  if (c.theme.defaultMode === "system") return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return c.theme.defaultMode;
}

function apply(mode: Mode, animate: boolean) {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduced) {
    root.classList.add("theme-fade");
    window.setTimeout(() => root.classList.remove("theme-fade"), 650);
  }
  root.dataset.theme = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[mode]);
}

/** O tema atual é lido do atributo data-theme do <html> (fonte única da verdade) */
function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const snapshot = (): Mode => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const serverSnapshot = (): Mode => "light";

/** Mantém o tema em sincronia (útil também na pré-visualização do painel) */
export function useThemeSync(c: SiteContent) {
  const mode = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const { allowDark, defaultMode } = c.theme;

  useEffect(() => {
    apply(resolve(c), false);
    if (defaultMode !== "system") return;
    // segue mudanças do sistema enquanto o visitante não escolher manualmente
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(resolve(c), true);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowDark, defaultMode]);

  const toggle = () => {
    const next: Mode = snapshot() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    apply(next, true);
  };

  return { mode, toggle };
}

export function ThemeToggle({ mode, onToggle }: { mode: Mode; onToggle: () => void }) {
  const dark = mode === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <g className="theme-toggle__sun" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
        </g>
        <path
          className="theme-toggle__moon"
          d="M19.5 14.6A8 8 0 019.4 4.5a8 8 0 1010.1 10.1z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
