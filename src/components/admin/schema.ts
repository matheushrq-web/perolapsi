import type { SectionKey } from "@/content/types";

/**
 * Descrição dos formulários do painel. Para adicionar um campo editável ao site:
 * 1) inclua-o em src/content/types.ts e src/content/defaults.ts;
 * 2) descreva-o aqui, no painel correspondente;
 * 3) use-o no componente em src/components/site.
 */

export type Field =
  | { type: "text"; path: string; label: string; help?: string; rows?: number; placeholder?: string; required?: boolean }
  | { type: "toggle"; path: string; label: string; help?: string }
  | { type: "select"; path: string; label: string; options: [string, string][]; help?: string }
  | { type: "range"; path: string; label: string; min: number; max: number; step: number; unit?: string }
  | { type: "color"; path: string; label: string; help?: string }
  | { type: "image"; path: string; label: string; help?: string }
  | { type: "upload"; path: string; label: string; kind: "logo" | "favicon" | "og"; help?: string }
  | {
      type: "list";
      path: string;
      label: string;
      itemTitle: string;
      addLabel: string;
      fields: Field[];
      help?: string;
    }
  | { type: "heading"; label: string; help?: string }
  | { type: "note"; text: string; tone?: "info" | "warn" }
  | { type: "confirm"; path: string; label: string; help: string }
  | { type: "sections" }
  | { type: "nav" };

export interface Panel {
  id: string;
  label: string;
  group: "Geral" | "Seções do site" | "Configurações";
  section?: SectionKey;
  /** âncora para a pré-visualização rolar até a seção */
  anchor?: string;
  fields: Field[];
}

const EMPH = "Use *asteriscos* em volta de um trecho para destacá-lo em itálico e cor terracota.";
const PARAS = "Deixe uma linha em branco entre os parágrafos.";

