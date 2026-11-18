import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BgMesh, Finish, WordReveal, useExit } from "./layers";
import { manifesto as MANIFESTO_TEXT } from "../../lib/site";
import { clamp, theme } from "./theme";

// Esta composición no se reproduce sola: la página la recorre con el scroll.
export const MANIFESTO = { fps: 30, seconds: 10 } as const;
export const MANIFESTO_DURATION = MANIFESTO.fps * MANIFESTO.seconds;

const Denial: React.FC<{ word: string }> = ({ word }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);
  const exit = useExit(10);
  const wordIn = spring({ frame: frame - 8, fps, config: theme.spring.smooth });
  const strike = interpolate(frame, [fps * 0.9, fps * 1.35], [0, 1], { easing: theme.ease.out, ...clamp });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - exit,
        transform: `translateY(${-exit * base * 0.05}px)`,
      }}
    >
      <WordReveal
        text={MANIFESTO_TEXT.lead}
        style={{
          justifyContent: "center",
          fontFamily: theme.fonts.body,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          fontSize: base * 0.03,
          color: theme.colors.textDim,
        }}
      />
      <div
        style={{
          position: "relative",
          marginTop: base * 0.012,
          opacity: Math.min(1, wordIn) * (1 - strike * 0.55),
          transform: `translateY(${interpolate(wordIn, [0, 1], [base * 0.06, 0])}px) scale(${interpolate(wordIn, [0, 1], [0.92, 1])})`,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: Math.min(base * 0.24, width * 0.16),
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: theme.colors.text,
          }}
        >
          {word}
        </span>
        <div
          style={{
            position: "absolute",
            left: "-5%",
            right: "-5%",
            top: "58%",
            height: base * 0.011,
            borderRadius: base,
            background: theme.colors.primary,
            boxShadow: `0 0 ${base * 0.04}px ${theme.colors.glow}`,
            transformOrigin: "0 50%",
            transform: `scaleX(${strike})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Promise_: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);
  const head = spring({ frame, fps, config: theme.spring.smooth });
  const underline = interpolate(frame, [fps * 0.5, fps * 1.1], [0, 1], { easing: theme.ease.out, ...clamp });
  const float = Math.sin(frame / 30) * base * 0.003;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: width * 0.07 }}>
      <div
        style={{
          position: "relative",
          opacity: Math.min(1, head),
          transform: `translateY(${interpolate(head, [0, 1], [base * 0.07, 0]) + float}px) scale(${interpolate(head, [0, 1], [0.9, 1])})`,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 800,
            fontSize: Math.min(base * 0.15, width * 0.085),
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: theme.colors.text,
          }}
        >
          {MANIFESTO_TEXT.promise}
        </span>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -base * 0.012,
            height: base * 0.008,
            borderRadius: base,
            background: theme.colors.primary,
            boxShadow: `0 0 ${base * 0.04}px ${theme.colors.glow}`,
            transformOrigin: "0 50%",
            transform: `scaleX(${underline})`,
          }}
        />
      </div>
      <div style={{ marginTop: base * 0.07, display: "flex", flexDirection: "column", alignItems: "center", gap: base * 0.022 }}>
        {MANIFESTO_TEXT.lines.map((line, i) => {
          const p = spring({ frame: frame - fps * (1.2 + i * 0.75), fps, config: theme.spring.smooth });
          return (
            <div
              key={line}
              style={{
                opacity: Math.min(1, p),
                transform: `translateY(${interpolate(p, [0, 1], [base * 0.04, 0])}px) scale(${interpolate(p, [0, 1], [0.96, 1])})`,
                fontFamily: theme.fonts.body,
                fontWeight: 500,
                fontSize: base * 0.046,
                lineHeight: 1.2,
                textAlign: "center",
                maxWidth: width * 0.84,
                color: theme.colors.text,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Manifesto: React.FC = () => {
  const { fps } = useVideoConfig();
  const beat = Math.round(fps * 2.6);
  return (
    <AbsoluteFill>
      <BgMesh strength={0.8} />
      {MANIFESTO_TEXT.denials.map((word, i) => (
        <Sequence key={word} from={i * beat} durationInFrames={beat}>
          <Denial word={word} />
        </Sequence>
      ))}
      <Sequence from={MANIFESTO_TEXT.denials.length * beat}>
        <Promise_ />
      </Sequence>
      <Finish />
    </AbsoluteFill>
  );
};
