import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BgMesh, Finish, useExit } from "./layers";
import { GOLD_STOPS } from "../../lib/palette";
import { clamp, rgba, theme } from "./theme";

// Una viñeta en bucle por cada cosa que ofrece WM. Lienzo de 900 x 900 que la
// página recorta en círculo, así que todo vive dentro de un radio de ~310.
export const TOPIC = { fps: 30, size: 900, seconds: 6 } as const;
export const TOPIC_DURATION = TOPIC.fps * TOPIC.seconds;
export const TOPICS = ["espacios", "tecnologia", "presencia", "sensualidad", "makeup", "bienestar"] as const;
export type Topic = (typeof TOPICS)[number];
export type TopicProps = { topic: Topic };

const C = 450;
const STAGE_SCALE = 1.28; // las escenas se dibujan en un radio de ~290 y se amplían al círculo
const c = theme.colors;
const unit = (v: number) => Math.max(0, Math.min(1, v));

const useSp = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return {
    frame,
    fps,
    sp: (delay: number, config: { damping: number; stiffness: number; mass: number } = theme.spring.smooth) =>
      spring({ frame: frame - delay, fps, config }),
  };
};

const flicker = (f: number) => (f < 0 ? 0 : f < 3 ? 0.9 : f < 6 ? 0.1 : f < 10 ? 1 : f < 13 ? 0.3 : 1);

/** Espacios: el aviso de neón del estudio se enciende. */
const Espacios: React.FC = () => {
  const { frame, fps, sp } = useSp();
  const on = flicker(frame - 6);
  const ring = unit(sp(fps * 0.7));
  const glow = 0.85 + Math.sin(frame / 22) * 0.15;
  return (
    <>
      <circle
        cx={C}
        cy={C}
        r={262}
        fill="none"
        stroke={c.primary}
        strokeWidth={5}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - ring}
        opacity={ring > 0.002 ? 1 : 0}
        transform={`rotate(-90 ${C} ${C})`}
      />
      <g
        opacity={on}
        style={{ filter: `drop-shadow(0 0 10px ${c.accent}) drop-shadow(0 0 ${38 * glow}px ${rgba(c.accent, 0.7)})` }}
      >
        <polyline
          points="292,340 372,570 450,404 528,570 608,340"
          fill="none"
          stroke={c.accent}
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <ellipse cx={C} cy={672} rx={150} ry={12} fill={c.accent} opacity={0.1 * on * glow} />
    </>
  );
};

/** Tecnología: un lente enfoca y aparece el 4K. */
const Tecnologia: React.FC = () => {
  const { frame, fps, sp } = useSp();
  const rings = [
    { r: 250, w: 2 },
    { r: 196, w: 7 },
    { r: 150, w: 2 },
  ];
  const focus = sp(fps * 0.9, theme.spring.snappy);
  const label = sp(fps * 1.1, theme.spring.bouncy);
  const turn = interpolate(sp(4), [0, 1], [-80, 0]) + Math.sin(frame / 40) * 4;
  const corner = 214;
  const arm = 46;
  return (
    <>
      {rings.map((r, i) => {
        const p = sp(i * 4, theme.spring.bouncy);
        return (
          <circle
            key={r.r}
            r={r.r}
            fill="none"
            stroke={c.text}
            strokeWidth={r.w}
            opacity={unit(p) * (i === 1 ? 0.9 : 0.4)}
            transform={`translate(${C} ${C}) scale(${interpolate(p, [0, 1], [0.6, 1])})`}
          />
        );
      })}
      <g transform={`translate(${C} ${C}) rotate(${turn})`} opacity={unit(sp(8)) * 0.55}>
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={150} y1={0} x2={-10} y2={118} stroke={c.text} strokeWidth={2} transform={`rotate(${i * 60})`} />
        ))}
      </g>
      <text
        x={C}
        y={C}
        textAnchor="middle"
        dominantBaseline="central"
        fill={c.text}
        opacity={unit(label)}
        transform={`translate(${C} ${C}) scale(${interpolate(label, [0, 1], [0.7, 1])}) translate(${-C} ${-C})`}
        style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 96, letterSpacing: "-0.04em" }}
      >
        4K
      </text>
      <g
        opacity={unit(focus)}
        transform={`translate(${C} ${C}) scale(${interpolate(focus, [0, 1], [1.28, 1])})`}
        fill="none"
        stroke={c.primary}
        strokeWidth={6}
        strokeLinecap="round"
      >
        {[
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ].map(([sx, sy]) => (
          <polyline
            key={`${sx}${sy}`}
            points={`${sx * (corner - arm)},${sy * corner} ${sx * corner},${sy * corner} ${sx * corner},${sy * (corner - arm)}`}
          />
        ))}
      </g>
    </>
  );
};

