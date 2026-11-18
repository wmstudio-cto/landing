"use client";

import { useState, type ReactNode } from "react";

/** Titular en inglés sobre una tarjeta negra translúcida. Al pasar el cursor
 *  (o al tocarlo en móvil, o al enfocarlo con el teclado) la tarjeta gira y
 *  muestra su traducción al español en el reverso. Los dos idiomas están en
 *  el HTML, así que los buscadores y los lectores de pantalla leen ambos. */
export function FlipTitle({
  en,
  es,
  className = "",
}: {
  en: ReactNode;
  es: ReactNode;
  className?: string;
}) {
  const [turned, setTurned] = useState(false);

  // En equipos con ratón gira al pasar el cursor; el clic solo cuenta en táctiles.
  const toggle = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setTurned((v) => !v);
  };

  return (
    <button
      type="button"
      className={`flip ${className}`}
      aria-pressed={turned}
      onClick={toggle}
      title="Ver en español"
    >
      <span className="flip__card">
        <span className="flip__face flip__face--front" lang="en">
          <span className="gold">{en}</span>
        </span>
        <span className="flip__face flip__face--back" lang="es">
          <span className="gold">{es}</span>
        </span>
      </span>
    </button>
  );
}
