import { Fragment } from "react";
import type { SectionKey, SiteContent } from "@/content/types";
import { themeCss, whatsappHref } from "@/lib/site";
import { Header } from "./Header";
import { ThemeScript } from "./Theme";
import { Areas, Conexao, Hero, Modalidades, Pausa, Processo, Sobre } from "./Sections";
import { Faq } from "./Faq";
import { Contato } from "./Contact";
import { Footer } from "./Footer";
import { Motion } from "./Motion";
import { WhatsAppFloat } from "./WhatsAppFloat";

/**
 * Página completa a partir do conteúdo. É usada pelo site público (conteúdo publicado)
 * e pela pré-visualização do painel (rascunho, atualizado ao vivo).
 */
export function Site({
  c,
  year,
  preview = false,
  rev = 0,
}: {
  c: SiteContent;
  year: number;
  preview?: boolean;
  /** muda a cada atualização da pré-visualização, para reaplicar as animações */
  rev?: number;
}) {
  const render: Record<SectionKey, () => React.ReactNode> = {
    hero: () => <Hero c={c} />,
    conexao: () => <Conexao c={c} />,
    sobre: () => <Sobre c={c} />,
    areas: () => <Areas c={c} />,
    processo: () => <Processo c={c} />,
    modalidades: () => <Modalidades c={c} />,
    pausa: () => <Pausa c={c} />,
    faq: () => <Faq c={c} />,
    contato: () => <Contato c={c} preview={preview} />,
  };
  const wa = whatsappHref(c);

  return (
    <div className={`site${c.theme.grain ? " has-grain" : ""}`}>
      <ThemeScript c={c} />
      <style dangerouslySetInnerHTML={{ __html: themeCss(c) }} />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header c={c} />
      <main id="conteudo" tabIndex={-1}>
        {c.layout.sections
          .filter((s) => s.visible)
          .map((s) => (
            <Fragment key={s.key}>{render[s.key]()}</Fragment>
          ))}
      </main>
      <Footer c={c} year={year} />
      {wa && c.motion.whatsappFloat && <WhatsAppFloat href={wa} />}
      <Motion settings={c.motion} rev={rev} />
    </div>
  );
}
