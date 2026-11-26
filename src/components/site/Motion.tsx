"use client";

import { useEffect, useRef } from "react";
import type { SiteContent } from "@/content/types";

/**
 * Camada de movimento: progresso de rolagem, cursor, efeito magnético,
 * revelação de títulos/imagens, destaque de palavras e paralaxe leve.
 * Tudo usa transform/opacity, respeita prefers-reduced-motion e pode ser
 * desligado no painel (Animações).
 */
export function Motion({ settings, rev = 0 }: { settings: SiteContent["motion"]; rev?: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(settings) + rev;

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const on = settings.enabled && !reduced;
    root.dataset.motion = on ? "on" : "off";
    const cleanups: (() => void)[] = [];

    /* progresso da rolagem (sempre ativo, é informativo) */
    const bar = barRef.current;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const max = root.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (bar) bar.style.transform = `scaleX(${p})`;
        if (on && settings.parallax) parallax();
        if (on && settings.wordHighlight) words();
      });
    };

    /* revelação de títulos e imagens ao entrar na tela */
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (on && settings.reveal && "IntersectionObserver" in window) {
      root.classList.add("reveal-ready");
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      revealEls.forEach((el) => {
        // o que já está na tela aparece de imediato
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add("is-in");
        else io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    } else {
      root.classList.remove("reveal-ready");
      revealEls.forEach((el) => el.classList.add("is-in"));
    }

    /* destaque de palavras na seção de conexão (momento da página) */
    const wordBlocks = Array.from(document.querySelectorAll<HTMLElement>("[data-words]"));
    const wordSpans: HTMLElement[][] = [];
    if (on && settings.wordHighlight) {
      wordBlocks.forEach((block) => {
        wordSpans.push(Array.from(block.querySelectorAll<HTMLElement>(".w")));
        block.classList.add("words-on");
      });
    } else {
      wordBlocks.forEach((b) => b.classList.remove("words-on"));
    }
    function words() {
      wordBlocks.forEach((block, bi) => {
        const r = block.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 quando o bloco entra pela base; 1 quando seu fim passa de 55% da tela
        const start = vh * 0.92;
        const end = vh * 0.55;
        const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
        const spans = wordSpans[bi] || [];
        const lit = Math.round(p * spans.length * 1.08);
        spans.forEach((s, i) => s.classList.toggle("lit", i < lit));
      });
    }

    /* paralaxe extremamente leve, apenas em elementos decorativos */
    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    function parallax() {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0;
        const r = el.getBoundingClientRect();
        const d = r.top + r.height / 2 - vh / 2;
        el.style.translate = `0 ${(-d * speed).toFixed(1)}px`;
      });
    }
    if (!(on && settings.parallax)) parallaxEls.forEach((el) => (el.style.translate = ""));

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });

    /* cursor orgânico (só mouse; o cursor do sistema continua visível) */
    const cursor = cursorRef.current;
    if (cursor && on && settings.cursor && fine) {
      root.classList.add("has-cursor");
      let x = -100,
        y = -100,
        cx = -100,
        cy = -100,
        raf = 0,
        visible = false;
      const loop = () => {
        cx += (x - cx) * 0.2;
        cy += (y - cy) * 0.2;
        cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.1 ? requestAnimationFrame(loop) : 0;
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        x = e.clientX;
        y = e.clientY;
        if (!visible) {
          visible = true;
          cx = x;
          cy = y;
          cursor.classList.add("is-visible");
        }
        const t = e.target as Element | null;
        cursor.classList.toggle("is-hover", Boolean(t?.closest("a, button, summary, label, input, textarea, select")));
        if (!raf) raf = requestAnimationFrame(loop);
      };
      const leave = () => {
        visible = false;
        cursor.classList.remove("is-visible");
      };
      const down = () => cursor.classList.add("is-down");
      const up = () => cursor.classList.remove("is-down");
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", leave);
      window.addEventListener("pointerdown", down);
      window.addEventListener("pointerup", up);
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        root.classList.remove("has-cursor");
        cursor.classList.remove("is-visible");
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerleave", leave);
        window.removeEventListener("pointerdown", down);
        window.removeEventListener("pointerup", up);
      });
    }

    /* brilho suave que acompanha o mouse dentro de blocos marcados com data-glow */
    if (on && fine) {
      const glowEls = Array.from(document.querySelectorAll<HTMLElement>("[data-glow]"));
      const handlers = glowEls.map((el) => {
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--gx", `${e.clientX - r.left}px`);
          el.style.setProperty("--gy", `${e.clientY - r.top}px`);
        };
        el.addEventListener("pointermove", move);
        return () => el.removeEventListener("pointermove", move);
      });
      cleanups.push(() => handlers.forEach((h) => h()));
    }

    /* efeito magnético sutil nos botões principais */
    if (on && settings.magnetic && fine) {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
      const handlers = els.map((el) => {
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          el.style.translate = `${(dx * 5).toFixed(1)}px ${(dy * 4).toFixed(1)}px`;
        };
        const leave = () => (el.style.translate = "");
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
          el.style.translate = "";
        };
      });
      cleanups.push(() => handlers.forEach((h) => h()));
    }

    return () => cleanups.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <>
      <div className="progress" aria-hidden="true">
        <div ref={barRef} className="progress__bar" />
      </div>
      <div ref={cursorRef} className="cursor" aria-hidden="true" />
    </>
  );
}
