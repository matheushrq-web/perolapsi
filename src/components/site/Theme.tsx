import type { SiteContent } from "@/content/types";

export const THEME_KEY = "pm-theme";
export const THEME_COLORS = { light: "#F4EEE7", dark: "#241D16" };

/**
 * Define o tema antes da primeira pintura (evita o "piscar" claro → escuro).
 * Prioridade: escolha salva do visitante (se o botão estiver ativo) > padrão do painel > sistema.
 */
export function ThemeScript({ c }: { c: SiteContent }) {
  const cfg = JSON.stringify({ allow: c.theme.allowDark, mode: c.theme.defaultMode, key: THEME_KEY, colors: THEME_COLORS });
  const code = `(function(){try{var c=${cfg};var s=null;if(c.allow){try{s=localStorage.getItem(c.key)}catch(e){}}var m=(s==="light"||s==="dark")?s:c.mode;if(m==="system"){m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=m;var t=document.querySelector('meta[name="theme-color"]');if(t)t.setAttribute("content",c.colors[m])}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
