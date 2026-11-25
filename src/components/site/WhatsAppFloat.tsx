"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "./Icons";

/** Botão flutuante discreto: aparece depois da primeira dobra e some na seção de contato */
export function WhatsAppFloat({ href }: { href: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contato");
    let contactVisible = false;
    const io = contact
      ? new IntersectionObserver(([e]) => {
          contactVisible = e.isIntersecting;
          update();
        })
      : null;
    if (contact && io) io.observe(contact);
    function update() {
      setShow(window.scrollY > window.innerHeight * 0.8 && !contactVisible);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      io?.disconnect();
    };
  }, []);

  return (
    <a
      className={`wa-float${show ? " is-shown" : ""}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp (abre em nova aba)"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
    >
      <WhatsAppIcon size={24} />
    </a>
  );
}
