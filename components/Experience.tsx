"use client";

import { useEffect, useRef } from "react";
import type { Figure, FigureKey, Frame, Pose } from "./sculpture";

// Mezclas de forma: cinta, movimiento, arco, portal.
const RIBBON: Pose["w"] = [1, 0, 0, 0];
const FLOW: Pose["w"] = [0, 1, 0, 0];
const ARCH: Pose["w"] = [0, 0, 1, 0];
const PORTAL: Pose["w"] = [0, 0, 0, 1];

const PILLARS: FigureKey[] = ["pilar-1", "pilar-2", "pilar-3", "pilar-4"];
// En qué punto del recorrido de la escena 03 entra cada capítulo.
const PILLAR_AT = [0, 0.14, 0.4, 0.66];

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const mix = (a: Pose, b: Pose, k: number): Pose => ({
  w: [lerp(a.w[0], b.w[0], k), lerp(a.w[1], b.w[1], k), lerp(a.w[2], b.w[2], k), lerp(a.w[3], b.w[3], k)],
  x: lerp(a.x, b.x, k),
  y: lerp(a.y, b.y, k),
  size: lerp(a.size, b.size, k),
  rx: lerp(a.rx, b.rx, k),
  ry: lerp(a.ry, b.ry, k),
  rz: lerp(a.rz, b.rz, k),
  band: lerp(a.band, b.band, k),
  flat: lerp(a.flat, b.flat, k),
  fit: lerp(a.fit, b.fit, k),
  life: lerp(a.life, b.life, k),
  twist: lerp(a.twist ?? 0, b.twist ?? 0, k),
  alpha: lerp(a.alpha, b.alpha, k),
});

const NO_FIGURE: Figure = { key: null, x: 0, base: -1, height: 1, z: 0, light: 0, warm: 0, fit: 0, alpha: 0 };

/** Dirige la experiencia: enlaza el scroll con la escena 3D (escultura y
 *  modelos) y con las transiciones de cada escena. Todo lo pesado (Three.js,
 *  GSAP, Lenis) se descarga aparte, después de pintar la primera pantalla. */