export const PANELS: Panel[] = [
  { id: "overview", label: "Visão geral", group: "Geral", fields: [] },
  {
    id: "brand",
    label: "Identidade e cabeçalho",
    group: "Geral",
    anchor: "inicio",
    fields: [
      { type: "heading", label: "Identificação profissional" },
      { type: "text", path: "brand.name", label: "Nome completo", required: true },
      { type: "text", path: "brand.role", label: "Profissão", help: "Exibida ao lado do nome, por exemplo: Psicóloga." },
      {
        type: "text",
        path: "brand.crp",
        label: "Registro profissional (CRP)",
        placeholder: "00/000000",
        required: true,
        help: "Obrigatório para publicar. Aparece no cabeçalho, na apresentação e no rodapé.",
      },
      { type: "heading", label: "Logomarca e ícone" },
      {
        type: "upload",
        path: "brand.logoUrl",
        label: "Logomarca (opcional)",
        kind: "logo",
        help: "Se enviada, substitui o nome escrito no cabeçalho e no rodapé. PNG com fundo transparente.",
      },
      { type: "text", path: "brand.logoAlt", label: "Descrição da logomarca (acessibilidade)" },
      {
        type: "upload",
        path: "brand.faviconUrl",
        label: "Favicon (ícone da aba)",
        kind: "favicon",
        help: "Imagem quadrada. Sem envio, o site usa a pérola padrão.",
      },
      { type: "heading", label: "Menu" },
      { type: "nav" },
      { type: "text", path: "nav.ctaLabel", label: "Texto do botão do menu" },
      { type: "text", path: "nav.ctaHref", label: "Link do botão do menu", help: "Ex.: #contato ou um link completo." },
    ],
  },
  {
    id: "theme",
    label: "Cores e tipografia",
    group: "Geral",
    fields: [
      {
        type: "note",
        text: "Priorize os tons claros nos fundos, os marrons na tipografia e o verde oliva nos botões. Os tons intermediários do site são calculados a partir destas cores.",
      },
      { type: "color", path: "theme.colors.perola", label: "Bege pérola", help: "Base dos fundos claros." },
      { type: "color", path: "theme.colors.areia", label: "Areia natural", help: "Números e detalhes." },
      { type: "color", path: "theme.colors.fendi", label: "Fendi", help: "Linhas finas e contornos." },
      { type: "color", path: "theme.colors.oliva", label: "Verde oliva acinzentado", help: "Botões e elementos interativos." },
      { type: "color", path: "theme.colors.terracota", label: "Terracota amadeirado", help: "Destaques pontuais." },
      { type: "color", path: "theme.colors.cafe", label: "Marrom café", help: "Textos secundários." },
      { type: "color", path: "theme.colors.profundo", label: "Marrom profundo", help: "Títulos, textos e rodapé." },
      { type: "heading", label: "Tipografia" },
      {
        type: "select",
        path: "theme.headingFont",
        label: "Fonte dos títulos",
        options: [
          ["cormorant", "Cormorant Garamond"],
          ["playfair", "Playfair Display"],
        ],
      },
      {
        type: "select",
        path: "theme.bodyFont",
        label: "Fonte dos textos",
        options: [
          ["manrope", "Manrope"],
          ["dmsans", "DM Sans"],
        ],
      },
      { type: "range", path: "theme.headingScale", label: "Tamanho dos títulos", min: 0.8, max: 1.3, step: 0.05, unit: "×" },
      { type: "range", path: "theme.bodySize", label: "Tamanho do texto", min: 15, max: 20, step: 1, unit: "px" },
      { type: "heading", label: "Espaços e acabamento" },
      { type: "range", path: "theme.sectionSpacing", label: "Espaço entre seções", min: 0.6, max: 1.6, step: 0.05, unit: "×" },
      { type: "range", path: "theme.imageRadius", label: "Arredondamento das fotos", min: 0, max: 32, step: 1, unit: "px" },
      { type: "toggle", path: "theme.grain", label: "Textura de papel quase imperceptível" },
      { type: "heading", label: "Tema claro e escuro", help: "O tema escuro usa as mesmas cores da marca, em tons noturnos." },
      {
        type: "toggle",
        path: "theme.allowDark",
        label: "Mostrar o botão para o visitante alternar entre claro e escuro",
        help: "A escolha do visitante fica salva só no navegador dele.",
      },
      {
        type: "select",
        path: "theme.defaultMode",
        label: "Tema ao abrir o site",
        options: [
          ["light", "Claro"],
          ["dark", "Escuro"],
          ["system", "Seguir o sistema do visitante"],
        ],
      },
    ],
  },
  { id: "sections", label: "Ordem das seções", group: "Geral", fields: [{ type: "sections" }] },

  {
    id: "hero",
    label: "Início",
    group: "Seções do site",
    section: "hero",
    anchor: "inicio",
    fields: [
      { type: "text", path: "hero.eyebrow", label: "Texto introdutório" },
      { type: "text", path: "hero.title", label: "Título principal", rows: 2, help: EMPH },
      { type: "text", path: "hero.lead", label: "Apresentação (primeira linha)" },
      { type: "text", path: "hero.text", label: "Apresentação (texto)", rows: 5, help: PARAS },
      { type: "text", path: "hero.primary.label", label: "Botão principal: texto" },
      { type: "text", path: "hero.primary.href", label: "Botão principal: link" },
      { type: "text", path: "hero.secondary.label", label: "Botão secundário: texto" },
      { type: "text", path: "hero.secondary.href", label: "Botão secundário: link" },
      { type: "text", path: "hero.microcopy", label: "Frase abaixo dos botões" },
      { type: "toggle", path: "hero.showCrp", label: "Mostrar o CRP na apresentação" },
      { type: "toggle", path: "hero.showModalities", label: "Mostrar as modalidades (on-line, presencial) na apresentação" },
      { type: "heading", label: "Fotografia" },
      {
        type: "image",
        path: "hero.image",
        label: "Foto principal",
        help: "Use uma fotografia real da profissional, com luz natural. Clique na imagem para escolher o ponto de foco.",
      },
      {
        type: "select",
        path: "hero.imageShape",
        label: "Formato da moldura",
        options: [
          ["arch", "Arco (topo arredondado)"],
          ["rounded", "Cantos suaves"],
          ["rect", "Retângulo"],
        ],
      },
      {
        type: "select",
        path: "hero.imageRatio",
        label: "Proporção",
        options: [
          ["4/5", "4:5 (retrato)"],
          ["3/4", "3:4"],
          ["2/3", "2:3 (mais alta)"],
          ["1/1", "1:1 (quadrada)"],
        ],
      },
      {
        type: "select",
        path: "hero.imageSide",
        label: "Posição da foto",
        options: [
          ["right", "À direita do texto"],
          ["left", "À esquerda do texto"],
        ],
      },
      { type: "toggle", path: "hero.decorations", label: "Elementos decorativos (círculo, linha e pérola)" },
      { type: "toggle", path: "hero.showBadge", label: "Selo circular girando junto à foto" },
      {
        type: "text",
        path: "hero.badgeText",
        label: "Texto do selo",
        help: "Termine com “ · ” para o início e o fim se encontrarem no círculo. Ideal: até 40 caracteres.",
      },
    ],
  },
  {
    id: "conexao",
    label: "Conexão emocional",
    group: "Seções do site",
    section: "conexao",
    anchor: "conexao",
    fields: [
      { type: "text", path: "conexao.title", label: "Título", rows: 2, help: EMPH },
      {
        type: "text",
        path: "conexao.text",
        label: "Texto",
        rows: 9,
        help: `${PARAS} O primeiro parágrafo aparece em destaque.`,
      },
      { type: "text", path: "conexao.highlight", label: "Frase de destaque", rows: 2 },
    ],
  },
  {
    id: "sobre",
    label: "Sobre mim",
    group: "Seções do site",
    section: "sobre",
    anchor: "sobre",
    fields: [
      {
        type: "note",
        tone: "warn",
        text: "Os textos biográficos são uma proposta editorial. Devem ser lidos e validados pela profissional antes da publicação.",
      },
      { type: "text", path: "sobre.title", label: "Título", rows: 2, help: EMPH },
      { type: "text", path: "sobre.text", label: "Texto", rows: 10, help: `${PARAS} O primeiro parágrafo aparece em destaque.` },
      { type: "text", path: "sobre.signature", label: "Assinatura" },
      { type: "image", path: "sobre.image", label: "Segunda fotografia" },
      {
        type: "list",
        path: "sobre.facts",
        label: "Informações profissionais",
        itemTitle: "label",
        addLabel: "Adicionar informação",
        help: "Só aparecem no site as informações preenchidas e marcadas como visíveis. Não preencha nada que não seja real.",
        fields: [
          { type: "text", path: "label", label: "Rótulo" },
          { type: "text", path: "value", label: "Valor", rows: 2 },
        ],
      },
      {
        type: "confirm",
        path: "review.bioValidated",
        label: "A profissional leu e validou os textos e as informações desta seção.",
        help: "Necessário para publicar.",
      },
    ],
  },
  {
    id: "areas",
    label: "Áreas de atuação",
    group: "Seções do site",
    section: "areas",
    anchor: "psicoterapia",
    fields: [
      { type: "text", path: "areas.title", label: "Título", help: EMPH },
      { type: "text", path: "areas.subtitle", label: "Subtítulo", rows: 3 },
      {
        type: "list",
        path: "areas.items",
        label: "Áreas",
        itemTitle: "title",
        addLabel: "Adicionar área",
        help: "Exiba apenas as áreas confirmadas pela profissional. Use as setas para reordenar.",
        fields: [
          { type: "text", path: "title", label: "Título" },
          { type: "text", path: "text", label: "Descrição", rows: 3 },
        ],
      },
      { type: "heading", label: "Chamada em cada área" },
      { type: "toggle", path: "areas.showCta", label: "Mostrar link para conversar sobre a área" },
      { type: "text", path: "areas.ctaLabel", label: "Texto do link" },
      {
        type: "text",
        path: "areas.ctaMessage",
        label: "Mensagem do WhatsApp",
        rows: 3,
        help: "Use {area} onde o nome da área deve entrar. Sem WhatsApp cadastrado, o link leva à seção de contato.",
      },
      {
        type: "confirm",
        path: "review.areasValidated",
        label: "As áreas visíveis foram confirmadas pela profissional.",
        help: "Necessário para publicar.",
      },
    ],
  },
  {
    id: "processo",
    label: "Como funciona",
    group: "Seções do site",
    section: "processo",
    anchor: "como-funciona",
    fields: [
      { type: "text", path: "processo.title", label: "Título", rows: 2, help: EMPH },
      { type: "text", path: "processo.intro", label: "Texto introdutório", rows: 3 },
      {
        type: "list",
        path: "processo.steps",
        label: "Etapas",
        itemTitle: "title",
        addLabel: "Adicionar etapa",
        help: "A numeração (01, 02, 03) é automática.",
        fields: [
          { type: "text", path: "title", label: "Título" },
          { type: "text", path: "text", label: "Texto", rows: 3 },
        ],
      },
      { type: "text", path: "processo.ctaLabel", label: "Chamada final" },
      { type: "text", path: "processo.ctaHref", label: "Link da chamada" },
    ],
  },
  {
    id: "faixa",
    label: "Faixa de palavras",
    group: "Seções do site",
    section: "faixa",
    anchor: "valores",
    fields: [
      {
        type: "note",
        text: "Faixa que desliza devagar entre as seções. Para quando o visitante passa o mouse e tem botão de pausa. Com movimento reduzido, as palavras ficam paradas.",
      },
      { type: "text", path: "faixa.words", label: "Palavras", rows: 7, help: "Uma palavra ou expressão por linha." },
    ],
  },
  {
    id: "modalidades",
    label: "Modalidades",
    group: "Seções do site",
    section: "modalidades",
    anchor: "atendimento",
    fields: [
      { type: "text", path: "modalidades.title", label: "Título", rows: 2, help: EMPH },
      { type: "text", path: "modalidades.intro", label: "Texto introdutório", rows: 3 },
      {
        type: "list",
        path: "modalidades.items",
        label: "Modalidades",
        itemTitle: "title",
        addLabel: "Adicionar modalidade",
        help: "Desative (olho) as modalidades que não forem oferecidas.",
        fields: [
          { type: "text", path: "title", label: "Título" },
          { type: "text", path: "text", label: "Descrição", rows: 3 },
          { type: "image", path: "image", label: "Fotografia" },
        ],
      },
      { type: "heading", label: "Informações do atendimento", help: "Campos vazios não aparecem no site." },
      { type: "text", path: "modalidades.city", label: "Cidade" },
      { type: "text", path: "modalidades.address", label: "Endereço do consultório", rows: 2 },
      { type: "text", path: "modalidades.audience", label: "Público atendido" },
      { type: "text", path: "modalidades.duration", label: "Duração das sessões" },
      { type: "text", path: "modalidades.hours", label: "Horários de atendimento" },
      { type: "text", path: "modalidades.extra", label: "Informações complementares", rows: 3 },
      { type: "text", path: "modalidades.mapUrl", label: "Link para localização (Google Maps etc.)" },
      { type: "text", path: "modalidades.mapLabel", label: "Texto do link de localização" },
      {
        type: "confirm",
        path: "review.modalitiesValidated",
        label: "As modalidades e informações visíveis foram confirmadas pela profissional.",
        help: "Necessário para publicar.",
      },
    ],
  },
  {
    id: "pausa",
    label: "Pausa e reflexão",
    group: "Seções do site",
    section: "pausa",
    anchor: "pausa",
    fields: [
      { type: "text", path: "pausa.quote", label: "Frase", rows: 3 },
      { type: "text", path: "pausa.text", label: "Texto abaixo", rows: 2 },
      {
        type: "image",
        path: "pausa.image",
        label: "Foto de fundo",
        help: "Fica coberta por um véu verde-oliva para o texto continuar legível. Sem foto, o fundo é só a cor.",
      },
      {
        type: "range",
        path: "pausa.overlay",
        label: "Intensidade do véu sobre a foto",
        min: 0.4,
        max: 0.95,
        step: 0.05,
        unit: "",
      },
      { type: "heading", label: "Pausa guiada de respiração", help: "Um minuto: 4 segundos inspirando, 6 soltando o ar." },
      { type: "toggle", path: "pausa.breathing", label: "Mostrar o exercício de respiração" },
      { type: "text", path: "pausa.breathingLabel", label: "Texto do botão" },
      { type: "text", path: "pausa.inhaleLabel", label: "Texto ao inspirar" },
      { type: "text", path: "pausa.exhaleLabel", label: "Texto ao soltar o ar" },
      { type: "text", path: "pausa.breathingNote", label: "Observação abaixo do círculo", rows: 2 },
    ],
  },
  {
    id: "faq",
    label: "Perguntas frequentes",
    group: "Seções do site",
    section: "faq",
    anchor: "duvidas",
    fields: [
      { type: "text", path: "faq.title", label: "Título", help: EMPH },
      { type: "text", path: "faq.subtitle", label: "Subtítulo", rows: 2 },
      { type: "text", path: "faq.moreLabel", label: "Link para contato (abaixo do subtítulo)" },
      {
        type: "list",
        path: "faq.items",
        label: "Perguntas",
        itemTitle: "question",
        addLabel: "Adicionar pergunta",
        fields: [
          { type: "text", path: "question", label: "Pergunta", rows: 2 },
          { type: "text", path: "answer", label: "Resposta", rows: 4 },
        ],
      },
    ],
  },
  {
    id: "contato",
    label: "Contato",
    group: "Seções do site",
    section: "contato",
    anchor: "contato",
    fields: [
      { type: "text", path: "contato.title", label: "Título", help: EMPH },
      { type: "text", path: "contato.text", label: "Texto", rows: 6, help: `${PARAS} O segundo parágrafo aparece em itálico.` },
      { type: "heading", label: "Canais", help: "Canais vazios não aparecem no site." },
      {
        type: "text",
        path: "contato.whatsapp",
        label: "WhatsApp (com DDI e DDD)",
        placeholder: "5511999999999",
        help: "Somente números. Ex.: 55 + DDD + número.",
      },
      { type: "text", path: "contato.whatsappLabel", label: "Texto do botão de WhatsApp" },
      { type: "text", path: "contato.whatsappMessage", label: "Mensagem automática do WhatsApp", rows: 3 },
      { type: "text", path: "contato.instagram", label: "Instagram (usuário, sem @)" },
      { type: "text", path: "contato.email", label: "E-mail profissional" },
      { type: "text", path: "contato.address", label: "Endereço", rows: 2 },
      { type: "text", path: "contato.hours", label: "Horários de atendimento" },
      { type: "text", path: "contato.bookingUrl", label: "Link de agendamento externo" },
      { type: "text", path: "contato.bookingLabel", label: "Texto do botão de agendamento" },
      { type: "image", path: "contato.image", label: "Fotografia da seção" },
      { type: "heading", label: "Assuntos do WhatsApp", help: "O visitante escolhe um assunto e a mensagem já vai pronta." },
      { type: "toggle", path: "contato.showTopics", label: "Mostrar os assuntos" },
      { type: "text", path: "contato.topicsTitle", label: "Pergunta acima dos assuntos" },
      {
        type: "list",
        path: "contato.topics",
        label: "Assuntos",
        itemTitle: "label",
        addLabel: "Adicionar assunto",
        fields: [
          { type: "text", path: "label", label: "Texto do botão" },
          { type: "text", path: "message", label: "Mensagem que vai para o WhatsApp", rows: 3 },
        ],
      },
      { type: "heading", label: "Formulário de contato" },
      {
        type: "note",
        text: "Quando ativo, as mensagens ficam guardadas no banco de dados do site e aparecem em “Mensagens”. Coleta apenas nome, canal de retorno e uma mensagem opcional.",
      },
      { type: "toggle", path: "contato.form.enabled", label: "Ativar formulário" },
      { type: "text", path: "contato.form.title", label: "Título do formulário" },
      { type: "text", path: "contato.form.notice", label: "Orientação sobre dados sensíveis", rows: 3 },
      { type: "text", path: "contato.form.success", label: "Mensagem de confirmação", rows: 2 },
      { type: "heading", label: "Avisos" },
      { type: "text", path: "contato.privacyNotice", label: "Aviso de privacidade", rows: 3 },
      { type: "text", path: "contato.emergencyNotice", label: "Aviso de emergência", rows: 4 },
    ],
  },
  {
    id: "footer",
    label: "Rodapé",
    group: "Seções do site",
    fields: [
      { type: "text", path: "footer.closing", label: "Frase de encerramento", rows: 2, help: EMPH },
      {
        type: "list",
        path: "footer.socials",
        label: "Redes sociais",
        itemTitle: "label",
        addLabel: "Adicionar rede",
        fields: [
          { type: "text", path: "label", label: "Nome" },
          { type: "text", path: "href", label: "Link completo" },
        ],
      },
      { type: "text", path: "footer.rights", label: "Direitos reservados", help: "O ano é atualizado automaticamente." },
      { type: "text", path: "footer.credits", label: "Créditos das fotografias" },
    ],
  },
  {
    id: "privacy",
    label: "Política de Privacidade",
    group: "Configurações",
    fields: [
      {
        type: "note",
        tone: "warn",
        text: "Revise o texto sempre que mudar os serviços usados pelo site (formulário, agendamento externo, hospedagem).",
      },
      { type: "text", path: "privacy.title", label: "Título" },
      { type: "text", path: "privacy.updatedAt", label: "Data da última atualização", placeholder: "25 de novembro de 2026" },
      { type: "text", path: "privacy.controllerEmail", label: "E-mail para solicitações de privacidade" },
      { type: "text", path: "privacy.body", label: "Texto", rows: 22, help: "Linhas que começam com “## ” viram subtítulos." },
    ],
  },
  {
    id: "seo",
    label: "SEO e compartilhamento",
    group: "Configurações",
    fields: [
      { type: "text", path: "seo.title", label: "Título da página (Google e aba do navegador)" },
      { type: "text", path: "seo.description", label: "Descrição", rows: 3, help: "Entre 120 e 160 caracteres." },
      { type: "text", path: "seo.siteUrl", label: "Endereço final do site", placeholder: "https://www.seudominio.com.br" },
      { type: "text", path: "seo.keywords", label: "Palavras-chave (separadas por vírgula)", rows: 2 },
      {
        type: "upload",
        path: "seo.ogImageUrl",
        label: "Imagem de compartilhamento (WhatsApp, redes)",
        kind: "og",
        help: "1200 × 630 px. Sem envio, usa a foto principal.",
      },
    ],
  },
  {
    id: "motion",
    label: "Animações",
    group: "Configurações",
    fields: [
      {
        type: "note",
        text: "Visitantes que pedem menos movimento no sistema operacional nunca veem animações, independentemente destas opções.",
      },
      { type: "toggle", path: "motion.enabled", label: "Animações ativadas" },
      { type: "toggle", path: "motion.reveal", label: "Entrada suave de títulos e fotos ao rolar" },
      { type: "toggle", path: "motion.wordHighlight", label: "Destaque gradual das palavras (Conexão emocional)" },
      { type: "toggle", path: "motion.parallax", label: "Paralaxe leve nos elementos decorativos" },
      { type: "toggle", path: "motion.cursor", label: "Cursor personalizado (somente mouse)" },
      { type: "toggle", path: "motion.magnetic", label: "Efeito magnético nos botões" },
      { type: "toggle", path: "motion.whatsappFloat", label: "Botão flutuante de WhatsApp" },
    ],
  },
  { id: "messages", label: "Mensagens", group: "Configurações", fields: [] },
];
