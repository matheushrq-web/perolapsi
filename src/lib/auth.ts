import "server-only";
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Autenticação do painel.
 * - Modo local: ADMIN_EMAIL + ADMIN_PASSWORD_HASH (scrypt, gerado por `npm run admin:hash`).
 * - Modo Supabase Auth: SUPABASE_URL + SUPABASE_ANON_KEY, com e-mails autorizados em ADMIN_EMAILS.
 * Depois do login, a sessão é um cookie httpOnly assinado (HMAC-SHA256) com SESSION_SECRET.
 */

export const SESSION_COOKIE = "pm_admin";
const SESSION_HOURS = 8;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) return null;
  return s;
}

export function authMode(): "supabase" | "local" | "unconfigured" {
  if (!secret()) return "unconfigured";
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.ADMIN_EMAILS) return "supabase";
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) return "local";
  return "unconfigured";
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");

export function signSession(email: string): string {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET ausente");
  const payload = b64(JSON.stringify({ sub: email, exp: Date.now() + SESSION_HOURS * 3600_000 }));
  const sig = crypto.createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): { email: string } | null {
  const key = secret();
  if (!key || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", key).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub: string; exp: number };
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { email: data.sub };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  };
}

/** scrypt: formato "salt:hash" em hexadecimal */
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyPasswordHash(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const hash = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return expected.length === hash.length && crypto.timingSafeEqual(hash, expected);
}

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const mode = authMode();
  const normalized = email.trim().toLowerCase();
  if (mode === "local") {
    const okEmail = normalized === process.env.ADMIN_EMAIL!.trim().toLowerCase();
    const okPass = verifyPasswordHash(password, process.env.ADMIN_PASSWORD_HASH!);
    return okEmail && okPass;
  }
  if (mode === "supabase") {
    const allowed = process.env.ADMIN_EMAILS!.split(",").map((e) => e.trim().toLowerCase());
    if (!allowed.includes(normalized)) return false;
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb.auth.signInWithPassword({ email: normalized, password });
    if (error || !data.user) return false;
    await sb.auth.signOut();
    return true;
  }
  return false;
}

/** Protege rotas que alteram dados: sessão válida + requisição vinda do próprio site */
export async function requireAdmin(request: Request): Promise<{ email: string } | Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!origin || !host || new URL(origin).host !== host) {
      return Response.json({ error: "Origem não permitida." }, { status: 403 });
    }
  }
  return session;
}
