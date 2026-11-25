"use client";

import { useEffect, useState } from "react";
import { Site } from "@/components/site/Site";
import type { SiteContent } from "@/content/types";

export function PreviewClient({ initial, year }: { initial: SiteContent; year: number }) {
  const [content, setContent] = useState(initial);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "pm-preview" && e.data.content) {
        setContent(e.data.content as SiteContent);
        setRev((r) => r + 1);
      }
      if (e.data?.type === "pm-scroll" && typeof e.data.id === "string") {
        if (e.data.id === "inicio") window.scrollTo({ top: 0, behavior: "smooth" });
        else document.getElementById(e.data.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "pm-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <>
      <div className="preview-badge" aria-hidden="true">
        Pré-visualização do rascunho
      </div>
      <Site c={content} year={year} preview rev={rev} />
      <style>{`.preview-badge{position:fixed;left:12px;bottom:12px;z-index:400;padding:.4rem .8rem;border-radius:999px;background:#211B15;color:#F4EEE7;font:600 11px/1.2 system-ui;letter-spacing:.06em;text-transform:uppercase;opacity:.85;pointer-events:none}`}</style>
    </>
  );
}
