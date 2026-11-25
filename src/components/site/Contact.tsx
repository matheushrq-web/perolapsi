import type { SiteContent } from "@/content/types";
import { Emph, formatPhone, instagramHref, paras, SECTION_IDS, whatsappHref } from "@/lib/site";
import { ArrowIcon, InstagramIcon, WhatsAppIcon } from "./Icons";
import { ContactForm } from "./ContactForm";
import { Photo } from "./Photo";

export function Contato({ c, preview = false }: { c: SiteContent; preview?: boolean }) {
  const s = c.contato;
  const wa = whatsappHref(c);
  const ig = instagramHref(c);
  const channels: { label: string; value: string; href?: string }[] = [];
  if (wa) channels.push({ label: "WhatsApp", value: formatPhone(s.whatsapp), href: wa });
  if (ig) channels.push({ label: "Instagram", value: `@${s.instagram}`, href: ig });
  if (s.email) channels.push({ label: "E-mail", value: s.email, href: `mailto:${s.email}` });
  if (s.address) channels.push({ label: "Endereço", value: s.address });
  if (s.hours) channels.push({ label: "Horários", value: s.hours });

  return (
    <section id={SECTION_IDS.contato} className="section contato" aria-labelledby="contato-title">
      <div className="wrap">
        <h2 id="contato-title" className="h2 contato__title" data-reveal>
          <Emph text={s.title} />
        </h2>
        <div className={`contato__grid${s.form.enabled ? " has-form" : ""}`}>
          <div className="contato__text">
            {paras(s.text).map((p, i) => (
              <p key={i} className={i === 1 ? "contato__soft" : undefined}>
                {p}
              </p>
            ))}
            <div className="actions">
              {wa ? (
                <a className="btn btn--primary" href={wa} target="_blank" rel="noopener noreferrer" data-magnetic>
                  <WhatsAppIcon size={18} />
                  {s.whatsappLabel}
                </a>
              ) : ig ? (
                <a className="btn btn--primary" href={ig} target="_blank" rel="noopener noreferrer" data-magnetic>
                  <InstagramIcon size={16} />
                  Conversar pelo Instagram
                </a>
              ) : null}
              {s.bookingUrl && (
                <a className="btn btn--ghost" href={s.bookingUrl} target="_blank" rel="noopener noreferrer">
                  {s.bookingLabel}
                </a>
              )}
            </div>
          </div>

          <div className="contato__side">
            {c.contato.image.url && (
              <Photo image={c.contato.image} className="contato__photo" sizes="(min-width: 1024px) 36vw, 92vw" />
            )}
            {channels.length > 0 && (
              <dl className="channels">
                {channels.map((ch) => (
                  <div key={ch.label} className="channels__row">
                    <dt>{ch.label}</dt>
                    <dd>
                      {ch.href ? (
                        <a
                          className="link link--arrow"
                          href={ch.href}
                          {...(ch.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {ch.value}
                          <ArrowIcon />
                        </a>
                      ) : (
                        ch.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {s.form.enabled && <ContactForm c={c} preview={preview} />}
          </div>
        </div>

        <div className="notices">
          <p>
            {s.privacyNotice} <a href="/politica-de-privacidade">Ler a Política de Privacidade</a>.
          </p>
          <p className="notices__emergency">{s.emergencyNotice}</p>
        </div>
      </div>
    </section>
  );
}
