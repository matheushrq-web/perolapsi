import type { ContactMessage, SiteContent } from "@/content/types";

export interface MediaInput {
  data: Buffer;
  ext: string;
  contentType: string;
}

/** Contrato comum às duas formas de armazenamento (Supabase ou arquivo local) */
export interface ContentStore {
  readonly driver: "supabase" | "file";
  getPublished(): Promise<{ content: SiteContent; updatedAt: string | null }>;
  getDraft(): Promise<{ content: SiteContent; updatedAt: string | null }>;
  saveDraft(content: SiteContent): Promise<string>;
  publish(content: SiteContent): Promise<string>;
  saveMedia(input: MediaInput): Promise<string>;
  addMessage(msg: Omit<ContactMessage, "id" | "createdAt">): Promise<void>;
  listMessages(): Promise<ContactMessage[]>;
  deleteMessage(id: string): Promise<void>;
}
