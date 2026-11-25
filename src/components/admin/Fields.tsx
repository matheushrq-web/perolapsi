"use client";

import { useId, useRef, useState } from "react";
import type { ImageRef, SectionKey, SiteContent } from "@/content/types";
import { ITEM_TEMPLATES } from "@/content/defaults";
import { SECTION_NAMES } from "@/lib/site";
import type { Field } from "./schema";
import { getAt, join } from "./path";

export interface Ctx {
  content: SiteContent;
  set: (path: string, value: unknown) => void;
  upload: (file: File, kind: string) => Promise<string | null>;
}

export function FieldView({ field, base = "", ctx }: { field: Field; base?: string; ctx: Ctx }) {
  switch (field.type) {
    case "heading":
      return (
        <div className="f-heading">
          <h3>{field.label}</h3>
          {field.help && <p>{field.help}</p>}
        </div>
      );
    case "note":
      return <p className={`f-note${field.tone === "warn" ? " f-note--warn" : ""}`}>{field.text}</p>;
    case "text":
      return <TextField field={field} path={join(base, field.path)} ctx={ctx} />;
    case "toggle":
      return <Toggle path={join(base, field.path)} label={field.label} help={field.help} ctx={ctx} />;
    case "confirm":
      return (
        <div className="f-confirm">
          <Toggle path={field.path} label={field.label} help={field.help} ctx={ctx} />
        </div>
      );
    case "select":
      return <SelectField field={field} path={join(base, field.path)} ctx={ctx} />;
    case "range":
      return <RangeField field={field} path={join(base, field.path)} ctx={ctx} />;
    case "color":
      return <ColorField field={field} path={join(base, field.path)} ctx={ctx} />;
    case "image":
      return <ImageField label={field.label} help={field.help} path={join(base, field.path)} ctx={ctx} />;
    case "upload":
      return <UploadField field={field} path={join(base, field.path)} ctx={ctx} />;
    case "list":
      return <ListField field={field} path={join(base, field.path)} ctx={ctx} />;
    case "sections":
      return <SectionsField ctx={ctx} />;
    case "nav":
      return <NavField ctx={ctx} />;
  }
}