export function Experience() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const live = root.classList.contains("live");
    const get = (selector: string) => document.querySelector<HTMLElement>(selector);
    const entrance = get("#inicio");
    const experience = get("#experiencia");
    const talents = get("#talentos");
    const transformation = get("#transformacion");
    const join = get("#unete");
    const frameEl = get(".xp__frame");
    const node = canvas.current;
    if (!node || !entrance || !experience || !talents || !transformation || !join) return;

    let disposed = false;
    const cleanups: Array<() => void> = [];

    // Avance de una escena fijada (0–1) y entrada de una escena en pantalla (0–1).
    const pinned = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 4 ? clamp(-r.top / span) : r.top < 0 ? 1 : 0;
    };
    const entered = (el: HTMLElement) => clamp((window.innerHeight - el.getBoundingClientRect().top) / window.innerHeight);

    // ---------- Storyboard ----------
    const target = (): { pose: Pose; figure: Figure } => {
      const narrow = window.innerWidth < 861;

      // 01 The Entrance: la cinta rodea a la modelo.
      const hero: Pose = narrow
        ? { w: RIBBON, x: 0.1, y: 0.24, size: 0.82, rx: 0.3, ry: 0, rz: 0.3, band: 0.5, flat: 0, fit: 0, life: 0.4, twist: 1.4, alpha: 1 }
        : { w: RIBBON, x: 0.42, y: -0.14, size: 1.3, rx: 0.3, ry: 0.05, rz: 0.42, band: 0.5, flat: 0, fit: 0, life: 0.4, twist: 1.4, alpha: 1 };
      const heroFigure: Figure = narrow
        ? { key: "entrada", x: 0.06, base: -0.2, height: 0.56, z: 0, light: 1, warm: 0.5, fit: 0, alpha: 1 }
        : { key: "entrada", x: 0.34, base: -1.02, height: 0.96, z: 0.3, light: 1, warm: 0.5, fit: 0, alpha: 1 };

      // 06 Join Whole: a un extremo, dejando sitio a la invitación.
      const closing: Pose = narrow
        ? { w: RIBBON, x: 0.25, y: 0.66, size: 0.72, rx: 0.3, ry: -0.9, rz: -0.2, band: 0.46, flat: 0, fit: 0, life: 0.6, alpha: 0.9 }
        : { w: RIBBON, x: 0.86, y: -0.05, size: 1.15, rx: 0.3, ry: -1.0, rz: -0.5, band: 0.5, flat: 0, fit: 0, life: 0.6, alpha: 1 };

      if (!live) {
        // Sin animación: la escena solo acompaña, quieta, la entrada y el cierre.
        if (entered(join) > 0.35) return { pose: { ...closing, life: 0 }, figure: NO_FIGURE };
        const gone = ease(entered(experience) * 2);
        return {
          pose: { ...hero, life: 0, alpha: 1 - gone },
          figure: { ...heroFigure, alpha: 1 - gone },
        };
      }

      // 02 The Golden Movement: al centro, cerca, girando, hasta llenar la pantalla.
      const p1 = pinned(entrance);
      const near: Pose = { w: FLOW, x: 0, y: 0, size: narrow ? 1.5 : 2.0, rx: 0.5, ry: 2.2, rz: -0.2, band: 0.62, flat: 0, fit: 0, life: 1, alpha: 1 };
      const full: Pose = { ...near, size: narrow ? 2.0 : 2.7, rx: 0.15, ry: 3.5, rz: 0.1 };
      let pose = mix(hero, near, ease(p1 / 0.62));
      pose = mix(pose, full, ease((p1 - 0.62) / 0.38));
      // La modelo vuelve a la oscuridad mientras la escultura toma el protagonismo.
      let figure: Figure = {
        ...heroFigure,
        light: 1 - ease(p1 / 0.2),
        alpha: 1 - ease((p1 - 0.1) / 0.16),
        z: heroFigure.z - p1 * 2,
      };

      // 03 The Whole Experience: la cinta se vuelve marco; dentro, una figura por capítulo.
      const e3 = entered(experience);
      if (e3 > 0) {
        const frame: Pose = { w: ARCH, x: 0.4, y: 0, size: 0.8, rx: 0, ry: 0, rz: 0, band: 0.15, flat: 1, fit: 1, life: 0, alpha: 1 };
        pose = mix(pose, frame, ease(e3));
        if (e3 > 0.55) {
          const p3 = pinned(experience);
          let index = 0;
          for (let i = 1; i < PILLAR_AT.length; i++) if (p3 >= PILLAR_AT[i]) index = i;
          // Cerca de cada cambio la luz baja: una figura se apaga y la siguiente emerge.
          let light = ease((e3 - 0.7) / 0.3);
          for (let i = 1; i < PILLAR_AT.length; i++) light = Math.min(light, ease(Math.abs(p3 - PILLAR_AT[i]) / 0.05));
          figure = { key: PILLARS[index], x: 0.4, base: -0.8, height: 0.7, z: -0.25, light, warm: 0.35, fit: 1, alpha: 1 };
        }
      }

      // 04 The Talents: la fotografía manda; la escena 3D se retira.
      const e4 = entered(talents);
      if (e4 > 0) {
        pose.alpha *= 1 - ease(e4 * 1.7);
        figure = { ...figure, alpha: figure.alpha * (1 - ease(e4 * 2.2)), light: figure.light * (1 - ease(e4 * 2.2)) };
      }

      // 05 The Transformation: el aro se abre y la modelo sale de la oscuridad a la luz.
      const e5 = entered(transformation);
      if (e5 > 0.02) {
        const p5 = pinned(transformation);
        const through = clamp(p5 / 0.8);
        pose = {
          w: PORTAL,
          x: narrow ? 0 : 0.22,
          y: 0.04,
          size: 0.42 + 0.2 * ease(e5) + 3.4 * through * through * through,
          rx: 0.12 * (1 - through),
          ry: 0.55 * (1 - ease(e5)),
          rz: 0,
          band: 0.26,
          // Casi de frente en todo el contorno: se lee como un aro completo.
          flat: 0.86,
          fit: 0,
          life: 0.35,
          alpha: ease((e5 - 0.3) / 0.5) * (1 - ease((p5 - 0.82) / 0.14)),
        };
        figure = {
          key: "portal",
          x: narrow ? 0 : 0.22,
          base: narrow ? -0.72 : -1.02,
          height: narrow ? 0.72 : 1.0,
          z: lerp(-2.4, 0, ease(p5 / 0.6)),
          light: ease((p5 - 0.18) / 0.5),
          warm: 1,
          fit: 0,
          alpha: ease((p5 - 0.04) / 0.16),
        };
      }

      // 06 Join Whole.
      const e6 = entered(join);
      if (e6 > 0.02) {
        const k = ease((e6 - 0.1) / 0.75);
        pose = { ...closing, x: closing.x + (1 - k) * 0.35, alpha: closing.alpha * k };
        figure = { ...figure, alpha: figure.alpha * (1 - ease(e6 * 2.4)), light: figure.light * (1 - ease(e6 * 2)) };
        if (e6 > 0.5) figure = NO_FIGURE;
      }
      return { pose, figure };
    };

    const frame = (): Frame | null => {
      if (!frameEl) return null;
      const r = frameEl.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    };

    // ---------- Escena 3D (Three.js) ----------
    const startSculpture = () => {
      import("./sculpture")
        .then(({ createSculpture }) => {
          if (disposed) return;
          const lite = window.innerWidth < 861 || window.matchMedia("(pointer: coarse)").matches;
          const sculpture = createSculpture(node, {
            lite,
            still: !live,
            target,
            frame,
            // Con la modelo ya en la escena 3D se retira la foto de respaldo.
            onFigure: () => root.classList.add("fx"),
          });
          cleanups.push(() => sculpture.dispose());
        })
        .catch(() => {
          // Sin WebGL la página sigue funcionando con las fotos normales.
          root.classList.add("no-3d");
        });
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(startSculpture);

    // ---------- Transiciones de escena (GSAP ScrollTrigger + Lenis) ----------
    if (live) {
      Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(
        ([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
          if (disposed) return;
          gsap.registerPlugin(ScrollTrigger);

          // Scroll con inercia en equipos con ratón.
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            const lenis = new Lenis({ lerp: 0.085, anchors: true });
            lenis.on("scroll", ScrollTrigger.update);
            const drive = (time: number) => lenis.raf(time * 1000);
            gsap.ticker.add(drive);
            gsap.ticker.lagSmoothing(0);
            cleanups.push(() => {
              gsap.ticker.remove(drive);
              lenis.destroy();
            });
          }

          const context = gsap.context(() => {
            const scrubbed = (trigger: HTMLElement) =>
              gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger, start: "top top", end: "bottom bottom", scrub: 0.7 },
              });

            // 01 → 02: el titular cede el sitio a la escultura.
            scrubbed(entrance)
              .to(".cue", { autoAlpha: 0, duration: 0.05 }, 0)
              .to(".hero__copy", { yPercent: -12, autoAlpha: 0, duration: 0.2 }, 0.03)
              .fromTo(".statement", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.44)
              .fromTo(
                ".statement__title",
                { y: 70, scale: 0.96 },
                { y: 0, scale: 1, duration: 0.22, ease: "power3.out" },
                0.44,
              )
              .to(".statement", { autoAlpha: 0, yPercent: -8, duration: 0.1 }, 0.9)
              .set({}, {}, 1);

            // 03: el capítulo activo se ilumina en la lista, al ritmo de las figuras.
            const items = gsap.utils.toArray<HTMLElement>(".xp__item");
            gsap.set(items.slice(1), { opacity: 0.26 });
            const story = scrubbed(experience);
            items.forEach((item, i) => {
              if (i === 0) return;
              story.to(items[i - 1], { opacity: 0.26, duration: 0.05 }, PILLAR_AT[i]).to(item, { opacity: 1, duration: 0.05 }, PILLAR_AT[i]);
            });
            story.set({}, {}, 1);
            gsap.from(".xp__copy > *", {
              y: 40,
              autoAlpha: 0,
              duration: 1.5,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: { trigger: experience, start: "top 45%" },
            });

            // 04: los retratos se desplazan en horizontal con el scroll.
            const track = get(".talents__track");
            if (track) {
              const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
              const fit = () => {
                talents.style.height = `${distance() + window.innerHeight}px`;
              };
              fit();
              ScrollTrigger.addEventListener("refreshInit", fit);
              cleanups.push(() => ScrollTrigger.removeEventListener("refreshInit", fit));
              gsap.to(track, {
                x: () => -distance(),
                ease: "none",
                scrollTrigger: { trigger: talents, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
              });
            }

            // 05: cuando la modelo ya está en la luz aparece el texto.
            scrubbed(transformation)
              .fromTo(
                ".portal__copy > *",
                { y: 46, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.14, stagger: 0.04, ease: "power2.out" },
                0.62,
              )
              .set({}, {}, 1);

            // 06 y preguntas: entradas suaves, una sola vez.
            gsap.from(".join__in", {
              y: 44,
              autoAlpha: 0,
              duration: 1.6,
              stagger: 0.14,
              ease: "power3.out",
              scrollTrigger: { trigger: join, start: "top 50%" },
            });
            gsap.from(".quiet__in", {
              y: 30,
              autoAlpha: 0,
              duration: 1.3,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: { trigger: ".quiet", start: "top 75%" },
            });
          });
          cleanups.push(() => context.revert());

          // Las fuentes cambian las medidas: se recalcula al terminar de cargar.
          document.fonts?.ready.then(() => !disposed && ScrollTrigger.refresh());

          // Si se llega con un ancla (#talentos…), se va a ella ahora que las
          // escenas ya tienen su altura definitiva.
          if (window.location.hash.length > 1) {
            const goal = document.getElementById(window.location.hash.slice(1));
            if (goal) requestAnimationFrame(() => goal.scrollIntoView());
          }
        },
      );
    }

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return <canvas ref={canvas} className="sculpture" aria-hidden="true" />;
}
