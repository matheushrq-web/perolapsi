import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/site/Header";
import { ThemeScript } from "@/components/site/Theme";
import { buildMetadata, getPublished } from "@/lib/published";
import { themeCss } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getPublished();
  return buildMetadata(c, { title: `${c.privacy.title} | ${c.brand.name}`, path: "/politica-de-privacidade" });
}

/** Texto simples: linhas iniciadas por "## " viram subtítulos; linhas em branco separam parágrafos */
function blocks(body: string) {
  return body
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export default async function PrivacyPage() {
  const c = await getPublished();
  const p = c.privacy;
  return (
    <div className={`site${c.theme.grain ? " has-grain" : ""}`}>
      <ThemeScript c={c} />
      <style dangerouslySetInnerHTML={{ __html: themeCss(c) }} />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="legal-header">
        <div className="wrap">
          <Link className="brand" href="/">
            <Brand c={c} />
            <span className="visually-hidden">, página inicial</span>
          </Link>
          <Link className="link" href="/">
            Voltar ao site
          </Link>
        </div>
      </header>
      <main id="conteudo" className="legal" tabIndex={-1}>
        <div className="wrap">
          <article className="legal__inner">
            <h1>{p.title}</h1>
            {p.updatedAt && <p className="legal__meta">Última atualização: {p.updatedAt}</p>}
            {blocks(p.body).map((line, i) =>
              line.startsWith("## ") ? <h2 key={i}>{line.slice(3)}</h2> : <p key={i}>{line}</p>,
            )}
            {p.controllerEmail && (
              <>
                <h2>Contato sobre privacidade</h2>
                <p>
                  <a href={`mailto:${p.controllerEmail}`}>{p.controllerEmail}</a>
                </p>
              </>
            )}
          </article>
        </div>
      </main>
    </div>
  );
}
