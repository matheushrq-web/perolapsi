import { DEFAULT_CONTENT, ITEM_TEMPLATES } from "./defaults";
import type { SiteContent } from "./types";

/**
 * Validação do conteúdo recebido do painel.
 * O formato é derivado do conteúdo padrão: chaves desconhecidas são descartadas,
 * tipos são forçados, textos têm tamanho máximo, cores e links são verificados.
 */

const MAX_TEXT = 6000;
const HEX = /^#[0-9a-fA-F]{6}$/;

const ENUMS: Record<string, readonly string[]> = {
  "theme.headingFont": ["cormorant", "playfair"],
  "theme.bodyFont": ["manrope", "dmsans"],
  "theme.defaultMode": ["system", "light", "dark"],
  "hero.imageShape": ["arch", "rounded", "rect"],
  "hero.imageRatio": ["4/5", "3/4", "2/3", "1/1"],
  "hero.imageSide": ["right", "left"],
};

const SECTION_KEYS = ["hero", "conexao", "sobre", "areas", "processo", "faixa", "modalidades", "pausa", "faq", "contato"];

const RANGES: Record<string, [number, number]> = {
  "theme.headingScale": [0.8, 1.3],
  "theme.bodySize": [15, 20],
  "theme.sectionSpacing": [0.6, 1.6],
  "theme.imageRadius": [0, 32],
  focalX: [0, 100],
  focalY: [0, 100],
  zoom: [1, 2],
  version: [1, 1000],
};

/** Links aceitos: http(s), mailto, tel, âncoras e caminhos do próprio site */
export function safeHref(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("#") || (v.startsWith("/") && !v.startsWith("//"))) return v;
  if (/^(https?:|mailto:|tel:)/i.test(v)) {
    try {
      if (/^https?:/i.test(v)) new URL(v);
      return v;
    } catch {
      return "";
    }
  }
  return "";
}

/** Imagens aceitas: enviadas ao site (/media/...) ou https */
export function safeImageUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^\/(media|images)\/[a-zA-Z0-9._-]+$/.test(v)) return v;
  if (/^https:\/\//i.test(v)) {
    try {
      new URL(v);
      return v;
    } catch {
      return "";
    }
  }
  return "";
}

function isHrefKey(key: string) {
  return /(^href$|Href$|^mapUrl$|^bookingUrl$|^siteUrl$)/.test(key);
}
function isImageKey(key: string) {
  return /(^url$|Url$)/.test(key) && !isHrefKey(key);
}

let idCounter = 0;
const newId = () => `i${Date.now().toString(36)}${(idCounter++).toString(36)}`;

function coerce(template: unknown, input: unknown, path: string, key: string): unknown {
  if (typeof template === "string") {
    let s = typeof input === "string" ? input : typeof input === "number" ? String(input) : template;
    s = s.replace(/\r\n/g, "\n").slice(0, MAX_TEXT);
    if (path.startsWith("theme.colors.")) return HEX.test(s) ? s.toUpperCase() : template;
    if (ENUMS[path]) return ENUMS[path].includes(s) ? s : template;
    if (key === "key") return SECTION_KEYS.includes(s) ? s : template;
    if (isHrefKey(key)) return safeHref(s);
    if (isImageKey(key)) return safeImageUrl(s);
    return s;
  }
  if (typeof template === "number") {
    const n = typeof input === "number" ? input : typeof input === "string" ? Number(input) : NaN;
    const range = RANGES[path] ?? RANGES[key];
    if (!Number.isFinite(n)) return template;
    return range ? Math.min(range[1], Math.max(range[0], n)) : n;
  }
  if (typeof template === "boolean") {
    return typeof input === "boolean" ? input : template;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(input)) return template;
    const itemTemplate =
      (ITEM_TEMPLATES as Record<string, unknown>)[path] ?? (template.length ? template[0] : undefined);
    if (itemTemplate === undefined) return [];
    const out = input.slice(0, 60).map((item) => coerce(itemTemplate, item, path + "[]", ""));
    // ids únicos
    const seen = new Set<string>();
    for (const item of out as Record<string, unknown>[]) {
      if (item && typeof item === "object" && "id" in item) {
        let id = String(item.id || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
        if (!id || seen.has(id)) id = newId();
        seen.add(id);
        item.id = id;
      }
    }
    return out;
  }
  if (template && typeof template === "object") {
    const src = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(template as Record<string, unknown>)) {
      const childPath = path.endsWith("[]") ? k : path ? `${path}.${k}` : k;
      // dentro de listas, o caminho das chaves é só o nome (ex.: focalX)
      out[k] = coerce(v, src[k], path.endsWith("[]") ? k : childPath, k);
    }
    return out;
  }
  return template;
}

