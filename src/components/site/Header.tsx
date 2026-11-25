"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/content/types";
import { crpLine, instagramHref, SECTION_IDS, whatsappHref } from "@/lib/site";
import { InstagramIcon, WhatsAppIcon } from "./Icons";
import { ThemeToggle, useThemeSync } from "./ThemeToggle";

export function Brand({ c, compact = false }: { c: SiteContent; compact?: boolean }) {
  const crp = crpLine(c);
  if (c.brand.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="brand__logo" src={c.brand.logoUrl} alt={c.brand.logoAlt || c.brand.name} />
    );
  }
  return (
    <span className="brand__type">
      <span className="brand__name">{c.brand.name}</span>
      {!compact && (
        <span className="brand__role">
          {c.brand.role}
          {crp && <span className="brand__sep" aria-hidden="true" />}
          {crp}
        </span>
      )}
    </span>
  );
}

export function Header({ c }: { c: SiteContent }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const theme = useThemeSync(c);

  const visibleSections = new Set(c.layout.sections.filter((s) => s.visible).map((s) => s.key));
  const items = c.nav.items.filter((n) => n.visible && visibleSections.has(n.key));
  const wa = whatsappHref(c);
  const ig = instagramHref(c);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 480 && y > last + 4 ? true : y < last - 4 ? false : (h) => h);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // menu móvel: trava a rolagem, fecha com Esc e mantém o foco dentro dele
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    const first = menuRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab" && menuRef.current) {
        const nodes = [toggleRef.current, ...menuRef.current.querySelectorAll<HTMLElement>("a,button")].filter(
          Boolean,
        ) as HTMLElement[];
        const i = nodes.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          nodes[nodes.length - 1].focus();
        } else if (!e.shiftKey && i === nodes.length - 1) {
          e.preventDefault();
          nodes[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.classList.remove("menu-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`header${scrolled ? " is-scrolled" : ""}${hidden && !open ? " is-hidden" : ""}${open ? " is-open" : ""}`}
      onFocusCapture={() => setHidden(false)}
    >
      <div className="wrap header__inner">
        <a className="brand" href="#inicio">
          <Brand c={c} />
          <span className="visually-hidden">, voltar ao início</span>
        </a>

        <nav className="nav" aria-label="Principal">
          <ul>
            {items.map((n) => (
              <li key={n.key}>
                <a className="link" href={`#${SECTION_IDS[n.key]}`}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn--ghost btn--sm" href={c.nav.ctaHref} data-magnetic>
            {c.nav.ctaLabel}
          </a>
        </nav>

        <div className="header__tools">
        {c.theme.allowDark && <ThemeToggle mode={theme.mode} onToggle={theme.toggle} />}
        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
        </div>
      </div>

      <div id="menu-mobile" className="menu" ref={menuRef} hidden={!open} aria-label="Menu">
        <div className="wrap menu__inner">
          <ul className="menu__list">
            {items.map((n, i) => (
              <li key={n.key} style={{ "--i": i } as React.CSSProperties}>
                <a href={`#${SECTION_IDS[n.key]}`} onClick={close}>
                  <span className="menu__num">{String(i + 1).padStart(2, "0")}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="menu__foot">
            <a className="btn btn--primary btn--block" href={c.nav.ctaHref} onClick={close}>
              {c.nav.ctaLabel}
            </a>
            <div className="menu__channels">
              {wa && (
                <a className="link" href={wa} target="_blank" rel="noopener noreferrer" onClick={close}>
                  <WhatsAppIcon size={16} /> WhatsApp
                </a>
              )}
              {ig && (
                <a className="link" href={ig} target="_blank" rel="noopener noreferrer" onClick={close}>
                  <InstagramIcon size={15} /> @{c.contato.instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
