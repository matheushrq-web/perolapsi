import type { ImageRef, SiteContent } from "./types";

/**
 * Conteúdo padrão (proposta editorial).
 * Campos profissionais ficam VAZIOS de propósito: nada é inventado.
 * Campos vazios não aparecem no site; o painel sinaliza o que falta preencher.
 *
 * Fotografias: as imagens abaixo são ilustrativas (Unsplash, ambientes sem pessoas)
 * e devem ser substituídas pelas fotografias reais da profissional pelo painel.
 */

const img = (url: string, alt: string, focalX = 50, focalY = 50): ImageRef => ({
  url,
  alt,
  focalX,
  focalY,
  zoom: 1,
  standIn: true,
});

export const DEFAULT_CONTENT: SiteContent = {
  version: 1,

  theme: {
    colors: {
      perola: "#E3D2BF",
      areia: "#BDAA96",
      fendi: "#9E8D72",
      oliva: "#71725F",
      terracota: "#8D5736",
      cafe: "#5E4732",
      profundo: "#211B15",
    },
    headingFont: "cormorant",
    bodyFont: "manrope",
    headingScale: 1,
    bodySize: 17,
    sectionSpacing: 1,
    imageRadius: 6,
    grain: true,
    allowDark: true,
    defaultMode: "light",
  },

  brand: {
    name: "Pérola Martiniano",
    role: "Psicóloga",
    crp: "",
    logoUrl: "",
    logoAlt: "Pérola Martiniano, psicóloga",
    faviconUrl: "",
  },

  nav: {
    items: [
      { key: "hero", label: "Início", visible: true },
      { key: "sobre", label: "Sobre mim", visible: true },
      { key: "areas", label: "Psicoterapia", visible: true },
      { key: "processo", label: "Como funciona", visible: true },
      { key: "faq", label: "Dúvidas", visible: true },
      { key: "contato", label: "Contato", visible: true },
    ],
    ctaLabel: "Vamos conversar",
    ctaHref: "#contato",
  },

  layout: {
    sections: [
      { key: "hero", visible: true },
      { key: "conexao", visible: true },
      { key: "sobre", visible: true },
      { key: "areas", visible: true },
      { key: "processo", visible: true },
      { key: "modalidades", visible: true },
      { key: "pausa", visible: true },
      { key: "faq", visible: true },
      { key: "contato", visible: true },
    ],
  },

  hero: {
    eyebrow: "Seja bem-vindo(a). Este espaço também é seu.",
    title: "Você não precisa ter todas as respostas para *começar a se escutar.*",
    lead: "Prazer, sou Pérola Martiniano, psicóloga.",
    text:
      "Acredito que o cuidado com a saúde emocional começa quando encontramos um espaço em que podemos ser quem somos, sem precisar esconder o que sentimos.\n\nAqui, você encontrará um espaço de escuta, acolhimento e respeito à sua própria história.",
    primary: { label: "Quero conversar", href: "#contato" },
    secondary: { label: "Conheça meu trabalho", href: "#sobre" },
    microcopy: "Escuta acolhedora, respeito à sua individualidade e cuidado ético.",
    showCrp: true,
    showModalities: true,
    // standIn: true porque a foto não mostra a profissional (não entra nos dados estruturados como foto dela)
    image: {
      url: "/images/hero-maos.webp",
      alt: "Duas pessoas de mãos dadas, em um gesto de acolhimento",
      focalX: 50,
      focalY: 48,
      zoom: 1,
      standIn: true,
    },
    imageShape: "arch",
    imageRatio: "4/5",
    imageSide: "right",
    decorations: true,
  },

  conexao: {
    title: "Nem sempre conseguimos colocar em palavras *aquilo que sentimos.*",
    text:
      "Às vezes, é o cansaço que não passa.\n\nEm outras, são pensamentos que parecem não encontrar silêncio, sentimentos difíceis de compreender ou a sensação de estar vivendo no automático.\n\nNem tudo precisa estar organizado para que você possa falar sobre o que acontece dentro de você.\n\nA psicoterapia é um espaço onde essas experiências podem ser acolhidas e compreendidas, respeitando o seu tempo e a sua singularidade.",
    highlight: "O que você sente merece espaço, não julgamento.",
  },

  sobre: {
    title: "Por trás da escuta, *existe uma pessoa.*",
    text:
      "Olá, sou Pérola Martiniano.\n\nEscolhi a Psicologia por acreditar na importância de compreender o ser humano para além daquilo que é visível.\n\nMeu trabalho é pautado na escuta, no respeito à individualidade e na construção de um espaço em que cada pessoa possa olhar para sua própria história com liberdade e acolhimento.\n\nMais do que oferecer respostas prontas, meu papel é acompanhar você em um processo de compreensão, reflexão e cuidado emocional.",
    signature: "Pérola Martiniano",
    image: {
      url: "/images/perola-sobre.webp",
      alt: "Pérola Martiniano, psicóloga, sorrindo, de óculos e camisa branca, com o rosto apoiado na mão",
      focalX: 55,
      focalY: 40,
      zoom: 1,
      standIn: false,
    },
    facts: [
      { id: "formacao", visible: true, label: "Formação acadêmica", value: "" },
      { id: "registro", visible: true, label: "Registro profissional", value: "" },
      { id: "abordagem", visible: true, label: "Abordagem psicológica", value: "" },
      { id: "especializacoes", visible: true, label: "Especializações", value: "" },
      { id: "publico", visible: true, label: "Público atendido", value: "" },
      { id: "modalidades", visible: true, label: "Modalidades de atendimento", value: "" },
    ],
  },

  areas: {
    title: "O que trouxe você *até aqui?*",
    subtitle:
      "Cada pessoa chega à psicoterapia com uma história diferente. Existem experiências que podem ser exploradas e compreendidas nesse espaço.",
    items: [
      {
        id: "ansiedade",
        visible: true,
        title: "Ansiedade e preocupações",
        text: "Um espaço para compreender pensamentos, emoções e preocupações que atravessam sua rotina.",
      },
      {
        id: "autoconhecimento",
        visible: true,
        title: "Autoconhecimento",
        text: "Conhecer a si mesmo também envolve reconhecer sentimentos, limites, desejos e necessidades.",
      },
      {
        id: "relacionamentos",
        visible: true,
        title: "Relacionamentos",
        text: "Refletir sobre vínculos, conflitos, expectativas e formas de se relacionar consigo e com os outros.",
      },
      {
        id: "autoestima",
        visible: true,
        title: "Autoestima e inseguranças",
        text: "Compreender a maneira como você se percebe e se relaciona com a própria história.",
      },
      {
        id: "sobrecarga",
        visible: true,
        title: "Sobrecarga emocional",
        text: "Acolher sentimentos relacionados às cobranças, responsabilidades e exigências do cotidiano.",
      },
      {
        id: "mudancas",
        visible: true,
        title: "Mudanças e desafios da vida",
        text: "Encontrar espaço para elaborar experiências, transições e acontecimentos difíceis.",
      },
    ],
  },

  processo: {
    title: "Começar pode ser mais simples *do que você imagina.*",
    intro: "Não existe uma maneira perfeita de iniciar a psicoterapia. Existe a sua maneira, no seu tempo.",
    steps: [
      {
        id: "contato",
        visible: true,
        title: "O primeiro contato",
        text: "Conversamos brevemente para esclarecer dúvidas e verificar as possibilidades de atendimento.",
      },
      {
        id: "encontro",
        visible: true,
        title: "Nosso primeiro encontro",
        text: "Um momento para nos conhecermos, compreender suas necessidades e conversar sobre o funcionamento da psicoterapia.",
      },
      {
        id: "processo",
        visible: true,
        title: "A construção do processo",
        text: "A partir dos encontros, construímos um espaço de escuta e reflexão, respeitando sua individualidade e seu ritmo.",
      },
    ],
    ctaLabel: "Podemos começar com uma conversa.",
    ctaHref: "#contato",
  },

  modalidades: {
    title: "Encontros on-line *ou presenciais.*",
    intro: "Escolha o formato que cabe na sua rotina. Os dois seguem o mesmo cuidado com o sigilo e com o seu tempo.",
    items: [
      {
        id: "online",
        visible: true,
        title: "Psicoterapia on-line",
        text: "A possibilidade de realizar encontros psicológicos a distância, em um ambiente adequado, reservado e com privacidade.",
        image: img(
          "/images/online.webp",
          "Notebook, xícara de café, caderno aberto e um vaso de planta sobre a mesa, na luz suave do fim de tarde",
          50,
          58,
        ),
      },
      {
        id: "presencial",
        visible: true,
        title: "Psicoterapia presencial",
        text: "Um espaço preparado para acolher você pessoalmente, favorecendo a escuta e o desenvolvimento do processo terapêutico.",
        image: {
          url: "/images/presencial.webp",
          alt: "Pérola Martiniano no consultório, de blusa preta, com a mão apoiada no encosto de uma cadeira",
          focalX: 52,
          focalY: 18,
          zoom: 1,
          standIn: false,
        },
      },
    ],
    city: "",
    address: "",
    audience: "",
    duration: "",
    hours: "",
    extra: "",
    mapUrl: "",
    mapLabel: "Ver localização no mapa",
  },

  pausa: {
    quote: "Você não precisa esperar que tudo fique difícil para começar a cuidar de si.",
    text: "Cuidar da saúde emocional também é uma forma de reconhecer aquilo que importa em você.",
  },

  faq: {
    title: "Talvez você esteja *se perguntando...*",
    subtitle: "É natural ter dúvidas antes de começar. Separei algumas informações que podem ajudar.",
    moreLabel: "Ficou outra dúvida? Fale comigo",
    items: [
      {
        id: "grave",
        visible: true,
        question: "Preciso estar passando por um problema grave para fazer terapia?",
        answer:
          "Não. A psicoterapia também pode ser um espaço de autoconhecimento, reflexão e cuidado com a saúde emocional, independentemente da existência de uma crise.",
      },
      {
        id: "primeira",
        visible: true,
        question: "Como funciona a primeira sessão?",
        answer:
          "É um momento inicial de escuta e apresentação, no qual conversamos sobre suas necessidades, expectativas e o funcionamento do acompanhamento psicológico.",
      },
      {
        id: "falar",
        visible: true,
        question: "E se eu não souber o que falar?",
        answer:
          "Tudo bem. Você não precisa preparar um discurso ou organizar previamente seus sentimentos. A conversa pode ser construída respeitando o seu tempo.",
      },
      {
        id: "sigilo",
        visible: true,
        question: "O que conversamos durante as sessões é sigiloso?",
        answer:
          "O sigilo profissional é um princípio fundamental da Psicologia, observadas as situações excepcionais previstas pelas normas éticas e legais.",
      },
      {
        id: "duracao",
        visible: true,
        question: "Quanto tempo dura uma sessão?",
        answer:
          "A duração dos encontros será informada durante o contato inicial, conforme a organização do atendimento.",
      },
      {
        id: "adequada",
        visible: true,
        question: "Como saber se a psicoterapia é adequada para mim?",
        answer:
          "O primeiro contato pode ajudar a esclarecer suas dúvidas e compreender as possibilidades de acompanhamento.",
      },
      {
        id: "valores",
        visible: true,
        question: "Como posso saber os valores e horários disponíveis?",
        answer:
          "Você pode entrar em contato diretamente para receber informações sobre valores, horários e modalidades de atendimento.",
      },
      {
        id: "agendar",
        visible: true,
        question: "Como agendar uma sessão?",
        answer:
          "Entre em contato por um dos canais disponíveis no site para conversarmos sobre os próximos passos.",
      },
    ],
  },

  contato: {
    title: "Toda conversa começa *de algum lugar.*",
    text:
      "Talvez você ainda tenha dúvidas. Talvez esteja tentando encontrar as palavras certas.\n\nNão precisa ter tudo definido agora.\n\nSe sentir que este pode ser um espaço para você, estou à disposição para conversarmos sobre as possibilidades de atendimento.",
    whatsapp: "558588700044",
    whatsappLabel: "Vamos conversar pelo WhatsApp",
    whatsappMessage:
      "Olá, Pérola! Conheci seu trabalho através do site e gostaria de saber um pouco mais sobre os atendimentos psicológicos.",
    instagram: "psi.perola",
    email: "",
    address: "",
    hours: "",
    bookingUrl: "",
    bookingLabel: "Agendar pelo link",
    image: {
      url: "/images/contato.webp",
      alt: "Pérola Martiniano segurando junto ao peito o livro “A formação social da mente”, de L. S. Vigotski",
      focalX: 50,
      focalY: 50,
      zoom: 1,
      standIn: false,
    },
    form: {
      enabled: false,
      title: "Prefere deixar uma mensagem?",
      notice:
        "Para sua privacidade, não envie informações clínicas ou dados sensíveis por aqui. Conte apenas como prefere ser contatado(a).",
      success: "Mensagem recebida. Retorno pelo canal que você indicou assim que possível.",
    },
    privacyNotice:
      "Os dados enviados por este site são usados apenas para responder ao seu contato, conforme a Política de Privacidade.",
    emergencyNotice:
      "Este site e seus canais de contato não funcionam como serviço de atendimento emergencial. Em uma emergência, procure o pronto atendimento mais próximo ou ligue para o SAMU, no 192. Para apoio emocional a qualquer hora, o CVV atende pelo 188.",
  },

  footer: {
    closing: "Que você encontre espaço *para ser quem é.*",
    socials: [{ id: "instagram", visible: true, label: "Instagram", href: "https://www.instagram.com/psi.perola/" }],
    rights: "Todos os direitos reservados.",
    credits: "",
  },

  privacy: {
    title: "Política de Privacidade",
    updatedAt: "",
    controllerEmail: "",
    body: `Esta política explica, de forma simples, como este site trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

## Quem é responsável pelos dados
A responsável pelo tratamento dos dados é a psicóloga Pérola Martiniano. Dúvidas ou solicitações sobre seus dados podem ser enviadas para o e-mail indicado ao final desta página.

## Quais dados são coletados
Este site não utiliza ferramentas de publicidade, rastreamento ou análise de comportamento. Não há cookies de terceiros.
Se o formulário de contato estiver ativo, são coletados apenas: nome, canal de contato preferido (telefone, WhatsApp ou e-mail) e uma mensagem opcional.
Ao clicar nos botões de WhatsApp ou Instagram, você é direcionado(a) a serviços de terceiros, que têm políticas de privacidade próprias.

## Para que os dados são usados
Os dados do formulário são usados exclusivamente para responder ao seu contato. Eles não são vendidos, compartilhados para fins comerciais nem usados para envio de propaganda.
Pedimos que você não envie informações clínicas ou dados sensíveis pelo formulário. Esses assuntos devem ser tratados diretamente, em ambiente adequado e com sigilo.

## Armazenamento e segurança
As mensagens ficam armazenadas em ambiente protegido, com acesso restrito à profissional, e são excluídas quando deixam de ser necessárias para o contato.

## Cookies
O site utiliza apenas um cookie técnico, restrito à área administrativa, para manter a sessão da profissional. Visitantes não recebem cookies.
Se você escolher o tema claro ou escuro, essa preferência fica guardada apenas no seu próprio navegador e não é enviada ao site.

## Seus direitos
Você pode solicitar a qualquer momento a confirmação, o acesso, a correção ou a exclusão dos seus dados, pelo e-mail de contato abaixo.

## Atualizações
Esta política pode ser atualizada para refletir mudanças no site. A data da última atualização aparece no topo da página.`,
  },

  seo: {
    title: "Pérola Martiniano | Psicóloga e Psicoterapia",
    description:
      "Conheça o trabalho da psicóloga Pérola Martiniano. Um espaço de escuta, acolhimento e cuidado com a saúde emocional, respeitando sua história e individualidade.",
    siteUrl: "",
    ogImageUrl: "",
    keywords: "psicóloga, psicoterapia, terapia on-line, saúde emocional, Pérola Martiniano",
  },

  motion: {
    enabled: true,
    cursor: true,
    magnetic: true,
    wordHighlight: true,
    reveal: true,
    parallax: true,
    whatsappFloat: true,
  },

  review: {
    bioValidated: false,
    areasValidated: false,
    modalitiesValidated: false,
  },
};

/** Modelos usados ao criar novos itens em listas pelo painel */
export const ITEM_TEMPLATES = {
  "sobre.facts": { id: "", visible: true, label: "Nova informação", value: "" },
  "areas.items": { id: "", visible: true, title: "Nova área", text: "" },
  "processo.steps": { id: "", visible: true, title: "Nova etapa", text: "" },
  "faq.items": { id: "", visible: true, question: "Nova pergunta", answer: "" },
  "modalidades.items": {
    id: "",
    visible: true,
    title: "Nova modalidade",
    text: "",
    image: { url: "", alt: "", focalX: 50, focalY: 50, zoom: 1, standIn: false },
  },
  "footer.socials": { id: "", visible: true, label: "Nova rede", href: "https://" },
} as const;
