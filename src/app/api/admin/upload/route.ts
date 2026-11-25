import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

/** Identifica o formato pelos bytes iniciais (não confia na extensão nem no tipo enviado) */
function sniff(buf: Buffer): "jpeg" | "png" | "webp" | "avif" | null {
  if (buf.length < 16) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp" && /avi[fs]/.test(buf.toString("ascii", 8, 12))) return "avif";
  return null;
}

/**
 * Envio de imagens. Tipos: photo (foto do site), logo, favicon, og (compartilhamento).
 * Tudo é reprocessado com sharp: remove metadados (EXIF/GPS), limita dimensões e converte para WebP/PNG.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Envio inválido." }, { status: 400 });
  }
  const file = form.get("file");
  const kind = String(form.get("kind") || "photo");
  if (!(file instanceof File)) return Response.json({ error: "Selecione um arquivo." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Arquivo maior que 10 MB." }, { status: 413 });

  const input = Buffer.from(await file.arrayBuffer());
  if (!sniff(input)) {
    return Response.json({ error: "Formato não aceito. Envie JPG, PNG, WebP ou AVIF." }, { status: 415 });
  }

  try {
    let data: Buffer;
    let ext: string;
    let contentType: string;
    const base = sharp(input, { failOn: "error" }).rotate(); // aplica a orientação e descarta EXIF
    if (kind === "favicon") {
      data = await base.resize(512, 512, { fit: "cover" }).png().toBuffer();
      ext = "png";
      contentType = "image/png";
    } else if (kind === "logo") {
      data = await base.resize({ width: 1200, height: 600, fit: "inside", withoutEnlargement: true }).png().toBuffer();
      ext = "png";
      contentType = "image/png";
    } else if (kind === "og") {
      data = await base.resize(1200, 630, { fit: "cover" }).jpeg({ quality: 84 }).toBuffer();
      ext = "jpg";
      contentType = "image/jpeg";
    } else {
      data = await base
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      ext = "webp";
      contentType = "image/webp";
    }
    const url = await getStore().saveMedia({ data, ext, contentType });
    return Response.json({ url });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Não foi possível processar a imagem." }, { status: 500 });
  }
}