export function sanitizeContent(input: unknown): SiteContent {
  const c = coerce(DEFAULT_CONTENT, input, "", "") as SiteContent;

  // Seções: todas presentes, sem repetição, na ordem escolhida
  const seen = new Set<string>();
  const sections = c.layout.sections.filter((s) => !seen.has(s.key) && seen.add(s.key));
  for (const s of DEFAULT_CONTENT.layout.sections) if (!seen.has(s.key)) sections.push({ ...s });
  c.layout.sections = sections;

  // Itens do menu: sem repetição
  const navSeen = new Set<string>();
  c.nav.items = c.nav.items.filter((n) => !navSeen.has(n.key) && navSeen.add(n.key));

  c.contato.whatsapp = c.contato.whatsapp.replace(/\D/g, "").slice(0, 15);
  c.contato.instagram = c.contato.instagram.replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, "").slice(0, 30);
  c.contato.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.contato.email.trim()) ? c.contato.email.trim() : "";
  c.privacy.controllerEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.privacy.controllerEmail.trim())
    ? c.privacy.controllerEmail.trim()
    : "";
  c.seo.siteUrl = c.seo.siteUrl.replace(/\/+$/, "");
  return c;
}

/** Mescla conteúdo salvo com o padrão (útil quando novos campos são adicionados ao modelo) */
export function withDefaults(stored: unknown): SiteContent {
  return sanitizeContent(stored ?? DEFAULT_CONTENT);
}

export interface Review {
  blockers: string[];
  warnings: string[];
}

/** Lista o que impede a publicação e o que ainda merece atenção */
export function reviewContent(c: SiteContent): Review {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const placeholders: string[] = [];
  const walk = (v: unknown, path: string) => {
    if (typeof v === "string") {
      if (/\[\s*inserir/i.test(v) || /lorem ipsum/i.test(v)) placeholders.push(path);
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i + 1}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
  };
  walk(c, "");
  if (placeholders.length)
    blockers.push(`Há textos provisórios do tipo “[INSERIR]” em: ${placeholders.slice(0, 6).join(", ")}.`);

  if (!c.brand.crp.trim()) blockers.push("Informe o número do CRP (Identidade > Registro profissional).");
  if (!c.review.bioValidated)
    blockers.push("Confirme que os textos biográficos da seção “Sobre mim” foram validados pela profissional.");
  if (!c.review.areasValidated)
    blockers.push("Confirme as áreas de atuação exibidas (Áreas de atuação > confirmação).");
  if (!c.review.modalitiesValidated)
    blockers.push("Confirme as modalidades de atendimento exibidas (Modalidades > confirmação).");

  if (!c.contato.whatsapp) warnings.push("WhatsApp não informado: o botão de WhatsApp não aparece no site.");
  if (!c.contato.email) warnings.push("E-mail profissional não informado.");
  if (!c.privacy.controllerEmail) warnings.push("Informe um e-mail para solicitações de privacidade (Política de Privacidade).");
  if (!c.seo.siteUrl) warnings.push("Informe o endereço final do site (SEO) para o sitemap e o compartilhamento.");
  const standIns = [c.hero.image, c.sobre.image, c.contato.image, ...c.modalidades.items.map((m) => m.image)].filter(
    (i) => i.url && i.standIn,
  );
  if (standIns.length)
    warnings.push(`${standIns.length} fotografia(s) ainda são ilustrativas. Substitua pelas fotos reais quando possível.`);
  const missingFacts = c.sobre.facts.filter((f) => f.visible && !f.value.trim()).map((f) => f.label);
  if (missingFacts.length)
    warnings.push(`Informações profissionais sem valor (não aparecem no site): ${missingFacts.join(", ")}.`);
  return { blockers, warnings };
}
