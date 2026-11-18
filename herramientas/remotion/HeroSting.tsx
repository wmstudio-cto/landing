import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BgMesh, Finish, LogoMark } from "./layers";
import { rgba, theme } from "./theme";

// Entrada (4 s) + bucle (24 s). Al terminar, la página vuelve al inicio del
// bucle, así que todo lo que respira usa ciclos enteros dentro de él.
export const HERO = { fps: 30, size: 1200, introSeconds: 4, loopSeconds: 24 } as const;
export const HERO_INTRO_FRAMES = HERO.introSeconds * HERO.fps;
export const HERO_DURATION = (HERO.introSeconds + HERO.loopSeconds) * HERO.fps;

export type HeroProps = { px: number; py: number };

const PHRASES = ["Live your dreams", "Whole Models Studio", "Medellín, Colombia"];

// El aro de luz arranca como un neón: parpadea y se queda encendido.
const flicker = (f: number) => (f < 4 ? 0 : f < 7 ? 0.85 : f < 10 ? 0.12 : f < 14 ? 0.95 : f < 17 ? 0.35 : 1);

export const HeroSting: React.FC<HeroProps> = ({ px, py }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = Math.min(width, height);
  const intro = HERO.introSeconds * fps;
  const loop = HERO.loopSeconds * fps;
  const t = ((frame - intro) / loop) * Math.PI * 2;

  const ringIn = spring({ frame: frame - 4, fps, config: theme.spring.smooth });
  const ringLight = flicker(frame) * (0.9 + Math.sin(t * 12) * 0.06);
  const ringSize = s * 0.72;
  const ringStroke = s * 0.009;
  const breathe = 1 + Math.sin(t * 8) * 0.006;

  const textIn = spring({ frame: frame - fps * 1.6, fps, config: theme.spring.smooth });
  const rotation = (frame / loop) * 360 - interpolate(textIn, [0, 1], [50, 0]);

  return (
    <AbsoluteFill>
      <BgMesh px={px} py={py} strength={0.8} />

      {/* Aro de luz */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: ringSize,
            height: ringSize,
            borderRadius: "50%",
            border: `${ringStroke}px solid ${theme.colors.accent}`,
            opacity: ringLight,
            transform: `translate(${-px * s * 0.008}px, ${-py * s * 0.008}px) scale(${interpolate(ringIn, [0, 1], [0.86, 1]) * breathe})`,
            boxShadow: [
              `0 0 ${s * 0.03}px ${rgba(theme.colors.accent, 0.6)}`,
              `0 0 ${s * 0.1}px ${rgba(theme.colors.primary, 0.42)}`,
              `inset 0 0 ${s * 0.03}px ${rgba(theme.colors.accent, 0.4)}`,
              `inset 0 0 ${s * 0.1}px ${rgba(theme.colors.primary, 0.22)}`,
            ].join(", "),
          }}
        />
      </AbsoluteFill>

      {/* Logo */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${px * s * 0.014}px, ${py * s * 0.014}px)`,
        }}
      >
        <LogoMark size={s * 0.46} delay={Math.round(fps * 0.5)} sheen={frame * (360 / loop) + px * 45} />
      </AbsoluteFill>

      {/* Texto que orbita */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 1000 1000" width={s} height={s} style={{ transform: `rotate(${rotation}deg)` }}>
          <defs>
            <path id="wm-orbit" d="M 500,58 a 442,442 0 1,1 -0.01,0" />
          </defs>
          {PHRASES.map((phrase, i) => {
            const p = spring({ frame: frame - fps * 1.6 - i * 6, fps, config: theme.spring.smooth });
            return (
              <text
                key={phrase}
                fill={theme.colors.textDim}
                opacity={Math.min(1, p)}
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: 600,
                  fontSize: 21,
                  letterSpacing: "0.34em",
                  textTransform: "uppercase",
                }}
              >
                <textPath href="#wm-orbit" startOffset={`${(i * 100) / PHRASES.length}%`}>
                  {phrase}
                </textPath>
              </text>
            );
          })}
        </svg>
      </AbsoluteFill>

      <Finish />
    </AbsoluteFill>
  );
};