/** Presencia: el 55 % de la comunicación es cómo lo transmites. */
const Presencia: React.FC = () => {
  const { frame, fps, sp } = useSp();
  const p = unit(sp(10, theme.spring.count));
  const label = sp(fps * 0.9);
  const breathe = 1 + Math.sin(frame / 22) * 0.012;
  return (
    <g transform={`translate(${C} ${C}) scale(${breathe}) translate(${-C} ${-C})`}>
      <circle cx={C} cy={C} r={256} fill="none" stroke={rgba(c.text, 0.14)} strokeWidth={10} />
      <circle
        cx={C}
        cy={C}
        r={256}
        fill="none"
        stroke={c.primary}
        strokeWidth={10}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - 0.55 * p}
        opacity={p > 0.002 ? 1 : 0}
        transform={`rotate(-90 ${C} ${C})`}
        style={{ filter: `drop-shadow(0 0 14px ${c.glow})` }}
      />
      <text
        x={C}
        y={C - 16}
        textAnchor="middle"
        dominantBaseline="central"
        fill={c.text}
        style={{ fontFamily: theme.fonts.display, fontWeight: 800, fontSize: 150, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.05em" }}
      >
        {Math.round(55 * p)}%
      </text>
      <text
        x={C}
        y={C + 112}
        textAnchor="middle"
        fill={c.textDim}
        opacity={unit(label)}
        transform={`translate(0 ${interpolate(label, [0, 1], [18, 0])})`}
        style={{ fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 26 }}
      >
        es cómo lo transmites
      </text>
    </g>
  );
};

/** Sensualidad y baile: líneas que se mueven como un cuerpo. */
const Sensualidad: React.FC = () => {
  const { frame, sp } = useSp();
  const x0 = 170;
  const x1 = 730;
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => {
        const p = unit(sp(i * 4));
        const main = i === 3;
        let d = "";
        for (let x = x0; x <= x1; x += 14) {
          const env = Math.sin((Math.PI * (x - x0)) / (x1 - x0));
          const y = C + (i - 3) * 30 + 52 * p * env * Math.sin(x / 95 + frame / 16 + i * 0.45);
          d += `${x === x0 ? "M" : "L"}${x} ${y.toFixed(1)} `;
        }
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={main ? c.primary : c.text}
            strokeWidth={main ? 5 : 2}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
            opacity={p > 0.002 ? (main ? 1 : 0.55 - Math.abs(i - 3) * 0.1) : 0}
          />
        );
      })}
    </>
  );
};

/** Makeup class: una pasada de brocha y sus tonos. */
const Makeup: React.FC = () => {
  const { frame, fps, sp } = useSp();
  const swipe = interpolate(frame, [6, fps * 1.1], [0, 1], { easing: theme.ease.out, ...clamp });
  const star = sp(fps * 1.2, theme.spring.bouncy);
  const tones = [c.text, c.textDim, c.bgAlt];
  return (
    <>
      <defs>
        <linearGradient id="wm-swipe" gradientUnits="userSpaceOnUse" x1="220" y1="300" x2="680" y2="460">
          {GOLD_STOPS.map((s) => (
            <stop key={s.o} offset={s.o} stopColor={c[s.k]} />
          ))}
        </linearGradient>
      </defs>
      <path
        d="M 250 410 C 340 300, 460 480, 650 350"
        fill="none"
        stroke="url(#wm-swipe)"
        strokeWidth={86}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - swipe}
        opacity={swipe > 0.002 ? 1 : 0}
      />
      {tones.map((tone, i) => {
        const p = sp(fps * 0.8 + i * 5, theme.spring.bouncy);
        return (
          <circle
            key={i}
            r={44}
            fill={tone}
            stroke={c.text}
            strokeWidth={2}
            opacity={unit(p)}
            transform={`translate(${C - 120 + i * 120} ${590 + interpolate(p, [0, 1], [40, 0]) + Math.sin(frame / 26 + i) * 4}) scale(${interpolate(p, [0, 1], [0.5, 1])})`}
          />
        );
      })}
      <path
        d="M0 -34 L8 -8 L34 0 L8 8 L0 34 L-8 8 L-34 0 L-8 -8 Z"
        fill={c.accent}
        opacity={unit(star)}
        transform={`translate(660 262) rotate(${Math.sin(frame / 30) * 12}) scale(${interpolate(star, [0, 1], [0.2, 1])})`}
      />
    </>
  );
};

/** Bienestar y acompañamiento: dos puntos que giran juntos, con calma. */
const Bienestar: React.FC = () => {
  const { frame, fps, sp } = useSp();
  const enter = sp(4);
  const period = fps * 4;
  const orbit = interpolate(enter, [0, 1], [0, 120]);
  const a = frame / 34;
  const ax = C + Math.cos(a) * orbit;
  const ay = C + Math.sin(a) * orbit;
  const bx = C - Math.cos(a) * orbit;
  const by = C - Math.sin(a) * orbit;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const phase = ((frame + (i * period) / 3) % period) / period;
        const r = interpolate(phase, [0, 1], [50, 290], { easing: theme.ease.out, ...clamp });
        return (
          <circle
            key={i}
            cx={C}
            cy={C}
            r={r}
            fill="none"
            stroke={c.text}
            strokeWidth={2}
            opacity={(1 - phase) * 0.45 * unit(enter)}
          />
        );
      })}
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={c.text} strokeWidth={2} opacity={0.5 * unit(enter)} />
      <circle cx={bx} cy={by} r={18 * unit(sp(10, theme.spring.bouncy))} fill={c.text} />
      <circle
        cx={ax}
        cy={ay}
        r={18 * unit(sp(6, theme.spring.bouncy))}
        fill={c.primary}
        style={{ filter: `drop-shadow(0 0 16px ${c.glow})` }}
      />
    </>
  );
};

const SCENES: Record<Topic, React.FC> = {
  espacios: Espacios,
  tecnologia: Tecnologia,
  presencia: Presencia,
  sensualidad: Sensualidad,
  makeup: Makeup,
  bienestar: Bienestar,
};

export const TopicScene: React.FC<TopicProps> = ({ topic }) => {
  const exit = useExit(10);
  const Scene = SCENES[topic];
  return (
    <AbsoluteFill>
      <BgMesh strength={0.75} />
      <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 - exit * 0.06})` }}>
        <svg viewBox="0 0 900 900" width="100%" height="100%">
          <g transform={`translate(${C} ${C}) scale(${STAGE_SCALE}) translate(${-C} ${-C})`}>
            <Scene />
          </g>
        </svg>
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};
