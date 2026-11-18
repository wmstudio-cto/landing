import { LOGO } from "../lib/logoPath";
import { GOLD_STOPS, palette } from "../lib/palette";

/** El trazado del logo real se define una sola vez en la página; cada <Logo>
 *  lo referencia, así el HTML no repite el dibujo. */
export function LogoSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wm-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={LOGO.width} y2={LOGO.height}>
          {GOLD_STOPS.map((s) => (
            <stop key={s.o} offset={s.o} stopColor={palette[s.k]} />
          ))}
        </linearGradient>
        <symbol id="wm-logo" viewBox={`0 0 ${LOGO.width} ${LOGO.height}`}>
          <path d={LOGO.d} fillRule="evenodd" />
        </symbol>
      </defs>
    </svg>
  );
}

export function Logo({
  size = 44,
  tone = "gold",
  className,
}: {
  size?: number;
  tone?: "gold" | "current";
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${LOGO.width} ${LOGO.height}`}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <use href="#wm-logo" fill={tone === "gold" ? "url(#wm-gold)" : "currentColor"} />
    </svg>
  );
}
