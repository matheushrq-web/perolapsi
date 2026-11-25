import { Fragment, type ReactNode } from "react";
import type { SectionKey, SiteContent } from "@/content/types";

/** Âncoras amigáveis de cada seção */
export const SECTION_IDS: Record<SectionKey, string> = {
  hero: "inicio",
  conexao: "conexao",
  sobre: "sobre",
  areas: "psicoterapia",
  processo: "como-funciona",
  modalidades: "atendimento",
  pausa: "pausa",
  faq: "duvidas",
  contato: "contato",
};

export const SECTION_NAMES: Record<SectionKey, string> = {
  hero: "Início (apresentação)",
  conexao: "Conexão emocional",
  sobre: "Sobre mim",
  areas: "Áreas de atuação",
  processo: "Como funciona",
  modalidades: "Modalidades de atendimento",
  pausa: "Pausa e reflexão",
  faq: "Perguntas frequentes",
  contato: "Contato",
};

/** Divide um texto em parágrafos (linha em branco separa parágrafos) */
export function paras(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Converte *trecho* em <em>trecho</em> (destaque em itálico) */
export function Emph({ text }: { text: string }): ReactNode {
  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>));
}

export function plain(text: string) {
  return text.replace(/\*/g, "");
}

export function whatsappHref(c: SiteContent) {
  const n = c.contato.whatsapp.replace(/\D/g, "");
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(c.contato.whatsappMessage)}`;
}

export function instagramHref(c: SiteContent) {
  return c.contato.instagram ? `https://www.instagram.com/${c.contato.instagram}/` : "";
}

export function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  const local = d.startsWith("55") && d.length >= 12 ? d.slice(2) : d;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return `+${d}`;
}

export function crpLine(c: SiteContent) {
  return c.brand.crp.trim() ? `CRP ${c.brand.crp.trim()}` : "";
}

export function enabledModalities(c: SiteContent) {
  return c.modalidades.items.filter((m) => m.visible);
}

/** Variáveis CSS da identidade visual, geradas a partir do conteúdo */
export function themeCss(c: SiteContent) {
  const t = c.theme;
  const col = t.colors;
  const heading = t.headingFont === "playfair" ? "var(--ff-playfair)" : "var(--ff-cormorant)";
  const body = t.bodyFont === "dmsans" ? "var(--ff-dmsans)" : "var(--ff-manrope)";
  return `:root{--c-perola:${col.perola};--c-areia:${col.areia};--c-fendi:${col.fendi};--c-oliva:${col.oliva};--c-terracota:${col.terracota};--c-cafe:${col.cafe};--c-profundo:${col.profundo};--font-heading:${heading};--font-body:${body};--heading-scale:${t.headingScale};--body-size:${t.bodySize}px;--space-scale:${t.sectionSpacing};--img-radius:${t.imageRadius}px;--heading-tune:${t.headingFont === "playfair" ? 0.86 : 1};}`;
}
