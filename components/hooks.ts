"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

// Si el sistema pide menos movimiento, la página arranca quieta y ofrece un
// botón para activar las animaciones. La elección se recuerda en el navegador.
const MOTION_KEY = "wm-motion";
let motionOn = false;
let motionLoaded = false;
const motionListeners = new Set<() => void>();

const loadMotion = () => {
  if (motionLoaded) return;
  motionLoaded = true;
  try {
    motionOn = window.localStorage.getItem(MOTION_KEY) === "on";
  } catch {
    motionOn = false;
  }
  document.documentElement.dataset.motion = motionOn ? "on" : "auto";
};

export const setMotionOverride = (on: boolean) => {
  motionOn = on;
  try {
    window.localStorage.setItem(MOTION_KEY, on ? "on" : "off");
  } catch {
    // Sin almacenamiento disponible: la elección vale solo para esta visita.
  }
  document.documentElement.dataset.motion = on ? "on" : "auto";
  motionListeners.forEach((listener) => listener());
};

export const useSystemReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

const subscribeMotion = (listener: () => void) => {
  loadMotion();
  motionListeners.add(listener);
  listener();
  return () => {
    motionListeners.delete(listener);
  };
};
const getMotion = () => motionOn;
const getServerMotion = () => false;

export function useMotionOverride() {
  return useSyncExternalStore(subscribeMotion, getMotion, getServerMotion);
}

export const useReducedMotion = () => {
  const system = useSystemReducedMotion();
  const override = useMotionOverride();
  return system && !override;
};

/** true mientras el elemento esté (al menos en parte) dentro de la pantalla. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
