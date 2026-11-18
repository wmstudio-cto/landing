"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "../lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

/** Cabecera mínima: la marca arriba a la izquierda, navegación discreta y
 *  menú a pantalla completa en móvil. */
export function SiteHeader() {
  const header = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => header.current?.classList.toggle("is-scrolled", window.scrollY > 24);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Con el menú abierto: sin scroll de fondo y Escape lo cierra.
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={header} className={open ? "top is-open" : "top"}>
      <a href="#inicio" className="top__brand" aria-label="Whole Models, ir al inicio" onClick={() => setOpen(false)}>
        <Logo size={40} />
        <span className="wordmark">Whole Models</span>
      </a>

      <nav className="top__nav" aria-label="Secciones">
        {nav.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        className="top__burger"
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? "close" : "menu"} />
      </button>

      <div id="menu-movil" className="menu" hidden={!open} data-lenis-prevent>
        <nav aria-label="Menú">
          {nav.map((l, i) => (
            <a key={l.href} href={l.href} style={{ animationDelay: `${60 + i * 70}ms` }} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="menu__ig" href={site.instagram} target="_blank" rel="noopener noreferrer">
          <Icon name="instagram" size={20} />
          {site.instagramHandle}
        </a>
      </div>
    </header>
  );
}
