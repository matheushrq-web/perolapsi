/**
 * Modelo de conteúdo do site.
 * Tudo o que aparece no site público vem deste objeto, editado pelo painel /admin
 * e persistido no banco (Supabase) ou em data/content.json (modo arquivo).
 */

export type SectionKey =
  | "hero"
  | "conexao"
  | "sobre"
  | "areas"
  | "processo"
  | "faixa"
  | "modalidades"
  | "pausa"
  | "faq"
  | "contato";

export type HeadingFont = "cormorant" | "playfair";
export type BodyFont = "manrope" | "dmsans";

export interface ImageRef {
  url: string;
  alt: string;
  /** Ponto focal horizontal/vertical em % (0–100) */
  focalX: number;
  focalY: number;
  /** Zoom do enquadramento (1 = sem zoom) */
  zoom: number;
  /** Foto ilustrativa provisória (true) ou foto real da profissional (false) */
  standIn: boolean;
}

export interface LinkButton {
  label: string;
  href: string;
}

export interface ListItem {
  id: string;
  visible: boolean;
}

export interface FactItem extends ListItem {
  label: string;
  value: string;
}

export interface AreaItem extends ListItem {
  title: string;
  text: string;
}

export interface StepItem extends ListItem {
  title: string;
  text: string;
}

export interface FaqItem extends ListItem {
  question: string;
  answer: string;
}

export interface ModalityItem extends ListItem {
  title: string;
  text: string;
  image: ImageRef;
}

export interface TopicItem extends ListItem {
  label: string;
  message: string;
}

export interface SocialItem extends ListItem {
  label: string;
  href: string;
}

export interface SiteContent {
  version: number;

  theme: {
    colors: {
      perola: string;
      areia: string;
      fendi: string;
      oliva: string;
      terracota: string;
      cafe: string;
      profundo: string;
    };
    headingFont: HeadingFont;
    bodyFont: BodyFont;
    /** Multiplicador dos títulos (0.8 – 1.3) */
    headingScale: number;
    /** Tamanho do texto corrido em px (15 – 20) */
    bodySize: number;
    /** Multiplicador do espaçamento vertical das seções (0.6 – 1.6) */
    sectionSpacing: number;
    /** Arredondamento das fotos em px (0 – 32) */
    imageRadius: number;
    /** Textura de papel quase imperceptível */
    grain: boolean;
    /** Mostra o botão para o visitante alternar entre tema claro e escuro */
    allowDark: boolean;
    /** Tema inicial: segue o sistema do visitante, ou sempre claro/escuro */
    defaultMode: "system" | "light" | "dark";
  };

  brand: {
    name: string;
    role: string;
    crp: string;
    logoUrl: string;
    logoAlt: string;
    faviconUrl: string;
  };

  nav: {
    items: { key: SectionKey; label: string; visible: boolean }[];
    ctaLabel: string;
    ctaHref: string;
  };

  layout: {
    sections: { key: SectionKey; visible: boolean }[];
  };

  hero: {
    eyebrow: string;
    /** Use *asteriscos* para destacar um trecho em itálico */
    title: string;
    lead: string;
    text: string;
    primary: LinkButton;
    secondary: LinkButton;
    microcopy: string;
    showCrp: boolean;
    showModalities: boolean;
    image: ImageRef;
    imageShape: "arch" | "rounded" | "rect";
    imageRatio: "4/5" | "3/4" | "2/3" | "1/1";
    imageSide: "right" | "left";
    decorations: boolean;
    /** Selo circular com texto girando devagar junto à foto */
    showBadge: boolean;
    badgeText: string;
  };

  conexao: {
    title: string;
    text: string;
    highlight: string;
  };

  sobre: {
    title: string;
    text: string;
    signature: string;
    image: ImageRef;
    facts: FactItem[];
  };

  areas: {
    title: string;
    subtitle: string;
    items: AreaItem[];
    /** Link em cada área que abre o WhatsApp já citando o tema */
    showCta: boolean;
    ctaLabel: string;
    /** Use {area} onde o nome da área deve aparecer */
    ctaMessage: string;
  };

  faixa: {
    /** Uma palavra ou expressão por linha */
    words: string;
  };

  processo: {
    title: string;
    intro: string;
    steps: StepItem[];
    ctaLabel: string;
    ctaHref: string;
  };

  modalidades: {
    title: string;
    intro: string;
    items: ModalityItem[];
    city: string;
    address: string;
    audience: string;
    duration: string;
    hours: string;
    extra: string;
    mapUrl: string;
    mapLabel: string;
  };

  pausa: {
    quote: string;
    text: string;
    /** Foto de fundo, coberta por um véu verde-oliva */
    image: ImageRef;
    /** Intensidade do véu sobre a foto (0.4 – 0.95) */
    overlay: number;
    /** Exercício guiado de respiração */
    breathing: boolean;
    breathingLabel: string;
    inhaleLabel: string;
    exhaleLabel: string;
    breathingNote: string;
  };

  faq: {
    title: string;
    subtitle: string;
    items: FaqItem[];
    moreLabel: string;
  };

  contato: {
    title: string;
    text: string;
    whatsapp: string;
    whatsappLabel: string;
    whatsappMessage: string;
    instagram: string;
    email: string;
    address: string;
    hours: string;
    bookingUrl: string;
    bookingLabel: string;
    image: ImageRef;
    /** Assuntos que preparam a mensagem do WhatsApp */
    showTopics: boolean;
    topicsTitle: string;
    topics: TopicItem[];
    form: {
      enabled: boolean;
      title: string;
      notice: string;
      success: string;
    };
    privacyNotice: string;
    emergencyNotice: string;
  };

  footer: {
    closing: string;
    socials: SocialItem[];
    rights: string;
    credits: string;
  };

  privacy: {
    title: string;
    updatedAt: string;
    controllerEmail: string;
    body: string;
  };

  seo: {
    title: string;
    description: string;
    siteUrl: string;
    ogImageUrl: string;
    keywords: string;
  };

  motion: {
    enabled: boolean;
    cursor: boolean;
    magnetic: boolean;
    wordHighlight: boolean;
    reveal: boolean;
    parallax: boolean;
    whatsappFloat: boolean;
  };

  /** Confirmações exigidas antes de publicar (ética profissional) */
  review: {
    bioValidated: boolean;
    areasValidated: boolean;
    modalitiesValidated: boolean;
  };
}

export interface StoredDoc {
  content: SiteContent;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  channel: string;
  message: string;
  createdAt: string;
}
