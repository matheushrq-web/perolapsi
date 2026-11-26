import { Fragment } from "react";
import type { SiteContent } from "@/content/types";
import { crpLine, Emph, enabledModalities, paras, plain, SECTION_IDS, whatsappHref } from "@/lib/site";
import { Breathing } from "./Breathing";
import { Photo } from "./Photo";
import { ArrowIcon, Pearl } from "./Icons";

type P = { c: SiteContent };

/* ───────────── 1. Hero ───────────── */
export function Hero({ c }: P) {
  const h = c.hero;
  const crp = crpLine(c);
  const mods = enabledModalities(c);
  const modLine = h.showModalities ? mods.map((m) => m.title) : [];
  return (
    <section
      id={SECTION_IDS.hero}
      className={`section hero hero--${h.imageSide}`}
      aria-labelledby="hero-title"
      data-enter
    >
      <div className="wrap hero__grid">
        <div className="hero__text">
          <p className="eyebrow" data-enter-item>
            <span className="eyebrow__line" aria-hidden="true" />
            {h.eyebrow}
          </p>
          <h1 id="hero-title" className="display" data-enter-item>
            <Emph text={h.title} />
          </h1>
          <div className="hero__intro" data-enter-item>
            {h.lead && <p className="lead">{h.lead}</p>}
            {paras(h.text).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="actions" data-enter-item>
            {h.primary.label && (
              <a className="btn btn--primary" href={h.primary.href} data-magnetic>
                {h.primary.label}
              </a>
            )}
            {h.secondary.label && (
              <a className="btn btn--ghost" href={h.secondary.href} data-magnetic>
                {h.secondary.label}
              </a>
            )}
          </div>
          {h.microcopy && (
            <p className="microcopy" data-enter-item>
              <Pearl size={9} />
              {h.microcopy}
            </p>
          )}
          {(crp || modLine.length > 0) && (
            <ul className="hero__facts" data-enter-item>
              {h.showCrp && crp && (
                <li>
                  {c.brand.role} · {crp}
                </li>
              )}
              {modLine.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={`hero__visual shape--${h.imageShape}`}
          style={{ "--ratio": h.imageRatio } as React.CSSProperties}
          data-enter-item
        >
          {h.decorations && (
            <>
              <span className="hero__ring" data-parallax="-0.05" aria-hidden="true" />
              <span className="hero__thread" aria-hidden="true" />
            </>
          )}
          <Photo
            image={h.image}
            preload
            reveal={false}
            className="hero__photo"
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 70vw, 92vw"
          />
          {h.decorations && <Pearl className="hero__pearl" size={46} />}
          {h.showBadge && h.badgeText.trim() && (
            <svg className="hero__badge" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
              <defs>
                <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
              </defs>
              <circle cx="60" cy="60" r="59" className="hero__badge-bg" />
              <text>
                <textPath href="#badge-circle" textLength="289" lengthAdjust="spacing">
                  {h.badgeText.toUpperCase()}
                </textPath>
              </text>
              <circle cx="60" cy="60" r="7" className="hero__badge-dot" />
            </svg>
          )}
          {h.showCrp && crp && (
            <p className="hero__vertical" aria-hidden="true">
              {c.brand.name} — {crp}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────── 2. Conexão emocional ───────────── */
export function Conexao({ c }: P) {
  const s = c.conexao;
  return (
    <section id={SECTION_IDS.conexao} className="section conexao" aria-labelledby="conexao-title">
      <span className="conexao__glow" data-parallax="0.04" aria-hidden="true" />
      <svg className="conexao__curve" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M10 10 C 120 40, 60 180, 210 200 S 470 150, 590 250" pathLength="1" data-reveal="draw" />
      </svg>
      <div className="wrap conexao__grid">
        <h2 id="conexao-title" className="h2 conexao__title" data-reveal>
          <Emph text={s.title} />
        </h2>
        <div className="conexao__text" data-words>
          {paras(s.text).map((p, i) => (
            <p key={i} className={i === 0 ? "conexao__first" : undefined}>
              {p.split(/\s+/).map((w, j) => (
                <Fragment key={j}>
                  {j > 0 && " "}
                  <span className="w">{w}</span>
                </Fragment>
              ))}
            </p>
          ))}
        </div>
        {s.highlight && (
          <figure className="conexao__quote" data-reveal>
            <span className="conexao__line" aria-hidden="true" />
            <blockquote>
              <p>{s.highlight}</p>
            </blockquote>
          </figure>
        )}
        <Pearl className="conexao__pearl" size={14} />
      </div>
    </section>
  );
}

/* ───────────── 3. Sobre mim ───────────── */
export function Sobre({ c }: P) {
  const s = c.sobre;
  const facts = s.facts.filter((f) => f.visible && f.value.trim());
  const [first, ...rest] = paras(s.text);
  return (
    <section id={SECTION_IDS.sobre} className="section sobre surface" aria-labelledby="sobre-title">
      <div className="wrap sobre__grid">
        <div className="sobre__visual">
          <span className="sobre__frame" aria-hidden="true" />
          <Photo image={s.image} className="sobre__photo" sizes="(min-width: 1024px) 36vw, 92vw" />
        </div>
        <div className="sobre__text">
          <h2 id="sobre-title" className="h2" data-reveal>
            <Emph text={s.title} />
          </h2>
          {first && <p className="lead">{first}</p>}
          {rest.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.signature && <p className="signature">{s.signature}</p>}
          {facts.length > 0 && (
            <dl className="facts">
              {facts.map((f) => (
                <div key={f.id} className="facts__row">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────── 4. Áreas de atuação ───────────── */
export function Areas({ c }: P) {
  const s = c.areas;
  const items = s.items.filter((i) => i.visible);
  return (
    <section id={SECTION_IDS.areas} className="section areas" aria-labelledby="areas-title">
      <div className="wrap">
        <div className="areas__head">
          <h2 id="areas-title" className="h2" data-reveal>
            <Emph text={s.title} />
          </h2>
          <p className="areas__sub">{s.subtitle}</p>
        </div>
        <ol className="areas__list">
          {items.map((item, i) => {
            const message = s.ctaMessage.replace(/\{area\}/g, item.title.toLowerCase());
            const href = whatsappHref(c, message) || `#${SECTION_IDS.contato}`;
            const external = href.startsWith("http");
            return (
              <li key={item.id} className="area" data-glow>
                <span className="area__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="area__title">{item.title}</h3>
                <p>{item.text}</p>
                {s.showCta && s.ctaLabel && (
                  <a
                    className="area__cta link link--arrow"
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {s.ctaLabel}
                    <span className="visually-hidden">: {item.title}</span>
                    <ArrowIcon />
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ───────────── 5. Como funciona ───────────── */
export function Processo({ c }: P) {
  const s = c.processo;
  const steps = s.steps.filter((x) => x.visible);
  return (
    <section id={SECTION_IDS.processo} className="section processo surface" aria-labelledby="processo-title">
      <div className="wrap">
        <div className="processo__head">
          <h2 id="processo-title" className="h2" data-reveal>
            <Emph text={s.title} />
          </h2>
          <p className="processo__intro">{s.intro}</p>
        </div>
        <ol className="steps" style={{ "--n": steps.length } as React.CSSProperties}>
          <li className="steps__deco" aria-hidden="true">
            <span className="steps__line" data-reveal="line" />
            <span className="steps__runner pearl" data-reveal="run" />
          </li>
          {steps.map((step, i) => (
            <li key={step.id} className="step">
              <span className="step__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="step__dot" aria-hidden="true" />
              <h3 className="step__title">
                <span className="visually-hidden">Etapa {i + 1}: </span>
                {step.title}
              </h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        {s.ctaLabel && (
          <a className="cta-line" href={s.ctaHref}>
            <span>{s.ctaLabel}</span>
            <ArrowIcon />
          </a>
        )}
      </div>
    </section>
  );
}

/* ───────────── 6. Modalidades ───────────── */
export function Modalidades({ c }: P) {
  const s = c.modalidades;
  const items = enabledModalities(c);
  const details = [
    ["Cidade", s.city],
    ["Endereço", s.address],
    ["Público atendido", s.audience],
    ["Duração das sessões", s.duration],
    ["Horários", s.hours],
    ["Informações", s.extra],
  ].filter(([, v]) => v.trim());
  if (!items.length && !details.length) return null;
  return (
    <section id={SECTION_IDS.modalidades} className="section modalidades" aria-labelledby="modalidades-title">
      <div className="wrap">
        <div className="modalidades__head">
          <h2 id="modalidades-title" className="h2" data-reveal>
            <Emph text={s.title} />
          </h2>
          {s.intro && <p>{s.intro}</p>}
        </div>
        <div className={`modalidades__grid count-${Math.min(items.length, 3)}`}>
          {items.map((m) => (
            <article key={m.id} className="modalidade">
              <Photo image={m.image} className="modalidade__photo" sizes="(min-width: 1024px) 40vw, 92vw" />
              <h3 className="modalidade__title">{m.title}</h3>
              <p>{m.text}</p>
            </article>
          ))}
        </div>
        {(details.length > 0 || s.mapUrl) && (
          <div className="modalidades__details">
            {details.length > 0 && (
              <dl>
                {details.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {s.mapUrl && (
              <a className="link link--arrow" href={s.mapUrl} target="_blank" rel="noopener noreferrer">
                {s.mapLabel}
                <ArrowIcon />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────── 7. Pausa ───────────── */
export function Pausa({ c }: P) {
  const s = c.pausa;
  return (
    <section id={SECTION_IDS.pausa} className="section pausa" aria-label="Pausa para reflexão">
      <div className="pausa__orbs" aria-hidden="true">
        <span className="orb orb--a" data-parallax="0.08" />
        <span className="orb orb--b" data-parallax="-0.06" />
        <span className="ring ring--a" />
        <span className="ring ring--b" />
      </div>
      <div className="wrap pausa__inner">
        <Pearl className="pausa__pearl" size={18} />
        <blockquote className="pausa__quote" data-reveal>
          <p>“{plain(s.quote)}”</p>
        </blockquote>
        {s.text && <p className="pausa__text">{s.text}</p>}
        {s.breathing && <Breathing c={c} />}
      </div>
    </section>
  );
}
