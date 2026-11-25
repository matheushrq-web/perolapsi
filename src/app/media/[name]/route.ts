import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/store/file";

/** Serve as imagens enviadas pelo painel no modo de armazenamento em arquivo */
const TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
};

export async function GET(_req: Request, ctx: RouteContext<"/media/[name]">) {
  const { name } = await ctx.params;
  const m = /^[a-z0-9-]+\.(webp|png|jpg)$/.exec(name);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[m[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
