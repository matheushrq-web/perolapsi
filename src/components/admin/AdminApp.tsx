"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ContactMessage, SiteContent } from "@/content/types";
import type { Review } from "@/content/validate";
import { PANELS } from "./schema";
import { FieldView, type Ctx } from "./Fields";
import { setAt } from "./path";

type Status = { kind: "idle" | "saving" | "publishing" | "error" | "ok"; text?: string };

interface Loaded {
  content: SiteContent;
  draftUpdatedAt: string | null;
  publishedUpdatedAt: string | null;
  review: Review;
  driver: "file" | "supabase";
}

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "nunca";

export function AdminApp({ email }: { email: string }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [panel, setPanel] = useState("overview");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dialog, setDialog] = useState<null | "publish" | "reset" | "blocked">(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const dirty = content !== null && JSON.stringify(content) !== saved;

  // carrega o rascunho
  useEffect(() => {
    fetch("/api/admin/content", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const json: Loaded = await r.json();
        setData(json);
        setContent(json.content);
        setSaved(JSON.stringify(json.content));
      })
      .catch(() => setStatus({ kind: "error", text: "Não foi possível carregar o conteúdo." }));
  }, []);

  // pré-visualização ao vivo
  const postPreview = useCallback((c: SiteContent) => {
    iframeRef.current?.contentWindow?.postMessage({ type: "pm-preview", content: c }, window.location.origin);
  }, []);
  useEffect(() => {
    if (!content) return;
    const t = setTimeout(() => postPreview(content), 180);
    return () => clearTimeout(t);
  }, [content, postPreview]);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "pm-preview-ready" && content) postPreview(content);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [content, postPreview]);

  // rola a pré-visualização até a seção do painel aberto
  useEffect(() => {
    const anchor = PANELS.find((p) => p.id === panel)?.anchor;
    if (anchor)
      iframeRef.current?.contentWindow?.postMessage({ type: "pm-scroll", id: anchor }, window.location.origin);
  }, [panel]);

  // aviso ao sair com alterações não salvas
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!content) return false;
    setStatus({ kind: "saving", text: "Salvando rascunho…" });
    try {
      const r = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Erro ao salvar.");
      setContent(json.content);
      setSaved(JSON.stringify(json.content));
      setData((d) => (d ? { ...d, review: json.review, draftUpdatedAt: json.updatedAt } : d));
      setStatus({ kind: "ok", text: "Rascunho salvo." });
      return true;
    } catch (e) {
      setStatus({ kind: "error", text: (e as Error).message });
      return false;
    }
  }, [content]);

  // Ctrl/Cmd + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const publish = async () => {
    if (!content) return;
    setStatus({ kind: "publishing", text: "Publicando…" });
    try {
      const r = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await r.json();
      if (r.status === 422) {
        setData((d) => (d ? { ...d, review: json.review } : d));
        setSaved(JSON.stringify(content));
        setDialog("blocked");
        setStatus({ kind: "error", text: "Publicação bloqueada: há pendências." });
        return;
      }
      if (!r.ok) throw new Error(json.error || "Erro ao publicar.");
      setContent(json.content);
      setSaved(JSON.stringify(json.content));
      setData((d) =>
        d ? { ...d, review: json.review, publishedUpdatedAt: json.updatedAt, draftUpdatedAt: json.updatedAt } : d,
      );
      setDialog(null);
      setStatus({ kind: "ok", text: "Site publicado." });
    } catch (e) {
      setStatus({ kind: "error", text: (e as Error).message });
    }
  };

  const reset = async () => {
    setStatus({ kind: "saving", text: "Restaurando…" });
    const r = await fetch("/api/admin/reset", { method: "POST" });
    const json = await r.json();
    if (!r.ok) {
      setStatus({ kind: "error", text: json.error || "Erro ao restaurar." });
      return;
    }
    setContent(json.content);
    setSaved(JSON.stringify(json.content));
    setData((d) => (d ? { ...d, review: json.review } : d));
    setDialog(null);
    setStatus({ kind: "ok", text: "Rascunho restaurado para o padrão. O site público só muda ao publicar." });
  };

  const logout = async () => {
    if (dirty && !window.confirm("Há alterações não salvas. Sair mesmo assim?")) return;
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const upload = useCallback(async (file: File, kind: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    setStatus({ kind: "saving", text: "Enviando imagem…" });
    try {
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Falha no envio.");
      setStatus({ kind: "ok", text: "Imagem enviada. Salve o rascunho para manter a alteração." });
      return json.url as string;
    } catch (e) {
      setStatus({ kind: "error", text: (e as Error).message });
      return null;
    }
  }, []);

  const ctx: Ctx | null = useMemo(
    () =>
      content
        ? {
            content,
            set: (path, value) => setContent((c) => (c ? setAt(c, path, value) : c)),
            upload,
          }
        : null,
    [content, upload],
  );

  if (!content || !data || !ctx) {
    return (
      <div className="a-loading" role="status">
        {status.kind === "error" ? status.text : "Carregando painel…"}
      </div>
    );
  }

  const current = PANELS.find((p) => p.id === panel)!;
  const groups = ["Geral", "Seções do site", "Configurações"] as const;
  const sectionVisible = (key?: string) =>
    !key || content.layout.sections.find((s) => s.key === key)?.visible !== false;

  return (
    <div className={`a-app${showPreview ? "" : " no-preview"}`}>
      <header className="a-top">
        <button
          type="button"
          className="a-burger"
          aria-expanded={navOpen}
          aria-controls="a-nav"
          onClick={() => setNavOpen((o) => !o)}
        >
          Menu
        </button>
        <div className="a-top__brand">
          <strong>Painel</strong>
          <span>{content.brand.name}</span>
        </div>
        <p className={`a-status a-status--${status.kind}`} role="status" aria-live="polite">
          {status.text ?? (dirty ? "Alterações não salvas" : `Rascunho salvo · ${fmt(data.draftUpdatedAt)}`)}
          {status.text && dirty && status.kind === "ok" ? " · há alterações não salvas" : ""}
        </p>
        <div className="a-top__actions">
          <button
            type="button"
            className="a-btn a-btn--soft a-hide-sm"
            onClick={() => setShowPreview((s) => !s)}
            aria-pressed={showPreview}
          >
            {showPreview ? "Ocultar prévia" : "Mostrar prévia"}
          </button>
          <a className="a-btn a-btn--soft a-hide-sm" href="/" target="_blank" rel="noopener noreferrer">
            Ver site
          </a>
          <button type="button" className="a-btn" onClick={save} disabled={!dirty || status.kind === "saving"}>
            Salvar rascunho
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => setDialog("publish")}
            disabled={status.kind === "publishing"}
          >
            Publicar
          </button>
        </div>
      </header>

      <nav id="a-nav" className={`a-nav${navOpen ? " is-open" : ""}`} aria-label="Seções do painel">
        {groups.map((g) => (
          <div key={g} className="a-nav__group">
            <p className="a-nav__label">{g}</p>
            <ul>
              {PANELS.filter((p) => p.group === g).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`a-nav__item${panel === p.id ? " is-active" : ""}`}
                    aria-current={panel === p.id ? "page" : undefined}
                    onClick={() => {
                      setPanel(p.id);
                      setNavOpen(false);
                    }}
                  >
                    {p.label}
                    {p.id === "overview" && data.review.blockers.length > 0 && (
                      <span className="badge badge--warn">{data.review.blockers.length}</span>
                    )}
                    {!sectionVisible(p.section) && <span className="badge">oculta</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="a-nav__foot">
          <p>{email}</p>
          <button type="button" className="a-btn a-btn--text" onClick={logout}>
            Sair
          </button>
        </div>
      </nav>

      <main className="a-main" id="a-main">
        <h1 className="a-title">{current.label}</h1>
        {panel === "overview" ? (
          <Overview data={data} content={content} dirty={dirty} onReset={() => setDialog("reset")} go={setPanel} />
        ) : panel === "messages" ? (
          <Messages enabled={content.contato.form.enabled} />
        ) : (
          <div className="a-form">
            {current.section && (
              <div className="f f--toggle a-section-toggle">
                <input
                  id="section-visible"
                  type="checkbox"
                  role="switch"
                  checked={sectionVisible(current.section)}
                  onChange={(e) =>
                    ctx.set(
                      "layout.sections",
                      content.layout.sections.map((s) =>
                        s.key === current.section ? { ...s, visible: e.target.checked } : s,
                      ),
                    )
                  }
                />
                <label htmlFor="section-visible">Exibir esta seção no site</label>
              </div>
            )}
            {current.fields.map((f, i) => (
              <FieldView key={`${panel}-${i}`} field={f} ctx={ctx} />
            ))}
          </div>
        )}
      </main>

      {showPreview && (
        <aside className="a-preview" aria-label="Pré-visualização">
          <div className="a-preview__bar">
            <span>Prévia do rascunho (atualiza enquanto você edita)</span>
            <div role="group" aria-label="Tamanho da prévia">
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`a-chip${device === d ? " is-active" : ""}`}
                  aria-pressed={device === d}
                  onClick={() => setDevice(d)}
                >
                  {d === "desktop" ? "Computador" : d === "tablet" ? "Tablet" : "Celular"}
                </button>
              ))}
            </div>
          </div>
          <div className={`a-preview__stage a-preview__stage--${device}`}>
            <iframe ref={iframeRef} src="/preview" title="Pré-visualização do site" />
          </div>
        </aside>
      )}

      {dialog && (
        <div className="a-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
          <div className="a-dialog__box">
            {dialog === "publish" && (
              <>
                <h2 id="dlg-title">Publicar alterações?</h2>
                {data.review.blockers.length > 0 ? (
                  <>
                    <p>Antes de publicar, resolva estas pendências:</p>
                    <ul className="a-list a-list--block">
                      {data.review.blockers.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <p className="f-help">A lista é atualizada ao salvar ou ao tentar publicar.</p>
                  </>
                ) : (
                  <p>O conteúdo deste rascunho passará a aparecer no site para todos os visitantes.</p>
                )}
                {data.review.warnings.length > 0 && (
                  <>
                    <p>Pontos de atenção (não impedem a publicação):</p>
                    <ul className="a-list">
                      {data.review.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="a-dialog__actions">
                  <button type="button" className="a-btn a-btn--soft" onClick={() => setDialog(null)}>
                    Cancelar
                  </button>
                  <button type="button" className="a-btn a-btn--primary" onClick={publish} autoFocus>
                    {data.review.blockers.length ? "Verificar e publicar" : "Publicar agora"}
                  </button>
                </div>
              </>
            )}
            {dialog === "blocked" && (
              <>
                <h2 id="dlg-title">Ainda não é possível publicar</h2>
                <p>O rascunho foi salvo. Resolva estas pendências e tente novamente:</p>
                <ul className="a-list a-list--block">
                  {data.review.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className="a-dialog__actions">
                  <button
                    type="button"
                    className="a-btn a-btn--primary"
                    onClick={() => {
                      setDialog(null);
                      setPanel("overview");
                    }}
                    autoFocus
                  >
                    Ver pendências
                  </button>
                </div>
              </>
            )}
            {dialog === "reset" && <ResetDialog onCancel={() => setDialog(null)} onConfirm={reset} />}
          </div>
        </div>
      )}
    </div>
  );
}

function ResetDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <>
      <h2 id="dlg-title">Restaurar configurações padrão?</h2>
      <p>
        Todos os textos, cores, fotos e listas do <strong>rascunho</strong> voltam ao modelo original. O site público só
        muda se você publicar depois. Imagens enviadas continuam guardadas.
      </p>
      <div className="f f--toggle">
        <input id="reset-ok" type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <label htmlFor="reset-ok">Entendo que as alterações do rascunho serão substituídas.</label>
      </div>
      <div className="a-dialog__actions">
        <button type="button" className="a-btn a-btn--soft" onClick={onCancel} autoFocus>
          Cancelar
        </button>
        <button type="button" className="a-btn a-btn--danger" disabled={!ok} onClick={onConfirm}>
          Restaurar padrão
        </button>
      </div>
    </>
  );
}

function Overview({
  data,
  content,
  dirty,
  onReset,
  go,
}: {
  data: Loaded;
  content: SiteContent;
  dirty: boolean;
  onReset: () => void;
  go: (id: string) => void;
}) {
  const { blockers, warnings } = data.review;
  return (
    <div className="a-overview">
      <div className="a-cards">
        <div className="a-card">
          <span>Última publicação</span>
          <strong>{fmt(data.publishedUpdatedAt)}</strong>
        </div>
        <div className="a-card">
          <span>Rascunho</span>
          <strong>{dirty ? "com alterações não salvas" : fmt(data.draftUpdatedAt)}</strong>
        </div>
        <div className="a-card">
          <span>Armazenamento</span>
          <strong>{data.driver === "supabase" ? "Supabase (banco de dados)" : "Arquivos no servidor"}</strong>
        </div>
      </div>

      <section className="a-block">
        <h2>Antes de publicar</h2>
        {blockers.length === 0 ? (
          <p className="a-ok">Nenhuma pendência obrigatória. O rascunho pode ser publicado.</p>
        ) : (
          <ul className="a-list a-list--block">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
        {warnings.length > 0 && (
          <>
            <h3>Pontos de atenção</h3>
            <ul className="a-list">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </>
        )}
        <p className="f-help">A verificação é atualizada sempre que o rascunho é salvo.</p>
        <div className="a-quick">
          <button type="button" className="a-btn a-btn--soft" onClick={() => go("brand")}>
            Preencher CRP
          </button>
          <button type="button" className="a-btn a-btn--soft" onClick={() => go("sobre")}>
            Validar “Sobre mim”
          </button>
          <button type="button" className="a-btn a-btn--soft" onClick={() => go("areas")}>
            Confirmar áreas
          </button>
          <button type="button" className="a-btn a-btn--soft" onClick={() => go("modalidades")}>
            Confirmar modalidades
          </button>
          <button type="button" className="a-btn a-btn--soft" onClick={() => go("contato")}>
            Canais de contato
          </button>
        </div>
      </section>

      <section className="a-block">
        <h2>Como funciona</h2>
        <ol className="a-steps">
          <li>Edite os textos, fotos e cores pelas seções do menu. A prévia ao lado mostra o resultado na hora.</li>
          <li>
            <strong>Salvar rascunho</strong> guarda o trabalho sem alterar o site público (atalho: Ctrl + S).
          </li>
          <li>
            <strong>Publicar</strong> leva o rascunho para o site. Informações profissionais pendentes bloqueiam a
            publicação.
          </li>
        </ol>
        <p className="f-help">
          Nome no site: {content.brand.name} · CRP: {content.brand.crp || "não informado"}
        </p>
      </section>

      <section className="a-block a-block--danger">
        <h2>Restaurar padrão</h2>
        <p>Volta o rascunho para os textos e cores originais do projeto. Pede confirmação.</p>
        <button type="button" className="a-btn a-btn--danger" onClick={onReset}>
          Restaurar configurações padrão
        </button>
      </section>
    </div>
  );
}

function Messages({ enabled }: { enabled: boolean }) {
  const [list, setList] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    fetch("/api/admin/messages", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setList(j.messages ?? []))
      .catch(() => setError("Não foi possível carregar as mensagens."));
  }, []);
  useEffect(load, [load]);
  const remove = async (id: string) => {
    if (!window.confirm("Excluir esta mensagem definitivamente?")) return;
    await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };
  return (
    <div className="a-messages">
      {!enabled && (
        <p className="f-note">
          O formulário de contato está desativado. Ative em Contato &gt; Formulário de contato e publique.
        </p>
      )}
      <p className="f-help">
        Exclua as mensagens depois de responder: elas não devem ficar guardadas além do necessário (LGPD).
      </p>
      {error && <p className="f-note f-note--warn">{error}</p>}
      {list && list.length === 0 && <p>Nenhuma mensagem recebida.</p>}
      <ul>
        {list?.map((m) => (
          <li key={m.id} className="a-msg">
            <div>
              <strong>{m.name}</strong>
              <span>{new Date(m.createdAt).toLocaleString("pt-BR")}</span>
            </div>
            <p>
              <em>Retorno:</em> {m.channel}
            </p>
            {m.message && <p>{m.message}</p>}
            <button type="button" className="a-btn a-btn--text" onClick={() => remove(m.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
