# Pérola Martiniano — site institucional

Site da psicóloga Pérola Martiniano com painel administrativo próprio.
Next.js 16 (App Router) · TypeScript · CSS com variáveis · Supabase (opcional) · sem dependência de serviços de IA.

---

## 1. O que está pronto

**Site público** (`/`)
- Seções: Início, Conexão emocional, Sobre mim, Áreas de atuação, Como funciona, Modalidades, Pausa, Dúvidas (FAQ), Contato e rodapé.
- Menu fixo que se esconde ao rolar para baixo; menu móvel em tela cheia, acessível (Esc fecha, foco preso no menu).
- Animações discretas: entrada do topo, revelação de títulos e fotos, destaque gradual das palavras na seção de conexão, linha das etapas, paralaxe leve em elementos decorativos, cursor orgânico (só com mouse), efeito magnético nos botões, barra de progresso de leitura, FAQ com abertura suave. Tudo desligável no painel e desligado automaticamente para quem pede menos movimento no sistema (`prefers-reduced-motion`).
- Botão flutuante de WhatsApp (aparece só quando o número estiver cadastrado).
- Política de Privacidade em `/politica-de-privacidade`.
- SEO: título, descrição, Open Graph, favicon, `sitemap.xml`, `robots.txt`, dados estruturados (somente com dados reais preenchidos), imagens AVIF/WebP com carregamento sob demanda.

**Painel** (`/admin`)
- Login protegido (cookie httpOnly assinado, limite de tentativas, proteção de origem).
- Edição de todos os textos, links, botões, fotos (envio, ponto de foco, zoom, texto alternativo), logomarca, favicon, cores, fontes, tamanhos e espaçamentos.
- Listas com criar / editar / excluir / ocultar / reordenar: áreas de atuação, etapas, perguntas frequentes, modalidades, informações profissionais, redes sociais.
- Ordem e visibilidade das seções; links do menu.
- Pré-visualização ao vivo (computador, tablet, celular) enquanto edita.
- **Salvar rascunho** (não altera o site) e **Publicar** (leva o rascunho para o site).
- Restaurar o padrão com confirmação.
- Leitura e exclusão das mensagens do formulário de contato.

**Ética profissional embutida**
- Nenhuma informação profissional foi inventada: formação, abordagem, especializações, público, endereço, horários e contatos começam vazios e **não aparecem no site enquanto vazios**.
- A publicação é **bloqueada** enquanto: o CRP não for informado; houver textos provisórios do tipo “[INSERIR]”; a profissional não confirmar os textos biográficos, as áreas de atuação e as modalidades.
- Sem depoimentos, preços, promessas de resultado, estatísticas ou rastreadores. Aviso de emergência (SAMU 192, CVV 188) na seção de contato.

---

## 2. Rodar no computador

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
npm run admin:hash -- "uma-senha-forte-aqui"   # mostra ADMIN_PASSWORD_HASH e SESSION_SECRET
```

Crie o arquivo `.env.local` (modelo em `.env.example`):

```
SESSION_SECRET=...            # da saída do comando acima
ADMIN_EMAIL=seu-email@dominio.com
ADMIN_PASSWORD_HASH=...       # da saída do comando acima
```

```bash
npm run dev        # http://localhost:3000  e  http://localhost:3000/admin
```

Sem Supabase, o conteúdo fica em `data/` (rascunho, publicado, histórico, imagens e mensagens).

---

## 3. Publicar (produção)

### Onde guardar os dados

| Hospedagem | Armazenamento |
|---|---|
| Vercel, Netlify ou outra plataforma *serverless* | **Supabase obrigatório** (o disco dessas plataformas é apagado a cada deploy) |
| VPS, servidor próprio, Docker com volume persistente | Supabase **ou** modo arquivo (`data/`, faça backup da pasta) |

### Configurar o Supabase (gratuito para este porte)

1. Crie um projeto em supabase.com.
2. Em **SQL Editor**, rode o arquivo `supabase/schema.sql` (cria tabelas com RLS e o bucket `site-media`).
3. Em **Project Settings > API**, copie `Project URL`, `anon key` e `service_role key`.
4. Cadastre as variáveis na hospedagem:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...     # NUNCA exponha no navegador
   SESSION_SECRET=...                # 32+ caracteres aleatórios
   ```
5. Login do painel — escolha uma opção:
   - **Supabase Auth:** crie o usuário em *Authentication > Users* e defina `SUPABASE_ANON_KEY` e `ADMIN_EMAILS=email@dominio.com`.
   - **Local:** `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`.

### Vercel (exemplo)

1. Envie o projeto para um repositório Git e importe na Vercel.
2. Cadastre as variáveis do item anterior em *Settings > Environment Variables*.
3. Deploy. Depois, abra `/admin`, preencha o CRP e os dados reais, valide os textos e publique.
4. Em *SEO e compartilhamento*, informe o endereço final do site (para sitemap e compartilhamento).

### Servidor próprio

```bash
npm run build
npm start          # porta 3000; use um proxy (Nginx/Caddy) com HTTPS
```

---

## 4. Editar pelo código

| O quê | Onde |
|---|---|
| Modelo do conteúdo (campos editáveis) | `src/content/types.ts` |
| Textos e valores padrão | `src/content/defaults.ts` |
| Validação e regras de publicação | `src/content/validate.ts` |
| Formulários do painel | `src/components/admin/schema.ts` |
| Componentes visuais do site | `src/components/site/` |
| Identidade visual (variáveis CSS, layout) | `src/styles/site.css` |
| Animações | `src/components/site/Motion.tsx` + fim de `site.css` |
| Integrações (Supabase, arquivo) | `src/lib/store/` |
| Autenticação | `src/lib/auth.ts`, `src/proxy.ts` |
| SEO, dados estruturados | `src/lib/published.ts`, `src/app/sitemap.ts`, `src/app/robots.ts` |

Para criar um novo campo editável: adicione em `types.ts` e `defaults.ts`, descreva em `schema.ts` e use no componente. A validação aceita o campo automaticamente (o formato é derivado do conteúdo padrão).

**Cores:** as 7 cores da marca ficam no painel (*Cores e tipografia*). Os tons intermediários (fundo claro, linhas, botões) são calculados com `color-mix` em `site.css`, então mudar uma cor da marca atualiza o site todo.

**Exportar o conteúdo:** modo arquivo → `data/published.json`; Supabase → tabela `site_content`.

---

## 5. Antes de publicar — checklist

- [ ] CRP, formação, abordagem, público e modalidades preenchidos com dados reais.
- [ ] Textos de “Sobre mim” lidos e validados pela profissional.
- [ ] Fotos ilustrativas substituídas por fotografias reais (o painel avisa).
- [ ] WhatsApp, e-mail e Instagram conferidos.
- [ ] Política de Privacidade revisada, com e-mail de contato e data.
- [ ] Endereço final do site em *SEO*.
- [ ] Formulário de contato: só ative se for responder pelas mensagens do painel.

## 6. Imagens

As fotografias ficam em `public/images/` (WebP, sem metadados) e podem ser trocadas pelo painel.
A foto das mãos (Início) e a da mesa (Psicoterapia on-line) não mostram a profissional: confirme a licença
de uso de cada uma e, se exigido, informe o crédito em *Rodapé > Créditos das fotografias*.
Ícones de WhatsApp e Instagram: Simple Icons (CC0).
