"use client";

import { useId, useState } from "react";
import type { SiteContent } from "@/content/types";
import { Emph, SECTION_IDS } from "@/lib/site";
import { ArrowIcon } from "./Icons";

export function Faq({ c }: { c: SiteContent }) {
  const s = c.faq;
  const items = s.items.filter((i) => i.visible);
  const [open, setOpen] = useState<string | null>(null);
  const uid = useId();

  return (
    <section id={SECTION_IDS.faq} className="section faq surface" aria-labelledby="faq-title">
      <div className="wrap faq__grid">
        <div className="faq__head">
          <h2 id="faq-title" className="h2" data-reveal>
            <Emph text={s.title} />
          </h2>
          <p>{s.subtitle}</p>
          {s.moreLabel && (
            <a className="link link--arrow" href={`#${SECTION_IDS.contato}`}>
              {s.moreLabel}
              <ArrowIcon />
            </a>
          )}
        </div>
        <div className="accordion">
          {items.map((item) => {
            const isOpen = open === item.id;
            const btn = `${uid}-b-${item.id}`;
            const panel = `${uid}-p-${item.id}`;
            return (
              <div key={item.id} className={`acc${isOpen ? " is-open" : ""}`}>
                <h3 className="acc__h">
                  <button
                    id={btn}
                    type="button"
                    className="acc__btn"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? null : item.id)}
                  >
                    <span>{item.question}</span>
                    <span className="acc__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={panel} role="region" aria-labelledby={btn} className="acc__panel" inert={!isOpen}>
                  <div className="acc__inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
