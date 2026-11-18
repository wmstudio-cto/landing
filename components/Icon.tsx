import type { ReactNode } from "react";

// Iconografía propia de WM: trazo de 1.5 sobre una rejilla de 24, extremos
// redondeados. Un solo estilo para toda la página.
const paths = {
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8.5 3v4M15.5 3v4" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="12" height="10" rx="2.5" />
      <path d="m15 10.5 5.5-3v9l-5.5-3" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.500 10C19.500 15.4 12 20 12 20Z" />,
  studio: (
    <>
      <path d="M4 20V7.500l8-3.500 8 3.500V20M3 20h18" />
      <path d="M9.500 20v-6h5v6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  music: (
    <>
      <path d="M9 17.500V6l10-2v11.500" />
      <circle cx="6.500" cy="17.500" r="2.500" />
      <circle cx="16.500" cy="15.500" r="2.500" />
    </>
  ),
  lipstick: (
    <>
      <rect x="8" y="12" width="8" height="8.500" rx="1.500" />
      <path d="M10 12V7.500l4-3.500v8M8 15.500h8" />
    </>
  ),
  send: <path d="M21 3 10 14M21 3l-6.500 18-4.500-7-7-4.500L21 3Z" />,
  chat: <path d="M4 5h16v11H9.500L4 20V5ZM8 9.500h8M8 12.500h5" />,
  spark: <path d="m12 3 2.200 6.800L21 12l-6.800 2.200L12 21l-2.200-6.800L3 12l6.800-2.200L12 3Z" />,
  arrowRight: <path d="M4.500 12h15M13 5.500l6.500 6.500-6.500 6.500" />,
  arrowLeft: <path d="M19.500 12h-15M11 5.500 4.500 12l6.500 6.500" />,
  close: <path d="M5.500 5.500l13 13M18.500 5.500l-13 13" />,
  menu: <path d="M3.500 8.500h17M3.500 15.500h17" />,
  expand: <path d="M4 9.500V4h5.500M20 14.500V20h-5.500M4 4l6 6M20 20l-6-6" />,
  instagram: (
    <>
      <rect x="3.500" y="3.500" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.200" cy="6.800" r="0.600" fill="currentColor" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