function TextField({ field, path, ctx }: { field: Extract<Field, { type: "text" }>; path: string; ctx: Ctx }) {
  const id = useId();
  const value = String(getAt(ctx.content, path) ?? "");
  const empty = field.required && !value.trim();
  return (
    <div className={`f${empty ? " f--missing" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {empty && <span className="badge badge--warn">preencher</span>}
      </label>
      {field.rows ? (
        <textarea
          id={id}
          rows={field.rows}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => ctx.set(path, e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => ctx.set(path, e.target.value)}
        />
      )}
      {field.help && <p className="f-help">{field.help}</p>}
    </div>
  );
}

function Toggle({ path, label, help, ctx }: { path: string; label: string; help?: string; ctx: Ctx }) {
  const id = useId();
  const checked = Boolean(getAt(ctx.content, path));
  return (
    <div className="f f--toggle">
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => ctx.set(path, e.target.checked)}
      />
      <label htmlFor={id}>
        {label}
        {help && <span className="f-help">{help}</span>}
      </label>
    </div>
  );
}

function SelectField({ field, path, ctx }: { field: Extract<Field, { type: "select" }>; path: string; ctx: Ctx }) {
  const id = useId();
  return (
    <div className="f">
      <label htmlFor={id}>{field.label}</label>
      <select id={id} value={String(getAt(ctx.content, path))} onChange={(e) => ctx.set(path, e.target.value)}>
        {field.options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {field.help && <p className="f-help">{field.help}</p>}
    </div>
  );
}

function RangeField({ field, path, ctx }: { field: Extract<Field, { type: "range" }>; path: string; ctx: Ctx }) {
  const id = useId();
  const value = Number(getAt(ctx.content, path));
  return (
    <div className="f f--range">
      <label htmlFor={id}>
        {field.label}
        <output htmlFor={id}>
          {value}
          {field.unit}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(e) => ctx.set(path, Number(e.target.value))}
      />
    </div>
  );
}

function ColorField({ field, path, ctx }: { field: Extract<Field, { type: "color" }>; path: string; ctx: Ctx }) {
  const id = useId();
  const value = String(getAt(ctx.content, path));
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setDraft(value);
  }
  return (
    <div className="f f--color">
      <input
        type="color"
        aria-label={`${field.label}: seletor`}
        value={value}
        onChange={(e) => ctx.set(path, e.target.value.toUpperCase())}
      />
      <div>
        <label htmlFor={id}>{field.label}</label>
        {field.help && <p className="f-help">{field.help}</p>}
      </div>
      <input
        id={id}
        className="f-hex"
        value={draft}
        maxLength={7}
        spellCheck={false}
        onChange={(e) => {
          setDraft(e.target.value);
          if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) ctx.set(path, e.target.value.toUpperCase());
        }}
      />
    </div>
  );
}

function UploadButton({
  kind,
  onUrl,
  ctx,
  label = "Enviar imagem",
}: {
  kind: string;
  onUrl: (url: string) => void;
  ctx: Ctx;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          const url = await ctx.upload(file, kind);
          setBusy(false);
          if (url) onUrl(url);
        }}
      />
      <button type="button" className="a-btn a-btn--soft" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? "Enviando…" : label}
      </button>
    </>
  );
}

function UploadField({ field, path, ctx }: { field: Extract<Field, { type: "upload" }>; path: string; ctx: Ctx }) {
  const url = String(getAt(ctx.content, path) ?? "");
  return (
    <div className="f">
      <span className="f-label">{field.label}</span>
      <div className="f-upload">
        <div className={`f-upload__thumb f-upload__thumb--${field.kind}`}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" />
          ) : (
            <span>Nenhuma</span>
          )}
        </div>
        <div className="f-upload__actions">
          <UploadButton kind={field.kind} ctx={ctx} onUrl={(u) => ctx.set(path, u)} />
          {url && (
            <button type="button" className="a-btn a-btn--text" onClick={() => ctx.set(path, "")}>
              Remover
            </button>
          )}
        </div>
      </div>
      {field.help && <p className="f-help">{field.help}</p>}
    </div>
  );
}

function ImageField({ label, help, path, ctx }: { label: string; help?: string; path: string; ctx: Ctx }) {
  const img = getAt(ctx.content, path) as ImageRef;
  const altId = useId();
  const urlId = useId();
  const zoomId = useId();
  const setImg = (patch: Partial<ImageRef>) => ctx.set(path, { ...img, ...patch });

  const pick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setImg({
      focalX: Math.round(((e.clientX - r.left) / r.width) * 100),
      focalY: Math.round(((e.clientY - r.top) / r.height) * 100),
    });
  };
  const nudge = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    setImg({
      focalX: Math.min(100, Math.max(0, img.focalX + d[0])),
      focalY: Math.min(100, Math.max(0, img.focalY + d[1])),
    });
  };

  return (
    <fieldset className="f f-image">
      <legend>{label}</legend>
      {img.url ? (
        <button
          type="button"
          className="f-image__stage"
          onClick={pick}
          onKeyDown={nudge}
          aria-label={`Ponto de foco: ${img.focalX}% horizontal, ${img.focalY}% vertical. Clique ou use as setas para ajustar.`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url} alt="" />
          <span className="f-image__focus" style={{ left: `${img.focalX}%`, top: `${img.focalY}%` }} />
        </button>
      ) : (
        <div className="f-image__empty">Sem foto. O site mostrará uma moldura neutra.</div>
      )}
      <div className="f-image__actions">
        <UploadButton
          kind="photo"
          ctx={ctx}
          label={img.url ? "Substituir foto" : "Enviar foto"}
          onUrl={(u) => setImg({ url: u, standIn: false, focalX: 50, focalY: 50, zoom: 1 })}
        />
        {img.url && (
          <button type="button" className="a-btn a-btn--text" onClick={() => setImg({ url: "" })}>
            Remover
          </button>
        )}
      </div>
      {img.standIn && img.url && (
        <p className="f-note f-note--warn">Foto ilustrativa provisória. Substitua por uma fotografia real.</p>
      )}
      <div className="f f--range">
        <label htmlFor={zoomId}>
          Zoom do enquadramento<output htmlFor={zoomId}>{img.zoom.toFixed(2)}×</output>
        </label>
        <input
          id={zoomId}
          type="range"
          min={1}
          max={2}
          step={0.05}
          value={img.zoom}
          onChange={(e) => setImg({ zoom: Number(e.target.value) })}
        />
      </div>
      <div className="f">
        <label htmlFor={altId}>Descrição da imagem (texto alternativo)</label>
        <input id={altId} value={img.alt} onChange={(e) => setImg({ alt: e.target.value })} />
        <p className="f-help">Descreva o que aparece na foto, para quem usa leitor de tela.</p>
      </div>
      <details className="f-more">
        <summary>Usar endereço de imagem</summary>
        <div className="f">
          <label htmlFor={urlId}>Endereço (https://…)</label>
          <input id={urlId} value={img.url} onChange={(e) => setImg({ url: e.target.value })} />
        </div>
        <div className="f f--toggle">
          <input
            id={`${urlId}-s`}
            type="checkbox"
            checked={img.standIn}
            onChange={(e) => setImg({ standIn: e.target.checked })}
          />
          <label htmlFor={`${urlId}-s`}>É uma foto ilustrativa (não é da profissional)</label>
        </div>
      </details>
      {help && <p className="f-help">{help}</p>}
    </fieldset>
  );
}

function ListField({ field, path, ctx }: { field: Extract<Field, { type: "list" }>; path: string; ctx: Ctx }) {
  const items = (getAt(ctx.content, path) as Record<string, unknown>[]) ?? [];
  const [open, setOpen] = useState<string | null>(null);

  const move = (i: number, d: number) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    ctx.set(path, next);
  };
  const remove = (i: number) => {
    const title = String(items[i][field.itemTitle] || "este item");
    if (!window.confirm(`Excluir “${title}”?`)) return;
    ctx.set(
      path,
      items.filter((_, k) => k !== i),
    );
  };
  const add = () => {
    const tpl = (ITEM_TEMPLATES as Record<string, Record<string, unknown>>)[path];
    const id = `n${crypto.randomUUID().slice(0, 8)}`;
    ctx.set(path, [...items, { ...structuredClone(tpl), id }]);
    setOpen(id);
  };

  return (
    <div className="f f-list">
      <div className="f-list__head">
        <span className="f-label">{field.label}</span>
        <span className="f-count">{items.length}</span>
      </div>
      {field.help && <p className="f-help">{field.help}</p>}
      <ol>
        {items.map((item, i) => {
          const id = String(item.id);
          const isOpen = open === id;
          const visible = item.visible !== false;
          return (
            <li key={id} className={`f-item${isOpen ? " is-open" : ""}${visible ? "" : " is-hidden"}`}>
              <div className="f-item__bar">
                <button
                  type="button"
                  className="f-item__title"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : id)}
                >
                  <span className="f-item__num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{String(item[field.itemTitle] || "Sem título")}</span>
                  {!visible && <span className="badge">oculto</span>}
                </button>
                <div className="f-item__tools">
                  <button
                    type="button"
                    className="icon-btn"
                    title={visible ? "Ocultar no site" : "Mostrar no site"}
                    aria-label={visible ? "Ocultar no site" : "Mostrar no site"}
                    aria-pressed={!visible}
                    onClick={() => ctx.set(join(path, i, "visible"), !visible)}
                  >
                    {visible ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Mover para cima"
                    title="Mover para cima"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Mover para baixo"
                    title="Mover para baixo"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    aria-label="Excluir"
                    title="Excluir"
                    onClick={() => remove(i)}
                  >
                    ×
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="f-item__body">
                  {field.fields.map((f, k) => (
                    <FieldView key={k} field={f} base={join(path, i)} ctx={ctx} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button type="button" className="a-btn a-btn--soft" onClick={add}>
        + {field.addLabel}
      </button>
    </div>
  );
}

function SectionsField({ ctx }: { ctx: Ctx }) {
  const sections = ctx.content.layout.sections;
  const move = (i: number, d: number) => {
    const next = [...sections];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    ctx.set("layout.sections", next);
  };
  return (
    <div className="f f-list">
      <p className="f-help">
        Reorganize e oculte seções. Recomenda-se manter “Início” no topo e “Contato” perto do fim.
      </p>
      <ol>
        {sections.map((s, i) => (
          <li key={s.key} className={`f-item${s.visible ? "" : " is-hidden"}`}>
            <div className="f-item__bar">
              <span className="f-item__title f-item__title--static">
                <span className="f-item__num">{String(i + 1).padStart(2, "0")}</span>
                {SECTION_NAMES[s.key as SectionKey]}
                {!s.visible && <span className="badge">oculta</span>}
              </span>
              <div className="f-item__tools">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={s.visible ? "Ocultar seção" : "Mostrar seção"}
                  title={s.visible ? "Ocultar seção" : "Mostrar seção"}
                  aria-pressed={!s.visible}
                  onClick={() => ctx.set(join("layout.sections", i, "visible"), !s.visible)}
                >
                  {s.visible ? <EyeIcon /> : <EyeOffIcon />}
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Mover para cima"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Mover para baixo"
                  disabled={i === sections.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function NavField({ ctx }: { ctx: Ctx }) {
  const items = ctx.content.nav.items;
  return (
    <div className="f f-list">
      <p className="f-help">Textos dos links do menu. Links de seções ocultas somem automaticamente.</p>
      <ol>
        {items.map((n, i) => (
          <li key={n.key} className={`f-item f-item--row${n.visible ? "" : " is-hidden"}`}>
            <label className="visually-hidden" htmlFor={`nav-${n.key}`}>
              Texto do link para {SECTION_NAMES[n.key]}
            </label>
            <input
              id={`nav-${n.key}`}
              value={n.label}
              onChange={(e) => ctx.set(join("nav.items", i, "label"), e.target.value)}
            />
            <span className="f-item__hint">{SECTION_NAMES[n.key]}</span>
            <button
              type="button"
              className="icon-btn"
              aria-label={n.visible ? "Ocultar do menu" : "Mostrar no menu"}
              aria-pressed={!n.visible}
              onClick={() => ctx.set(join("nav.items", i, "visible"), !n.visible)}
            >
              {n.visible ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.4 9.4 0 005.4-1.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
