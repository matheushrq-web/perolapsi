import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { withDefaults } from "@/content/validate";
import type { ContactMessage, SiteContent, StoredDoc } from "@/content/types";
import type { ContentStore, MediaInput } from "./types";

/**
 * Armazenamento em arquivos no servidor (pasta data/).
 * Indicado para desenvolvimento e para hospedagem com disco persistente (VPS, Docker com volume).
 * NÃO use em plataformas serverless (Vercel, Netlify): o disco é apagado a cada deploy.
 */

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const file = (name: string) => path.join(DATA_DIR, name);

async function readJson<T>(name: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file(name), "utf8")) as T;
  } catch {
    return null;
  }
}

async function writeJson(name: string, value: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = file(name);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, target); // gravação atômica
}

export function createFileStore(): ContentStore {
  return {
    driver: "file",

    async getPublished() {
      const doc = await readJson<StoredDoc>("published.json");
      return { content: withDefaults(doc?.content), updatedAt: doc?.updatedAt ?? null };
    },

    async getDraft() {
      const doc = (await readJson<StoredDoc>("draft.json")) ?? (await readJson<StoredDoc>("published.json"));
      return { content: withDefaults(doc?.content), updatedAt: doc?.updatedAt ?? null };
    },

    async saveDraft(content: SiteContent) {
      const updatedAt = new Date().toISOString();
      await writeJson("draft.json", { content, updatedAt });
      return updatedAt;
    },

    async publish(content: SiteContent) {
      const updatedAt = new Date().toISOString();
      const previous = await readJson<StoredDoc>("published.json");
      if (previous) {
        await fs.mkdir(file("history"), { recursive: true });
        await writeJson(path.join("history", `${previous.updatedAt.replace(/[:.]/g, "-")}.json`), previous);
      }
      await writeJson("published.json", { content, updatedAt });
      await writeJson("draft.json", { content, updatedAt });
      return updatedAt;
    },

    async saveMedia({ data, ext }: MediaInput) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
      await fs.writeFile(path.join(UPLOAD_DIR, name), data);
      return `/media/${name}`;
    },

    async addMessage(msg) {
      const list = (await readJson<ContactMessage[]>("messages.json")) ?? [];
      list.unshift({ ...msg, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
      await writeJson("messages.json", list.slice(0, 500));
    },

    async listMessages() {
      return (await readJson<ContactMessage[]>("messages.json")) ?? [];
    },

    async deleteMessage(id: string) {
      const list = (await readJson<ContactMessage[]>("messages.json")) ?? [];
      await writeJson(
        "messages.json",
        list.filter((m) => m.id !== id),
      );
    },
  };
}
