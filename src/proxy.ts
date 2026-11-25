import { NextResponse, type NextRequest } from "next/server";

/**
 * Primeira barreira do painel: sem cookie de sessão, /admin e /preview levam ao login.
 * A assinatura do cookie é verificada de novo em cada página e rota da API (src/lib/auth.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const hasSession = Boolean(request.cookies.get("pm_admin")?.value);
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/preview/:path*"],
};
