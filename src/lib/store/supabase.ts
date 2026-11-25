import "server-only";
import crypto from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { withDefaults } from "@/content/validate";
import type { ContactMessage, SiteContent } from "@/content/types";
import type { ContentStore, MediaInput } from "./types";

/**
 * Armazenamento no Supabase (Postgres + Storage).
 * Usa a chave service_role APENAS no servidor. As tabelas têm RLS ativado
 * sem políticas públicas: nenhum visitante lê ou grava diretamente.
 * Estrutura: supabase/schema.sql
 */

const BUCKET = process.env.SUPABASE_BUCKET || "site-media";

let client: SupabaseClient | null = null;
function db() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

async function readDoc(id: "draft" | "published") {
  const { data, error } = await db().from("site_content").select("data, updated_at").eq("id", id).maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data as { data: SiteContent; updated_at: string } | null;
}

async function writeDoc(id: "draft" | "published", content: SiteContent) {
  const updatedAt = new Date().toISOString();
  const { error } = await db()
    .from("site_content")
    .upsert({ id, data: content, updated_at: updatedAt }, { onConflict: "id" });
  if (error) throw new Error(`Supabase: ${error.message}`);
  return updatedAt;
}

export function createSupabaseStore(): ContentStore {
  return {
    driver: "supabase",

    async getPublished() {
      const doc = await readDoc("published");
      return { content: withDefaults(doc?.data), updatedAt: doc?.updated_at ?? null };
    },

    async getDraft() {
      const doc = (await readDoc("draft")) ?? (await readDoc("published"));
      return { content: withDefaults(doc?.data), updatedAt: doc?.updated_at ?? null };
    },

    saveDraft(content) {
      return writeDoc("draft", content);
    },

    async publish(content) {
      const previous = await readDoc("published");
      if (previous) {
        await db().from("site_content_history").insert({ data: previous.data, published_at: previous.updated_at });
      }
      const at = await writeDoc("published", content);
      await writeDoc("draft", content);
      return at;
    },

    async saveMedia({ data, ext, contentType }: MediaInput) {
      const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
      const { error } = await db().storage.from(BUCKET).upload(name, data, {
        contentType,
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw new Error(`Supabase Storage: ${error.message}`);
      return db().storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
    },

    async addMessage(msg) {
      const { error } = await db().from("contact_messages").insert({
        name: msg.name,
        channel: msg.channel,
        message: msg.message,
      });
      if (error) throw new Error(`Supabase: ${error.message}`);
    },

    async listMessages() {
      const { data, error } = await db()
        .from("contact_messages")
        .select("id, name, channel, message, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw new Error(`Supabase: ${error.message}`);
      return (data ?? []).map(
        (m): ContactMessage => ({
          id: m.id,
          name: m.name,
          channel: m.channel,
          message: m.message ?? "",
          createdAt: m.created_at,
        }),
      );
    },

    async deleteMessage(id) {
      const { error } = await db().from("contact_messages").delete().eq("id", id);
      if (error) throw new Error(`Supabase: ${error.message}`);
    },
  };
}
