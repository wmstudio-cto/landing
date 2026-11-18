import React from "react";
import {
  AbsoluteFill,
  getRemotionEnvironment,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LOGO } from "../../lib/logoPath";
import { GOLD_STOPS } from "../../lib/palette";
import { clamp, rgba, theme } from "./theme";

/** Fondo: negro puro con dos halos dorados que derivan. Los bordes quedan en
 *  negro para que el Player se funda con la página. */
export const BgMesh: React.FC<{ px?: number; py?: number; strength?: number }> = ({
  px = 0,
  py = 0,
  strength = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height);
  const d1 = Math.sin(frame / 55) * s * 0.03;
  const d2 = Math.cos(frame / 70) * s * 0.025;
  const blob = (size: number, cx: number, cy: number, color: string, a: number): React.CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    left: cx - size / 2,
    top: cy - size / 2,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${rgba(color, a)}, transparent 64%)`,
  });
  return (
    <AbsoluteFill style={{ background: theme.colors.bg }}>
      <div style={blob(s * 0.92, width / 2 + d1 + px * s * 0.04, height / 2 + py * s * 0.04, theme.colors.primary, 0.2 * strength)} />
      <div style={blob(s * 0.6, width / 2 - s * 0.16 - d2, height / 2 + s * 0.14 + d1, theme.colors.goldDeep, 0.24 * strength)} />
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.primary, mixBlendMode: "soft-light", opacity: 0.2 }} />
  </AbsoluteFill>
);

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: NOISE,
        backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.07,
        mixBlendMode: "overlay",
      }}
    />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, transparent 52%, ${theme.colors.bg} 100%)`,
    }}
  />
);

/** Las capas superiores, siempre en este orden. En la web (Player) se omiten
 *  el grano y el etalonaje: son mezclas a pantalla completa en cada fotograma
 *  y sobre negro casi no se notan; se reservan para los renders del CLI. */
export const Finish: React.FC = () => {
  const { isPlayer } = getRemotionEnvironment();
  return (
    <>
      {!isPlayer && <Grade />}
      {!isPlayer && <Grain />}
      <Vignette />
    </>
  );
};

export const Entrance: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring.smooth });
  return (
    <div
      style={{
        opacity: Math.min(1, p),
        transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const WordReveal: React.FC<{ text: string; delay?: number; per?: number; style?: React.CSSProperties }> = ({
  text,
  delay = 0,
  per = 3,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.28em", ...style }}>
      {text.split(" ").map((word, i) => {
        const p = spring({ frame: frame - delay - i * per, fps, config: theme.spring.snappy });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p),
              transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Salida de escena: más rápida que la entrada. Devuelve 0 → 1. */
export const useExit = (frames = 10) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - frames - 2, durationInFrames - 2], [0, 1], {
    easing: theme.ease.in,
    ...clamp,
  });
};

/** El logo real de WM (trazado en logoPath.ts): entra girando y se revela
 *  con un círculo que se abre desde el centro, como un diafragma. */
export const LogoMark: React.FC<{ size: number; delay?: number; sheen?: number }> = ({
  size,
  delay = 0,
  sheen = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = `wm${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const pop = spring({ frame: frame - delay, fps, config: theme.spring.smooth });
  const iris = interpolate(frame - delay, [0, fps * 1.2], [0, 1], { easing: theme.ease.out, ...clamp });
  const cx = LOGO.width / 2;
  const cy = LOGO.height / 2;
  return (
    <svg
      viewBox={`0 0 ${LOGO.width} ${LOGO.height}`}
      width={size}
      height={size}
      style={{
        overflow: "visible",
        opacity: Math.max(0, Math.min(1, pop * 1.6)),
        transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])}) rotate(${interpolate(pop, [0, 1], [-28, 0])}deg)`,
        filter: `drop-shadow(0 0 ${size * 0.05}px ${theme.colors.glow})`,
      }}
    >
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={LOGO.width}
          y2={LOGO.height}
          gradientTransform={`rotate(${sheen} ${cx} ${cy})`}
        >
          {GOLD_STOPS.map((s) => (
            <stop key={s.o} offset={s.o} stopColor={theme.colors[s.k]} />
          ))}
        </linearGradient>
        <clipPath id={`${id}c`}>
          <circle cx={cx} cy={cy} r={iris * LOGO.width * 0.72} />
        </clipPath>
      </defs>
      <path d={LOGO.d} fill={`url(#${id})`} fillRule="evenodd" clipPath={iris < 1 ? `url(#${id}c)` : undefined} />
    </svg>
  );
};
