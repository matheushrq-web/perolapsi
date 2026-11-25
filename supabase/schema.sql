-- Pérola Martiniano — estrutura do banco no Supabase
-- Execute no Supabase: SQL Editor > New query > cole este arquivo > Run.

-- Conteúdo do site: duas linhas, 'draft' (rascunho) e 'published' (publicado)
create table if not exists public.site_content (
  id text primary key check (id in ('draft', 'published')),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Histórico de publicações (permite recuperar versões anteriores manualmente)
create table if not exists public.site_content_history (
  id bigint generated always as identity primary key,
  data jsonb not null,
  published_at timestamptz,
  archived_at timestamptz not null default now()
);

-- Mensagens do formulário de contato (somente se o formulário for ativado)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  channel text not null check (char_length(channel) between 6 and 120),
  message text check (char_length(message) <= 1000),
  created_at timestamptz not null default now()
);

-- Segurança: RLS ativado e NENHUMA política pública.
-- Visitantes e a chave "anon" não leem nem gravam nada diretamente.
-- O site acessa as tabelas apenas pelo servidor, com a chave service_role.
alter table public.site_content enable row level security;
alter table public.site_content_history enable row level security;
alter table public.contact_messages enable row level security;

-- Armazenamento de imagens: bucket público somente para leitura.
-- Envios são feitos pelo servidor (service_role) depois de validados e reprocessados.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;
