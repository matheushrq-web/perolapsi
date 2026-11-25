import "server-only";
import { createFileStore } from "./file";
import { createSupabaseStore } from "./supabase";
import type { ContentStore } from "./types";

/**
 * Escolhe o armazenamento:
 * - Supabase, quando SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidos;
 * - arquivos locais (data/), caso contrário.
 * CONTENT_DRIVER=file|supabase força uma das opções.
 */
let store: ContentStore | null = null;

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getStore(): ContentStore {
  if (store) return store;
  const forced = process.env.CONTENT_DRIVER;
  const useSupabase = forced ? forced === "supabase" : supabaseConfigured();
  store = useSupabase ? createSupabaseStore() : createFileStore();
  return store;
}
