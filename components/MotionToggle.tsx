"use client";

import { setMotionOverride, useMotionOverride, useSystemReducedMotion } from "./hooks";

/** Solo aparece si el sistema pide menos movimiento: deja elegir a la persona. */
export function MotionToggle() {
  const system = useSystemReducedMotion();
  const on = useMotionOverride();
  if (!system) return null;
  return (
    <button type="button" className="motion-toggle" aria-pressed={on} onClick={() => {
        setMotionOverride(!on);
        window.location.reload();
      }}>
      {on ? "Pausar animaciones" : "Activar animaciones"}
    </button>
  );
}
