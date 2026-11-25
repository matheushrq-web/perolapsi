import type { SiteContent } from "@/content/types";
import { crpLine, Emph, formatPhone, SECTION_IDS, whatsappHref } from "@/lib/site";
import { Brand } from "./Header";

export function Footer({ c, year }: { c: SiteContent; year: number }) {
  const f = c.footer;
  const crp = crpLine(c);
  const visibleSections = new Set(c.layout.sections.filter((s) => s.visible).map((s) => s.key));
  const nav = c.nav.items.filter((n) => n.visible && visibleSections.has(n.key));
  const wa = whatsappHref(c);
  const socials = f.socials.filter((s) => s.visible && s.href && s.href !== "https://");

  return (
    <footer className="footer">
      <div className="wrap">
        <p className="footer__closing">
          <Emph text={f.closing} />
        </p>
        <div className="footer__grid">
          <div className="footer__brand">
            <a href="#inicio" className="brand brand--light">
              <Brand c={c} compact />
              <span className="visually-hidden">, voltar ao início</span>
            </a>
            <p>
              {c.brand.role}
              {crp && ` · ${crp}`}
            </p>
          </div>
          <nav aria-label="Rodapé">
            <h2 className="footer__h">Navegação</h2>
            <ul>
              {nav.map((n) => (
                <li key={n.key}>
                  <a className="link" href={`#${SECTION_IDS[n.key]}`}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="footer__h">Contato</h2>
            <ul>
              {wa && (
                <li>
                  <a className="link" href={wa} target="_blank" rel="noopener noreferrer">
                    WhatsApp {formatPhone(c.contato.whatsapp)}
                  </a>
                </li>
              )}
              {c.contato.email && (
                <li>
                  <a className="link" href={`mailto:${c.contato.email}`}>
                    {c.contato.email}
                  </a>
                </li>
              )}
              {c.contato.address && <li>{c.contato.address}</li>}
              {c.contato.hours && <li>{c.contato.hours}</li>}
              {!wa && !c.contato.email && (
                <li>
                  <a className="link" href={`#${SECTION_IDS.contato}`}>
                    Canais de contato
                  </a>
                </li>
              )}
            </ul>
          </div>
          {socials.length > 0 && (
            <div>
              <h2 className="footer__h">Redes</h2>
              <ul>
                {socials.map((s) => (
                  <li key={s.id}>
                    <a className="link" href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="footer__bottom">
          <p>
            © {year} {c.brand.name}. {f.rights}
          </p>
          <a className="link" href="/politica-de-privacidade">
            Política de Privacidade
          </a>
          {f.credits && <p className="footer__credits">{f.credits}</p>}
        </div>
      </div>
    </footer>
  );
}
